"""
IoT Data Ingestion API
Handles data uploads from ESP32 devices and triggers ML predictions
"""

from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
import hashlib
import json

from database import db
from services.data_ingestion import data_service
from auth import get_current_user

router = APIRouter(prefix="/api/iot", tags=["iot"])

class ReadingData(BaseModel):
    device_id: str
    metric: str
    value: float
    unit: str
    ts: datetime

class DeviceAuth(BaseModel):
    device_key: str = Field(..., min_length=32, max_length=32)

class BatchReadings(BaseModel):
    readings: List[ReadingData]
    device_key: str = Field(..., min_length=32, max_length=32)

@router.post("/ingest")
async def ingest_sensor_data(
    data: BatchReadings,
    background_tasks: BackgroundTasks
):
    """
    Ingest batch of sensor readings from IoT device
    """
    try:
        # Authenticate device
        device_info = await authenticate_device(data.device_key)
        if not device_info:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid device key"
            )
        
        # Add user_id to all readings
        user_id = device_info.get('user_id')
        enriched_readings = []
        
        for reading in data.readings:
            enriched_reading = reading.dict()
            enriched_reading['user_id'] = user_id
            enriched_readings.append(enriched_reading)
        
        # Process readings in background
        background_tasks.add_task(
            process_readings_background,
            enriched_readings
        )
        
        return {
            "status": "success",
            "message": f"Processing {len(enriched_readings)} readings",
            "device_id": device_info.get('device_id'),
            "user_id": user_id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process data: {str(e)}"
        )

@router.post("/ingest-single")
async def ingest_single_reading(
    data: ReadingData,
    background_tasks: BackgroundTasks
):
    """
    Ingest single sensor reading from IoT device
    """
    try:
        # Get device info from reading (device should be authenticated)
        device_info = await db.get_device_by_uid(data.device_id)
        if not device_info or not device_info.get('active'):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Device not registered or inactive"
            )
        
        # Add user_id
        enriched_reading = data.dict()
        enriched_reading['user_id'] = device_info.get('user_id')
        
        # Process in background
        background_tasks.add_task(
            process_readings_background,
            [enriched_reading]
        )
        
        return {
            "status": "success",
            "message": "Reading processed",
            "metric": data.metric,
            "value": data.value
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process reading: {str(e)}"
        )

@router.post("/device-register")
async def register_device(data: DeviceAuth):
    """
    Register new IoT device (first-time setup)
    """
    try:
        # Check if device key is already registered
        key_hash = hash_device_key(data.device_key)
        existing_device = await db.validate_device_key(key_hash)
        
        if existing_device:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Device key already registered"
            )
        
        # Generate device UID and register
        device_uid = f"ESP32_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        device_data = {
            "device_uid": device_uid,
            "device_name": f"ESP32 Device {device_uid[-6:]}",
            "device_type": "esp32_health"
        }
        
        # Create device (will be associated with user during first data upload)
        device = await db.create_device(device_data)
        
        # Create device key
        key_data = {
            "device_id": device.get('id'),
            "key_hash": key_hash,
            "active": True
        }
        
        await db.create_device_key(key_data)
        
        return {
            "status": "success",
            "message": "Device registered successfully",
            "device_uid": device_uid,
            "device_key": data.device_key
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register device: {str(e)}"
        )

@router.get("/device-status/{device_uid}")
async def get_device_status(device_uid: str):
    """
    Get device status and recent data
    """
    try:
        # Get device info
        device_info = await db.get_device_by_uid(device_uid)
        if not device_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found"
            )
        
        # Get recent readings
        recent_readings = await db.get_recent_readings(
            device_info.get('user_id'), 
            hours=1
        )
        
        # Filter readings for this device
        device_readings = [
            r for r in recent_readings 
            if r.get('device_id') == device_uid
        ]
        
        return {
            "device_uid": device_uid,
            "device_name": device_info.get('device_name'),
            "active": device_info.get('active', True),
            "last_seen": max([r.get('ts') for r in device_readings]) if device_readings else None,
            "recent_readings_count": len(device_readings),
            "battery_level": next(
                (r.get('value') for r in device_readings 
                 if r.get('metric') == 'device_battery'),
                None
            ),
            "signal_strength": next(
                (r.get('value') for r in device_readings 
                 if r.get('metric') == 'signal_strength'),
                None
            )
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get device status: {str(e)}"
        )

@router.get("/health-summary/{user_id}")
async def get_health_summary(user_id: str):
    """
    Get comprehensive health summary for user
    """
    try:
        summary = await data_service.get_user_health_summary(user_id)
        return summary
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate health summary: {str(e)}"
        )

# Helper functions
async def authenticate_device(device_key: str) -> Optional[Dict[str, Any]]:
    """Authenticate device using key"""
    key_hash = hash_device_key(device_key)
    return await db.validate_device_key(key_hash)

def hash_device_key(device_key: str) -> str:
    """Hash device key for storage"""
    return hashlib.sha256(device_key.encode()).hexdigest()

async def process_readings_background(readings: List[Dict[str, Any]]):
    """Background task to process readings"""
    try:
        await data_service.process_device_readings(readings)
        print(f"✅ Background processing completed for {len(readings)} readings")
    except Exception as e:
        print(f"❌ Background processing failed: {str(e)}")

# Device authentication dependency
async def get_device_from_key(device_key: str = None):
    """Get device from authenticated key"""
    if not device_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Device key required"
        )
    
    device_info = await authenticate_device(device_key)
    if not device_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid device key"
        )
    
    return device_info
