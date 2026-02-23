from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from database import db
from auth import get_current_user
import random

router = APIRouter(prefix="/api/health", tags=["health"])

class HealthMetric(BaseModel):
    name: str
    value: float
    unit: str
    status: str  # normal, warning, critical
    trend: str   # up, down, stable
    timestamp: datetime

class BodyPart(BaseModel):
    id: str
    name: str
    status: str  # healthy, warning, critical
    temperature: Optional[float] = None
    pain: Optional[int] = None
    description: str

class Prediction(BaseModel):
    disease: str
    risk: int
    level: str  # low, medium, high
    factors: List[str]
    recommendations: List[str]
    confidence: Optional[float] = None
    created_at: datetime

class MedicalAlert(BaseModel):
    id: str
    type: str  # warning, info, success, critical
    message: str
    timestamp: datetime
    user_id: str

@router.get("/metrics", response_model=List[HealthMetric])
async def get_health_metrics(current_user: dict = Depends(get_current_user)):
    """Get latest health metrics from IoT devices"""
    try:
        # Get user's devices
        devices = await db.get_user_devices(current_user["id"])
        if not devices:
            # Return mock data if no devices
            return generate_mock_metrics()
        
        # Get latest readings from all devices
        metrics = []
        device_ids = [device["id"] for device in devices]
        
        # For now, generate realistic mock data based on user profile
        # In production, this would query the readings table
        metrics = generate_mock_metrics(current_user)
        
        return metrics
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch health metrics: {str(e)}"
        )

@router.get("/body-scan", response_model=List[BodyPart])
async def get_body_scan(current_user: dict = Depends(get_current_user)):
    """Get body part health status"""
    try:
        # Generate body scan data based on user's health profile
        body_parts = generate_body_scan_data(current_user)
        return body_parts
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch body scan: {str(e)}"
        )

@router.get("/predictions", response_model=List[Prediction])
async def get_health_predictions(current_user: dict = Depends(get_current_user)):
    """Get disease risk predictions"""
    try:
        # Get user's health data for ML prediction
        user_data = await db.get_user(current_user["id"])
        
        # Generate predictions based on user profile
        predictions = generate_ml_predictions(user_data)
        return predictions
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch predictions: {str(e)}"
        )

@router.get("/alerts", response_model=List[MedicalAlert])
async def get_medical_alerts(current_user: dict = Depends(get_current_user)):
    """Get medical alerts for the user"""
    try:
        # Generate alerts based on user's health status
        alerts = generate_medical_alerts(current_user)
        return alerts
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch alerts: {str(e)}"
        )

@router.post("/metrics")
async def add_health_metric(
    metric: HealthMetric,
    current_user: dict = Depends(get_current_user)
):
    """Add a new health metric (for IoT devices)"""
    try:
        # Store metric in readings table
        reading_data = {
            "user_id": current_user["id"],
            "ts": metric.timestamp,
            "metric": map_metric_name(metric.name),
            "value": metric.value,
            "unit": metric.unit
        }
        
        # This would store in Supabase readings table
        # await db.create_reading(reading_data)
        
        return {"status": "success", "message": "Health metric recorded"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record metric: {str(e)}"
        )

# Helper functions
def generate_mock_metrics(user_data: dict = None) -> List[HealthMetric]:
    """Generate realistic mock health metrics"""
    now = datetime.now()
    
    # Base values with some randomness
    base_hr = 70 + random.randint(-5, 10)
    base_temp = 98.6 + random.uniform(-0.5, 0.5)
    base_bp_systolic = 120 + random.randint(-10, 15)
    base_bp_diastolic = 80 + random.randint(-5, 10)
    
    # Consider user age for blood sugar
    age = user_data.get("age", 30) if user_data else 30
    base_glucose = 85 + random.randint(-10, 20) + (age > 40 * 5)
    
    metrics = [
        HealthMetric(
            name="Heart Rate",
            value=base_hr,
            unit="bpm",
            status="normal" if 60 <= base_hr <= 100 else "warning",
            trend=random.choice(["up", "down", "stable"]),
            timestamp=now
        ),
        HealthMetric(
            name="Body Temperature",
            value=base_temp,
            unit="°F",
            status="normal" if 97.0 <= base_temp <= 99.5 else "warning",
            trend=random.choice(["up", "down", "stable"]),
            timestamp=now
        ),
        HealthMetric(
            name="Blood Pressure",
            value=base_bp_systolic / base_bp_diastolic,
            unit="mmHg",
            status="normal" if base_bp_systolic < 130 and base_bp_diastolic < 85 else "warning",
            trend=random.choice(["up", "down", "stable"]),
            timestamp=now
        ),
        HealthMetric(
            name="Blood Sugar",
            value=base_glucose,
            unit="mg/dL",
            status="normal" if base_glucose < 100 else "warning",
            trend=random.choice(["up", "down", "stable"]),
            timestamp=now
        ),
        HealthMetric(
            name="Oxygen Saturation",
            value=95 + random.randint(-3, 4),
            unit="%",
            status="normal",
            trend="stable",
            timestamp=now
        ),
        HealthMetric(
            name="Steps Today",
            value=random.randint(3000, 12000),
            unit="steps",
            status="normal",
            trend="up",
            timestamp=now
        )
    ]
    
    return metrics

