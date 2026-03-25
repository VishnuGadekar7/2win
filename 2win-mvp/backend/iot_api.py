"""
IoT API endpoints — handles sensor data ingestion from ESP32 devices.
Wires to actual DB writes and triggers the prediction pipeline.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from database import db
from auth import get_current_user
from device_api import hash_device_key

router = APIRouter(prefix="/api/iot", tags=["IoT"])


# ─── MODELS ──────────────────────────────────────────────────────────────

class SensorReading(BaseModel):
    device_id: str
    metric: str
    value: float
    unit: str = ""
    ts: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class BatchIngestRequest(BaseModel):
    device_key: str
    readings: List[SensorReading]


class SingleIngestRequest(BaseModel):
    device_id: str
    metric: str
    value: float
    unit: str = ""
    ts: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class DeviceRegisterRequest(BaseModel):
    device_uid: str
    device_name: str = "ESP32 Health Monitor"
    user_id: str


# ─── BACKGROUND TASK: PREDICTION PIPELINE ────────────────────────────────

async def run_feature_pipeline(user_id: str):
    """
    Background task: fetch recent readings for the user,
    run feature engineering, compute risk scores, and save predictions.
    """
    try:
        from services.data_ingestion import run_prediction_pipeline

        # Get recent readings (last 6 hours)
        readings = await db.get_recent_readings(user_id, hours=6)
        if len(readings) >= 5:
            await run_prediction_pipeline(user_id, readings)
            print(f"✅ Prediction pipeline completed for user {user_id} ({len(readings)} readings)")
        else:
            print(f"⏳ Not enough readings for user {user_id} ({len(readings)}/5 minimum)")
    except Exception as e:
        print(f"❌ Feature pipeline error for user {user_id}: {str(e)}")


# ─── ENDPOINTS ───────────────────────────────────────────────────────────

@router.post("/ingest")
async def batch_ingest(
    payload: BatchIngestRequest,
    background_tasks: BackgroundTasks,
):
    """
    Batch ingestion from ESP32 devices.
    Validates device key, writes readings to DB, triggers prediction pipeline.
    """
    # Hash the raw key coming from the ESP32
    hashed_key = hash_device_key(payload.device_key)

    # Validate device key
    device_info = await db.validate_device_key(hashed_key)
    if not device_info:
        raise HTTPException(status_code=401, detail="Invalid or revoked device key")

    device_id = device_info.get("device_id")
    user_id = device_info.get("devices", {}).get("user_id")

    if not user_id:
        raise HTTPException(status_code=400, detail="Device not associated with a user")

    # Write each reading to DB
    stored_count = 0
    valid_metrics = {"heart_rate", "spo2", "body_temperature", "blood_glucose",
                     "steps_per_minute", "steps", "motion", "rr_interval",
                     "ambient_temperature", "humidity", "sleep_hours"}

    for reading in payload.readings:
        metric = reading.metric.lower().strip()
        if metric in valid_metrics:
            await db.insert_reading(
                device_id=device_id,
                user_id=user_id,
                metric=metric,
                value=reading.value,
                unit=reading.unit,
            )
            stored_count += 1

    # Trigger prediction pipeline in background
    background_tasks.add_task(run_feature_pipeline, user_id)

    return {
        "status": "ok",
        "readings_stored": stored_count,
        "total_received": len(payload.readings),
        "message": f"Stored {stored_count} readings. Prediction pipeline queued.",
    }


@router.post("/ingest-single")
async def ingest_single(
    reading: SingleIngestRequest,
    background_tasks: BackgroundTasks,
):
    """Single reading upload — looks up device by device_id (UID)."""
    device = await db.get_device_by_uid(reading.device_id)

    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    user_id = device.get("user_id")

    await db.insert_reading(
        device_id=device.get("id"),
        user_id=user_id,
        metric=reading.metric,
        value=reading.value,
        unit=reading.unit,
    )

    # Trigger pipeline if we have enough data
    count = await db.count_recent_readings(user_id, hours=6)
    if count >= 5:
        background_tasks.add_task(run_feature_pipeline, user_id)

    return {"status": "ok", "message": "Reading stored"}


@router.post("/device-register")
async def register_device(payload: DeviceRegisterRequest):
    """Direct device self-registration."""
    import uuid

    existing = await db.get_device_by_uid(payload.device_uid)
    if existing:
        return {
            "status": "already_registered",
            "device_id": existing.get("id"),
            "device_uid": existing.get("device_uid"),
        }

    device_data = {
        "id": str(uuid.uuid4()),
        "device_uid": payload.device_uid,
        "device_name": payload.device_name,
        "device_type": "esp32_health",
        "user_id": payload.user_id,
        "created_at": datetime.utcnow().isoformat(),
    }
    result = await db.create_device(device_data)

    return {
        "status": "registered",
        "device_id": result.get("id"),
        "device_uid": payload.device_uid,
    }


@router.get("/device-status/{device_uid}")
async def device_status(device_uid: str):
    """Get device connection status and recent telemetry summary."""
    device = await db.get_device_by_uid(device_uid)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    user_id = device.get("user_id")
    readings = await db.get_recent_readings(user_id, hours=1)

    return {
        "device_uid": device_uid,
        "device_name": device.get("device_name"),
        "active": True,
        "readings_last_hour": len(readings),
        "last_reading": readings[0] if readings else None,
    }


@router.get("/health-summary/{user_id}")
async def health_summary(user_id: str):
    """Comprehensive processed health summary for a user."""
    readings = await db.get_recent_readings(user_id, hours=24)
    predictions = await db.get_latest_predictions(user_id, limit=10)
    alerts = await db.get_medical_alerts(user_id, unread_only=True)

    return {
        "user_id": user_id,
        "readings_24h": len(readings),
        "predictions": predictions,
        "unread_alerts": len(alerts),
        "alerts": alerts,
    }
