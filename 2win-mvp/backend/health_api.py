"""
Health API endpoints — queries Supabase for real data.
No mock data generators.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from auth import get_current_user
from database import db

router = APIRouter(prefix="/api/health", tags=["Health"])


@router.get("/metrics")
async def get_health_metrics(current_user: Dict = Depends(get_current_user)):
    """Get latest health metrics from readings table (last 60 minutes)."""
    user_id = current_user.get("user_id")
    readings = await db.get_recent_readings(user_id, hours=1)

    if not readings:
        return []

    # Deduplicate: keep latest reading per metric
    seen = {}
    for r in readings:
        metric = r.get("metric")
        if metric not in seen:
            seen[metric] = r

    metrics = []
    for metric, r in seen.items():
        value = r.get("value", 0)
        unit = r.get("unit", "")

        # Determine status based on metric type
        status = "normal"
        if metric == "heart_rate":
            if value < 50 or value > 120:
                status = "critical"
            elif value < 60 or value > 100:
                status = "warning"
        elif metric == "body_temperature":
            if value < 96 or value > 100.4:
                status = "critical"
            elif value < 97 or value > 99.5:
                status = "warning"
        elif metric == "spo2":
            if value < 90:
                status = "critical"
            elif value < 95:
                status = "warning"
        elif metric == "blood_glucose":
            if value > 250 or value < 54:
                status = "critical"
            elif value > 140 or value < 70:
                status = "warning"

        # Trend: compare latest to previous if available
        trend = "stable"
        same_metric = [x for x in readings if x.get("metric") == metric]
        if len(same_metric) > 1:
            prev_value = same_metric[1].get("value", value)
            if value > prev_value * 1.05:
                trend = "up"
            elif value < prev_value * 0.95:
                trend = "down"

        metrics.append({
            "name": metric.replace("_", " ").title(),
            "value": value,
            "unit": unit,
            "status": status,
            "trend": trend,
            "timestamp": r.get("ts"),
        })

    return metrics


@router.get("/body-scan")
async def get_body_scan(current_user: Dict = Depends(get_current_user)):
    """Get body part status for digital twin visualization."""
    user_id = current_user.get("user_id")
    parts = await db.get_body_parts_status(user_id)
    return parts


@router.get("/predictions")
async def get_predictions(current_user: dict = Depends(get_current_user)):
    """Get latest disease risk predictions, padded with placeholders for missing data."""
    user_id = current_user.get("user_id")
    
    # Define the required keys that frontend expects
    REQUIRED_KEYS = [
        "cvd", 
        "sleep_apnea", 
        "hypertension", 
        "diabetes", 
        "fatigue", 
        "vitality_index"
    ]

    # Fetch data from DB
    db_predictions = await db.get_latest_predictions(user_id, limit=50)
    
    # Convert fetched list into a dictionary for instant lookups
    # (If your DB query already deduplicates, this just maps them by type)
    existing_preds = {}
    if db_predictions:
        for p in db_predictions:
            p_type = p.get("prediction_type")
            if p_type and p_type not in existing_preds:
                existing_preds[p_type] = p

    # Build the final array, guaranteeing every required key exists
    result = []
    for req_key in REQUIRED_KEYS:
        if req_key in existing_preds:
            p = existing_preds[req_key]
            
            raw_factors = [f.get("name", "") for f in p.get("explanation", {}).get("main_factors", [])]
            raw_recommendations = p.get("explanation", {}).get("recommendations", [])
            
            clean_factors = list(dict.fromkeys([f for f in raw_factors if f]))
            clean_recommendations = list(dict.fromkeys([r for r in raw_recommendations if r]))

            result.append({
                "prediction_type": req_key,
                "disease": req_key.replace("_", " ").title(),
                "risk": p.get("value", 0),
                "value": p.get("value", 0),
                "confidence": p.get("confidence", 0),
                "level": p.get("explanation", {}).get("risk_level", "MODERATE"),
                "factors": clean_factors,
                "recommendations": clean_recommendations,
                "explanation": p.get("explanation", {}),
                "timestamp": p.get("ts"),
            })
        else:
            # Missing data! Inject a safe placeholder.
            result.append({
                "prediction_type": req_key,
                "disease": req_key.replace("_", " ").title(),
                "risk": 0.0,
                "value": 0.0,
                "confidence": 0.0,
                "level": "AWAITING DATA",
                "factors": ["Gathering telemetry data..."],
                "recommendations": ["Wear your ESP32 device longer to generate this insight."],
                "explanation": {},
                "timestamp": None,
            })

    return result

@router.get("/alerts")
async def get_alerts(current_user: Dict = Depends(get_current_user)):
    """Get unread medical alerts."""
    user_id = current_user.get("user_id")
    alerts = await db.get_medical_alerts(user_id, unread_only=True)
    return alerts
