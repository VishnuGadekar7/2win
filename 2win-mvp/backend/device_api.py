from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Optional
from database import db
from auth import get_current_user
import secrets
import hashlib

router = APIRouter(prefix="/api/devices", tags=["devices"])

class DeviceRegisterRequest(BaseModel):
    device_name: Optional[str] = None

class DeviceResponse(BaseModel):
    id: str
    device_uid: str
    device_name: str
    created_at: str
    active: bool

class DeviceRegisterResponse(BaseModel):
    device_id: str
    device_uid: str
    device_key: str
    device_name: str

def generate_device_key():
    """Generate a secure device key"""
    return secrets.token_urlsafe(32)

def hash_device_key(key: str) -> str:
    """Hash device key for storage"""
    return hashlib.sha256(key.encode()).hexdigest()

@router.post("/register", response_model=DeviceRegisterResponse)
async def register_device(
    request: DeviceRegisterRequest,
    current_user: dict = Depends(get_current_user)
):
    """Register a new device for the current user"""
    
    try:
        # Generate device key
        device_key = generate_device_key()
        key_hash = hash_device_key(device_key)
        
        # Create device record
        device_data = {
            "user_id": current_user["id"],
            "device_type": "esp32_health",
            "device_uid": f"esp32_{secrets.token_hex(8)}",
            "device_name": request.device_name or "ESP32 Health Monitor"
        }
        
        # Insert device
        device_response = db.supabase.table("devices").insert(device_data).execute()
        if not device_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create device"
            )
        
        device_id = device_response.data[0]["id"]
        
        # Store device key
        key_data = {
            "device_id": device_id,
            "key_hash": key_hash,
            "active": True
        }
        
        key_response = db.supabase.table("device_keys").insert(key_data).execute()
        if not key_response.data:
            # Rollback device creation if key fails
            db.supabase.table("devices").delete().eq("id", device_id).execute()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to store device key"
            )
        
        return DeviceRegisterResponse(
            device_id=device_id,
            device_uid=device_data["device_uid"],
            device_key=device_key,  # Only return this once!
            device_name=device_data["device_name"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register device: {str(e)}"
        )

@router.get("/", response_model=List[DeviceResponse])
async def get_user_devices(current_user: dict = Depends(get_current_user)):
    """Get all devices for the current user"""
    
    try:
        response = db.supabase.table("devices").select("*").eq("user_id", current_user["id"]).execute()
        
        devices = []
        for device in response.data or []:
            # Check if device has active key
            key_response = db.supabase.table("device_keys").select("active").eq("device_id", device["id"]).eq("active", True).execute()
            active = len(key_response.data) > 0
            
            devices.append(DeviceResponse(
                id=device["id"],
                device_uid=device["device_uid"],
                device_name=device["device_name"],
                created_at=device["created_at"],
                active=active
            ))
        
        return devices
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch devices: {str(e)}"
        )

@router.post("/{device_id}/revoke")
async def revoke_device(
    device_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Revoke a device key"""
    
    try:
        # Verify device belongs to user
        device_response = db.supabase.table("devices").select("*").eq("id", device_id).eq("user_id", current_user["id"]).execute()
        if not device_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found"
            )
        
        # Revoke the device key
        revoke_response = db.supabase.table("device_keys").update({
            "active": False,
            "revoked_at": "now()"
        }).eq("device_id", device_id).execute()
        
        if not revoke_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device key not found"
            )
        
        return {"message": "Device revoked successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to revoke device: {str(e)}"
        )
