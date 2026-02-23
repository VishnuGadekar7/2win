"""
Diabetes Prediction Model
Uses sensor data to predict diabetes risk based on medical guidelines
"""

import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import json

class DiabetesPredictor:
    """
    Diabetes Risk Prediction Model
    Based on ADA (American Diabetes Association) guidelines
    """
    
    def __init__(self):
        # Risk factors and their weights
        self.risk_factors = {
            'elevated_fasting_glucose': 0.4,
            'high_blood_pressure': 0.3,
            'family_history': 0.2,
            'obesity': 0.3,
            'sedentary_lifestyle': 0.2,
            'age_risk': 0.15,
            'abdominal_obesity': 0.25,
            'irregular_activity': 0.1
        }
        
        # Thresholds for risk assessment
        self.thresholds = {
            'fasting_glucose_normal': 100,  # mg/dL
            'fasting_glucose_prediabetes': 126,  # mg/dL
            'fasting_glucose_diabetes': 126,  # mg/dL
            'bmi_normal': 25,
            'bmi_overweight': 30,
            'blood_pressure_normal': 120/80,
            'activity_min_daily': 30,  # minutes
        }
    
    def predict_diabetes_risk(self, user_data: Dict, recent_readings: List[Dict]) -> Dict:
        """
        Predict diabetes risk score (0-100)
        
        Args:
            user_data: User profile (age, weight, height, etc.)
            recent_readings: Recent sensor readings
            
        Returns:
            Dict with risk score and contributing factors
        """
        risk_score = 0.0
        contributing_factors = []
        
        # 1. Analyze glucose readings
        glucose_risk, glucose_factors = self._analyze_glucose_risk(recent_readings)
        risk_score += glucose_risk
        contributing_factors.extend(glucose_factors)
        
        # 2. Analyze BMI
        bmi_risk, bmi_factors = self._analyze_bmi_risk(user_data)
        risk_score += bmi_risk
        contributing_factors.extend(bmi_factors)
        
        # 3. Analyze age
        age_risk, age_factors = self._analyze_age_risk(user_data)
        risk_score += age_risk
        contributing_factors.extend(age_factors)
        
        # 4. Analyze activity patterns
        activity_risk, activity_factors = self._analyze_activity_risk(recent_readings)
        risk_score += activity_risk
        contributing_factors.extend(activity_factors)
        
        # 5. Analyze body temperature patterns
        temp_risk, temp_factors = self._analyze_temperature_risk(recent_readings)
        risk_score += temp_risk
        contributing_factors.extend(temp_factors)
        
        # Normalize to 0-100 scale
        final_risk = min(95, max(5, int(risk_score * 10)))
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            final_risk, contributing_factors, user_data, recent_readings
        )
        
        return {
            'risk_score': final_risk,
            'risk_level': self._get_risk_level(final_risk),
            'contributing_factors': contributing_factors,
            'recommendations': recommendations,
            'confidence': 0.85,  # Model confidence
            'last_updated': datetime.now().isoformat(),
            'data_points_analyzed': len(recent_readings)
        }
    
    def _analyze_glucose_risk(self, readings: List[Dict]) -> Tuple[float, List[str]]:
        """Analyze blood glucose risk"""
        glucose_readings = [
            r['value'] for r in readings 
            if r.get('metric') == 'blood_glucose' and r.get('value')
        ]
        
        if not glucose_readings:
            return 0.0, ["No glucose data available"]
        
        avg_glucose = np.mean(glucose_readings)
        max_glucose = np.max(glucose_readings)
        
        factors = []
        risk_score = 0.0
        
        # Fasting glucose risk
        if avg_glucose >= self.thresholds['fasting_glucose_diabetes']:
            risk_score += self.risk_factors['elevated_fasting_glucose'] * 2
            factors.append(f"High average glucose: {avg_glucose:.1f} mg/dL")
        elif avg_glucose >= self.thresholds['fasting_glucose_prediabetes']:
            risk_score += self.risk_factors['elevated_fasting_glucose']
            factors.append(f"Elevated glucose: {avg_glucose:.1f} mg/dL")
        else:
            factors.append(f"Normal glucose: {avg_glucose:.1f} mg/dL")
        
        # Glucose variability risk
        if len(glucose_readings) > 5:
            glucose_std = np.std(glucose_readings)
            if glucose_std > 30:  # High variability
                risk_score += 0.2
                factors.append("High glucose variability detected")
        
        return risk_score, factors
    
    def _analyze_bmi_risk(self, user_data: Dict) -> Tuple[float, List[str]]:
        """Analyze BMI risk"""
        height = user_data.get('height', 0)  # in cm
        weight = user_data.get('weight', 0)  # in kg
        
        if not height or not weight:
            return 0.0, ["Height/weight data not available"]
        
        # Calculate BMI
        height_m = height / 100
        bmi = weight / (height_m ** 2)
        
        factors = []
        risk_score = 0.0
        
        if bmi >= self.thresholds['bmi_overweight']:
            risk_score += self.risk_factors['obesity']
            factors.append(f"High BMI: {bmi:.1f} (Obese)")
        elif bmi >= self.thresholds['bmi_normal']:
            risk_score += self.risk_factors['obesity'] * 0.5
            factors.append(f"Elevated BMI: {bmi:.1f} (Overweight)")
        else:
            factors.append(f"Normal BMI: {bmi:.1f}")
        
        return risk_score, factors
    
    def _analyze_age_risk(self, user_data: Dict) -> Tuple[float, List[str]]:
        """Analyze age-related risk"""
        age = user_data.get('age', 0)
        
        if not age:
            return 0.0, ["Age data not available"]
        
        factors = []
        risk_score = 0.0
        
        if age >= 65:
            risk_score += self.risk_factors['age_risk'] * 1.5
            factors.append(f"Age-related risk: {age} years (High risk)")
        elif age >= 45:
            risk_score += self.risk_factors['age_risk']
            factors.append(f"Age-related risk: {age} years (Moderate risk)")
        else:
            factors.append(f"Age: {age} years (Lower risk)")
        
        return risk_score, factors
    
    def _analyze_activity_risk(self, readings: List[Dict]) -> Tuple[float, List[str]]:
        """Analyze activity patterns"""
        activity_readings = [
            r['value'] for r in readings 
            if r.get('metric') == 'steps_per_minute' and r.get('value')
        ]
        
        if not activity_readings:
            return 0.0, ["No activity data available"]
        
        avg_activity = np.mean(activity_readings)
        daily_steps_estimate = avg_activity * 60 * 12  # 12 active hours per day
        
        factors = []
        risk_score = 0.0
        
        if daily_steps_estimate < 5000:
            risk_score += self.risk_factors['sedentary_lifestyle'] * 1.5
            factors.append(f"Sedentary lifestyle: ~{daily_steps_estimate:.0f} steps/day")
        elif daily_steps_estimate < 8000:
            risk_score += self.risk_factors['sedentary_lifestyle']
            factors.append(f"Low activity: ~{daily_steps_estimate:.0f} steps/day")
        else:
            factors.append(f"Good activity: ~{daily_steps_estimate:.0f} steps/day")
        
        return risk_score, factors
    
    def _analyze_temperature_risk(self, readings: List[Dict]) -> Tuple[float, List[str]]:
        """Analyze body temperature patterns"""
        temp_readings = [
            r['value'] for r in readings 
            if r.get('metric') == 'body_temperature' and r.get('value')
        ]
        
        if not temp_readings:
            return 0.0, ["No temperature data available"]
        
        avg_temp = np.mean(temp_readings)
        temp_std = np.std(temp_readings) if len(temp_readings) > 1 else 0
        
        factors = []
        risk_score = 0.0
        
        # Check for abnormal temperatures
        if avg_temp > 99.5 or avg_temp < 97.0:
            risk_score += 0.1
            factors.append(f"Abnormal body temperature: {avg_temp:.1f}°F")
        
        # Check for high variability
        if temp_std > 1.0:
            risk_score += 0.1
            factors.append("High temperature variability detected")
        
        return risk_score, factors
    
    def _get_risk_level(self, risk_score: int) -> str:
        """Convert risk score to risk level"""
        if risk_score < 30:
            return "low"
        elif risk_score < 70:
            return "medium"
        else:
            return "high"
    
    def _generate_recommendations(self, risk_score: int, factors: List[str], 
                             user_data: Dict, readings: List[Dict]) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        # High-risk recommendations
        if risk_score >= 70:
            recommendations.extend([
                "Consult healthcare provider immediately for diabetes screening",
                "Implement daily blood glucose monitoring",
                "Start structured exercise program (30 min/day, 5 days/week)",
                "Adopt low-glycemic index diet",
                "Consider weight management program"
            ])
        
        # Medium-risk recommendations
        elif risk_score >= 30:
            recommendations.extend([
                "Schedule regular diabetes screening (every 6 months)",
                "Increase physical activity to 150 min/week",
                "Focus on balanced diet with portion control",
                "Monitor fasting glucose monthly",
                "Maintain healthy weight"
            ])
        
        # Low-risk recommendations
        else:
            recommendations.extend([
                "Continue healthy lifestyle habits",
                "Annual diabetes screening recommended",
                "Maintain regular physical activity",
                "Practice balanced nutrition"
            ])
        
        # Specific recommendations based on factors
        factor_text = " ".join(factors).lower()
        
        if "high glucose" in factor_text:
            recommendations.append("Reduce sugar and refined carbohydrate intake")
        
        if "high bmi" in factor_text or "obese" in factor_text:
            recommendations.append("Aim for 5-10% weight reduction")
        
        if "sedentary" in factor_text or "low activity" in factor_text:
            recommendations.append("Gradually increase daily steps to 8,000+")
        
        if "age" in factor_text:
            recommendations.append("Age-appropriate health monitoring")
        
        return list(set(recommendations))  # Remove duplicates
    
    def get_prediction_summary(self, predictions: List[Dict]) -> Dict:
        """Get summary of recent predictions"""
        if not predictions:
            return {
                'trend': 'stable',
                'avg_risk': 0,
                'recommendation': 'No data available'
            }
        
        # Sort by timestamp
        predictions.sort(key=lambda x: x.get('last_updated', ''))
        
        recent = predictions[-1]
        previous = predictions[-2] if len(predictions) > 1 else None
        
        trend = 'stable'
        if previous:
            current_risk = recent.get('risk_score', 0)
            previous_risk = previous.get('risk_score', 0)
            
            if current_risk > previous_risk + 5:
                trend = 'increasing'
            elif current_risk < previous_risk - 5:
                trend = 'decreasing'
        
        return {
            'current_risk': recent.get('risk_score', 0),
            'risk_level': recent.get('risk_level', 'low'),
            'trend': trend,
            'last_updated': recent.get('last_updated'),
            'recommendation': self._get_trend_recommendation(trend)
        }
    
    def _get_trend_recommendation(self, trend: str) -> str:
        """Get recommendation based on risk trend"""
        if trend == 'increasing':
            return "Risk factors increasing - consult healthcare provider"
        elif trend == 'decreasing':
            return "Positive trend - continue current lifestyle changes"
        else:
            return "Risk stable - maintain healthy habits"

# Global predictor instance
diabetes_predictor = DiabetesPredictor()