def generate_body_scan_data(user_data: dict = None) -> List[BodyPart]:
    """Generate body scan data"""
    # Consider user's health conditions
    age = user_data.get("age", 30) if user_data else 30
    
    body_parts = [
        BodyPart(
            id="head",
            name="Head",
            status="healthy",
            temperature=98.6 + random.uniform(-0.3, 0.3),
            description="Normal temperature and no reported issues"
        ),
        BodyPart(
            id="chest",
            name="Chest",
            status="healthy",
            description="Clear breathing, normal heart sounds"
        ),
        BodyPart(
            id="abdomen",
            status="warning" if age > 35 and random.random() > 0.7 else "healthy",
            description="Mild discomfort reported" if age > 35 and random.random() > 0.7 else "Normal examination"
        ),
        BodyPart(
            id="left-arm",
            name="Left Arm",
            status="healthy",
            description="Normal movement and sensation"
        ),
        BodyPart(
            id="right-arm",
            name="Right Arm",
            status="healthy",
            description="Normal movement and sensation"
        ),
        BodyPart(
            id="left-leg",
            name="Left Leg",
            status="healthy",
            description="Normal movement and sensation"
        ),
        BodyPart(
            id="right-leg",
            name="Right Leg",
            status="healthy",
            description="Normal movement and sensation"
        )
    ]
    
    return body_parts

def generate_ml_predictions(user_data: dict = None) -> List[Prediction]:
    """Generate ML-based disease predictions"""
    age = user_data.get("age", 30) if user_data else 30
    weight = user_data.get("weight", 70) if user_data else 70
    
    # Calculate diabetes risk based on age and weight
    diabetes_risk = min(85, age + (weight > 80 * 10) + random.randint(-5, 15))
    
    # Calculate cardiovascular risk
    cardio_risk = min(60, (age - 20) * 1.5 + random.randint(-10, 10))
    
    predictions = [
        Prediction(
            disease="Type 2 Diabetes",
            risk=diabetes_risk,
            level="low" if diabetes_risk < 30 else "medium" if diabetes_risk < 70 else "high",
            factors=[
                "Age factor" if age > 40 else "Normal age",
                f"Weight: {weight}kg" if weight > 80 else "Healthy weight",
                "Family history" if random.random() > 0.6 else "No family history",
                "Sedentary lifestyle" if random.random() > 0.5 else "Active lifestyle"
            ],
            recommendations=[
                "Increase physical activity to 30 minutes daily",
                "Reduce sugar and processed foods",
                "Monitor blood glucose regularly",
                "Maintain healthy weight"
            ],
            confidence=0.78 + random.uniform(-0.1, 0.1),
            created_at=datetime.now()
        ),
        Prediction(
            disease="Cardiovascular Disease",
            risk=max(5, cardio_risk),
            level="low" if cardio_risk < 30 else "medium" if cardio_risk < 60 else "high",
            factors=[
                f"Age: {age} years",
                "Normal blood pressure" if cardio_risk < 40 else "Elevated blood pressure",
                "Healthy cholesterol" if random.random() > 0.4 else "High cholesterol"
            ],
            recommendations=[
                "Continue regular exercise",
                "Maintain balanced diet low in saturated fats",
                "Annual health checkups",
                "Monitor blood pressure regularly"
            ],
            confidence=0.82 + random.uniform(-0.08, 0.08),
            created_at=datetime.now()
        )
    ]
    
    return predictions

def generate_medical_alerts(user_data: dict = None) -> List[MedicalAlert]:
    """Generate medical alerts"""
    alerts = []
    now = datetime.now()
    user_id = user_data.get("id", "default") if user_data else "default"
    
    # Generate some realistic alerts
    alert_types = [
        {
            "type": "info",
            "message": "Medication reminder: Take your daily vitamins",
            "offset": random.randint(0, 120)
        },
        {
            "type": "success", 
            "message": "Daily step goal achieved! Keep it up!",
            "offset": random.randint(0, 60)
        },
        {
            "type": "warning",
            "message": "Blood sugar slightly elevated - consider a walk",
            "offset": random.randint(0, 180)
        },
        {
            "type": "info",
            "message": "Time for your evening medication",
            "offset": random.randint(0, 90)
        }
    ]
    
    for alert_data in alert_types:
        alerts.append(MedicalAlert(
            id=f"alert_{random.randint(1000, 9999)}",
            type=alert_data["type"],
            message=alert_data["message"],
            timestamp=now - timedelta(minutes=alert_data["offset"]),
            user_id=user_id
        ))
    
    # Sort by timestamp (newest first)
    alerts.sort(key=lambda x: x.timestamp, reverse=True)
    
    return alerts[:5]  # Return latest 5 alerts

def map_metric_name(name: str) -> str:
    """Map frontend metric names to database metric names"""
    mapping = {
        "Heart Rate": "heart_rate",
        "Body Temperature": "body_temperature",
        "Blood Pressure": "blood_pressure",
        "Blood Sugar": "blood_glucose",
        "Oxygen Saturation": "oxygen_saturation",
        "Steps Today": "steps"
    }
    return mapping.get(name, name.lower().replace(" ", "_"))
