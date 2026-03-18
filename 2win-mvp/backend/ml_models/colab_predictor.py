"""
Colab ML Model Integration
Calls external ML model hosted on Google Colab for diabetes prediction
"""

import httpx
import json
from typing import Dict, List, Optional
from datetime import datetime

class ColabDiabetesPredictor:
    """
    Diabetes prediction using external ML model from Colab
    """
    
    def __init__(self):
        # Colab notebook URL (you'll need to deploy this as REST API)
        self.colab_api_url = "https://your-colab-app-url.herokuapp.com/predict"
        self.fallback_enabled = True
    
    async def predict_diabetes_risk(self, user_data: Dict, recent_readings: List[Dict]) -> Dict:
        """
        Predict diabetes risk using Colab ML model
        
        Args:
            user_data: User profile (age, weight, height, etc.)
            recent_readings: Recent sensor readings
            
        Returns:
            Dict with risk score and contributing factors
        """
        try:
            # Prepare data for Colab model
            model_input = self._prepare_model_input(user_data, recent_readings)
            
            # Call Colab API
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.colab_api_url,
                    json=model_input,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    prediction = response.json()
                    return self._format_prediction_response(prediction)
                else:
                    print(f"Colab API error: {response.status_code}")
                    return self._fallback_prediction(user_data, recent_readings)
                    
        except Exception as e:
            print(f"Error calling Colab API: {str(e)}")
            return self._fallback_prediction(user_data, recent_readings)
    
    def _prepare_model_input(self, user_data: Dict, readings: List[Dict]) -> Dict:
        """Prepare data in format expected by Colab model"""
        
        # Extract features from readings
        features = {
            'age': user_data.get('age', 0),
            'height': user_data.get('height', 0),
            'weight': user_data.get('weight', 0),
            'bmi': self._calculate_bmi(user_data),
        }
        
        # Add recent sensor data
        for reading in readings:
            metric = reading.get('metric')
            value = reading.get('value')
            
            if metric == 'blood_glucose':
                features['avg_glucose'] = value
            elif metric == 'heart_rate':
                features['heart_rate'] = value
            elif metric == 'body_temperature':
                features['body_temp'] = value
            elif metric == 'steps_per_minute':
                features['activity_level'] = value
        
        return features
    
    def _calculate_bmi(self, user_data: Dict) -> float:
        """Calculate BMI from user data"""
        height = user_data.get('height', 0)  # cm
        weight = user_data.get('weight', 0)  # kg
        
        if not height or not weight:
            return 0.0
        
        height_m = height / 100
        return round(weight / (height_m ** 2), 1)
    
    def _format_prediction_response(self, colab_response: Dict) -> Dict:
        """Format Colab response to match expected format"""
        return {
            'risk_score': colab_response.get('risk_score', 50),
            'risk_level': self._get_risk_level(colab_response.get('risk_score', 50)),
            'contributing_factors': colab_response.get('factors', ['ML model prediction']),
            'recommendations': colab_response.get('recommendations', ['Consult healthcare provider']),
            'confidence': colab_response.get('confidence', 0.85),
            'last_updated': datetime.now().isoformat(),
            'data_points_analyzed': colab_response.get('data_points', 0),
            'model_version': 'colab_v1.0'
        }
    
    def _fallback_prediction(self, user_data: Dict, readings: List[Dict]) -> Dict:
        """Fallback prediction if Colab API fails"""
        if not self.fallback_enabled:
            return {
                'risk_score': 50,
                'risk_level': 'medium',
                'contributing_factors': ['ML model unavailable'],
                'recommendations': ['Please check ML model service'],
                'confidence': 0.0,
                'last_updated': datetime.now().isoformat(),
                'data_points_analyzed': 0,
                'model_version': 'fallback'
            }
        
        # Simple rule-based fallback
        bmi = self._calculate_bmi(user_data)
        age = user_data.get('age', 0)
        
        risk_score = 30  # Base risk
        
        # BMI factor
        if bmi >= 30:
            risk_score += 25
        elif bmi >= 25:
            risk_score += 15
        
        # Age factor
        if age >= 65:
            risk_score += 20
        elif age >= 45:
            risk_score += 10
        
        # Check glucose readings
        glucose_readings = [r['value'] for r in readings if r.get('metric') == 'blood_glucose']
        if glucose_readings:
            avg_glucose = sum(glucose_readings) / len(glucose_readings)
            if avg_glucose >= 126:
                risk_score += 30
            elif avg_glucose >= 100:
                risk_score += 15
        
        risk_score = min(95, max(5, risk_score))
        
        return {
            'risk_score': risk_score,
            'risk_level': self._get_risk_level(risk_score),
            'contributing_factors': [f'BMI: {bmi}', f'Age: {age}'],
            'recommendations': ['Monitor health metrics', 'Maintain healthy lifestyle'],
            'confidence': 0.6,  # Lower confidence for fallback
            'last_updated': datetime.now().isoformat(),
            'data_points_analyzed': len(readings),
            'model_version': 'fallback_rule_based'
        }
    
    def _get_risk_level(self, risk_score: int) -> str:
        """Convert risk score to risk level"""
        if risk_score < 30:
            return "low"
        elif risk_score < 70:
            return "medium"
        else:
            return "high"

# Global predictor instance
colab_predictor = ColabDiabetesPredictor()
