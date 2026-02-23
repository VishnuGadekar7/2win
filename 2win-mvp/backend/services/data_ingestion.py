"""
Data Ingestion Service
Processes IoT device data and triggers ML predictions
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from database import db
from ml_models.diabetes_predictor import diabetes_predictor

class DataIngestionService:
    """Service for ingesting IoT device data and running predictions"""
    
    def __init__(self):
        self.prediction_interval_hours = 6  # Run predictions every 6 hours
        self.min_data_points = 10  # Minimum data points for prediction
    
    async def process_device_readings(self, readings_data: List[Dict]) -> bool:
        """
        Process batch of readings from IoT devices
        
        Args:
            readings_data: List of reading objects from devices
            
        Returns:
            bool: Success status
        """
        try:
            # Validate and store readings
            stored_readings = []
            
            for reading in readings_data:
                if self._validate_reading(reading):
                    # Store in database
                    result = await db.create_reading(reading)
                    if result:
                        stored_readings.append(reading)
            
            print(f"✅ Stored {len(stored_readings)} readings")
            
            # Trigger prediction if enough data
            await self._check_and_trigger_predictions(stored_readings)
            
            return True
            
        except Exception as e:
            print(f"❌ Error processing readings: {str(e)}")
            return False
    
    async def get_user_health_summary(self, user_id: str) -> Dict:
        """
        Get comprehensive health summary for user
        
        Args:
            user_id: User identifier
            
        Returns:
            Dict with health metrics and predictions
        """
        try:
            # Get user profile
            user_data = await db.get_user(user_id)
            if not user_data:
                return {"error": "User not found"}
            
            # Get recent readings (last 24 hours)
            recent_readings = await db.get_recent_readings(
                user_id, 
                hours=24
            )
            
            # Get latest predictions
            latest_predictions = await db.get_latest_predictions(user_id, limit=5)
            
            # Generate new prediction if needed
            if len(recent_readings) >= self.min_data_points:
                latest_prediction = await self._generate_diabetes_prediction(
                    user_data, recent_readings
                )
                
                if latest_prediction:
                    # Store prediction
                    await db.create_prediction({
                        'user_id': user_id,
                        'model_version': 'diabetes_v1.0',
                        'ts': datetime.now(),
                        'prediction_type': 'diabetes_risk_score',
                        'value': latest_prediction['risk_score'],
                        'confidence': latest_prediction['confidence'],
                        'explanation': json.dumps(latest_prediction)
                    })
            
            # Calculate health metrics
            health_metrics = self._calculate_health_metrics(recent_readings)
            
            # Generate alerts for abnormal readings
            alerts = await self._generate_health_alerts(
                user_id, recent_readings, health_metrics
            )
            
            return {
                'user_profile': {
                    'age': user_data.get('age'),
                    'bmi': self._calculate_bmi(user_data),
                    'last_updated': user_data.get('updated_at')
                },
                'health_metrics': health_metrics,
                'recent_readings_count': len(recent_readings),
                'alerts': alerts,
                'prediction_summary': diabetes_predictor.get_prediction_summary(
                    latest_predictions
                ) if latest_predictions else None
            }
            
        except Exception as e:
            print(f"❌ Error generating health summary: {str(e)}")
            return {"error": str(e)}
    
    async def _generate_diabetes_prediction(self, user_data: Dict, 
                                       readings: List[Dict]) -> Optional[Dict]:
        """Generate diabetes prediction using ML model"""
        try:
            prediction = diabetes_predictor.predict_diabetes_risk(user_data, readings)
            print(f"🤖 Generated diabetes prediction: {prediction['risk_score']}%")
            return prediction
        except Exception as e:
            print(f"❌ Error generating prediction: {str(e)}")
            return None
    
    async def _check_and_trigger_predictions(self, new_readings: List[Dict]):
        """Check if predictions should be triggered"""
        if not new_readings:
            return
        
        # Get unique users from readings
        user_ids = list(set(reading.get('user_id') for reading in new_readings))
        
        for user_id in user_ids:
            if not user_id:
                continue
                
            # Check if user has enough recent data
            recent_count = await db.count_recent_readings(user_id, hours=6)
            
            if recent_count >= self.min_data_points:
                # Get user data and generate prediction
                user_data = await db.get_user(user_id)
                recent_readings = await db.get_recent_readings(user_id, hours=6)
                
                prediction = await self._generate_diabetes_prediction(
                    user_data, recent_readings
                )
                
                if prediction:
                    await db.create_prediction({
                        'user_id': user_id,
                        'model_version': 'diabetes_v1.0',
                        'ts': datetime.now(),
                        'prediction_type': 'diabetes_risk_score',
                        'value': prediction['risk_score'],
                        'confidence': prediction['confidence'],
                        'explanation': json.dumps(prediction)
                    })
    
    def _validate_reading(self, reading: Dict) -> bool:
        """Validate reading data structure"""
        required_fields = ['device_id', 'metric', 'value', 'unit', 'ts']
        
        for field in required_fields:
            if field not in reading:
                print(f"❌ Invalid reading: missing {field}")
                return False
        
        # Validate metric type
        valid_metrics = [
            'body_temperature', 'ambient_temperature', 'ambient_humidity',
            'steps_per_minute', 'activity_intensity', 'device_battery',
            'signal_strength', 'heart_rate', 'blood_pressure',
            'blood_glucose', 'oxygen_saturation', 'steps'
        ]
        
        if reading['metric'] not in valid_metrics:
            print(f"❌ Invalid metric: {reading['metric']}")
            return False
        
        # Validate value is numeric
        try:
            float(reading['value'])
        except (ValueError, TypeError):
            print(f"❌ Invalid value: {reading['value']}")
            return False
        
        return True
    
    def _calculate_health_metrics(self, readings: List[Dict]) -> Dict:
        """Calculate health metrics from readings"""
        metrics = {}
        
        # Group readings by metric
        readings_by_metric = {}
        for reading in readings:
            metric = reading['metric']
            if metric not in readings_by_metric:
                readings_by_metric[metric] = []
            readings_by_metric[metric].append(reading['value'])
        
        # Calculate statistics for each metric
        for metric, values in readings_by_metric.items():
            if values:
                metrics[metric] = {
                    'current': values[-1],  # Latest value
                    'average': sum(values) / len(values),
                    'min': min(values),
                    'max': max(values),
                    'trend': self._calculate_trend(values),
                    'unit': next(
                        (r['unit'] for r in readings if r['metric'] == metric),
                        'unknown'
                    )
                }
        
        return metrics
    
    def _calculate_trend(self, values: List[float]) -> str:
        """Calculate trend from values"""
        if len(values) < 3:
            return 'stable'
        
        # Simple linear regression for trend
        n = len(values)
        x = list(range(n))
        
        # Calculate slope
        x_mean = sum(x) / n
        y_mean = sum(values) / n
        
        numerator = sum((x[i] - x_mean) * (values[i] - y_mean) for i in range(n))
        denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
        
        if denominator == 0:
            return 'stable'
        
        slope = numerator / denominator
        
        # Determine trend based on slope
        if slope > 0.1:
            return 'increasing'
        elif slope < -0.1:
            return 'decreasing'
        else:
            return 'stable'
    
    async def _generate_health_alerts(self, user_id: str, readings: List[Dict], 
                                   metrics: Dict) -> List[Dict]:
        """Generate health alerts based on readings"""
        alerts = []
        
        # Check for critical readings
        for metric, data in metrics.items():
            current_value = data['current']
            
            # Temperature alerts
            if metric == 'body_temperature':
                if current_value > 100.5 or current_value < 96.0:
                    alerts.append({
                        'user_id': user_id,
                        'type': 'critical',
                        'message': f"Abnormal body temperature: {current_value:.1f}°F",
                        'timestamp': datetime.now()
                    })
                elif current_value > 99.0 or current_value < 97.5:
                    alerts.append({
                        'user_id': user_id,
                        'type': 'warning',
                        'message': f"Slightly abnormal body temperature: {current_value:.1f}°F",
                        'timestamp': datetime.now()
                    })
            
            # Heart rate alerts
            elif metric == 'heart_rate':
                if current_value > 120 or current_value < 40:
                    alerts.append({
                        'user_id': user_id,
                        'type': 'critical',
                        'message': f"Abnormal heart rate: {current_value:.0f} BPM",
                        'timestamp': datetime.now()
                    })
                elif current_value > 100 or current_value < 50:
                    alerts.append({
                        'user_id': user_id,
                        'type': 'warning',
                        'message': f"Elevated/low heart rate: {current_value:.0f} BPM",
                        'timestamp': datetime.now()
                    })
            
            # Blood glucose alerts
            elif metric == 'blood_glucose':
                if current_value > 250:
                    alerts.append({
                        'user_id': user_id,
                        'type': 'critical',
                        'message': f"Very high blood glucose: {current_value:.0f} mg/dL",
                        'timestamp': datetime.now()
                    })
                elif current_value > 140:
                    alerts.append({
                        'user_id': user_id,
                        'type': 'warning',
                        'message': f"High blood glucose: {current_value:.0f} mg/dL",
                        'timestamp': datetime.now()
                    })
            
            # Battery alerts
            elif metric == 'device_battery':
                if current_value < 10:
                    alerts.append({
                        'user_id': user_id,
                        'type': 'warning',
                        'message': f"Device battery low: {current_value:.0f}%",
                        'timestamp': datetime.now()
                    })
        
        # Store alerts in database
        for alert in alerts:
            await db.create_medical_alert(alert)
        
        return alerts
    
    def _calculate_bmi(self, user_data: Dict) -> Optional[float]:
        """Calculate BMI from user data"""
        height = user_data.get('height')  # cm
        weight = user_data.get('weight')  # kg
        
        if not height or not weight:
            return None
        
        height_m = height / 100
        return round(weight / (height_m ** 2), 1)

# Global service instance
data_service = DataIngestionService()
