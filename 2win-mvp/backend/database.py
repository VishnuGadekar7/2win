import os
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Dict, Any, Optional, List

# Load environment variables from .env
load_dotenv()

# Initialize Supabase client
def get_supabase() -> Client:
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    if not supabase_url or not supabase_key:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
    return create_client(supabase_url, supabase_key)

class Database:
    def __init__(self):
        self.supabase = get_supabase()
    
    # Create a new user
    async def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        response = self.supabase.table("users").insert(user_data).execute()
        if hasattr(response, "data") and response.data:
            return response.data[0]
        return {}
    
    # Get user by user_id
    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        response = self.supabase.table("users").select("*").eq("user_id", user_id).execute()
        if hasattr(response, "data") and response.data:
            return response.data[0]
        return None
    
    # Get user by email
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        response = self.supabase.table("users").select("*").eq("email", email).execute()
        if hasattr(response, "data") and response.data:
            return response.data[0]
        return None
    
    # Update user by user_id
    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        response = self.supabase.table("users").update(update_data).eq("user_id", user_id).execute()
        if hasattr(response, "data") and response.data:
            return response.data[0]
        return {}
    
    # Device-related methods
    async def create_device(self, device_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new device"""
        response = self.supabase.table("devices").insert(device_data).execute()
        if hasattr(response, "data") and response.data:
            return response.data[0]
        return {}
    
    async def create_device_key(self, key_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a device key"""
        response = self.supabase.table("device_keys").insert(key_data).execute()
        if hasattr(response, "data") and response.data:
            return response.data[0]
        return {}
    
    async def get_user_devices(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all devices for a user"""
        response = self.supabase.table("devices").select("*").eq("user_id", user_id).execute()
        if hasattr(response, "data") and response.data:
            return response.data
        return []
    
    async def revoke_device_key(self, device_id: str) -> Dict[str, Any]:
        """Revoke a device key"""
        response = self.supabase.table("device_keys").update({
            "active": False,
            "revoked_at": "now()"
        }).eq("device_id", device_id).execute()
        if hasattr(response, "data") and response.data:
            return response.data[0]
        return {}
    
    async def validate_device_key(self, key_hash: str) -> Optional[Dict[str, Any]]:
        """Validate a device key and return device info"""
        response = self.supabase.table("device_keys").select(
            "device_id, active, devices!inner(user_id)"
        ).eq("key_hash", key_hash).eq("active", True).single().execute()
        if hasattr(response, "data") and response.data:
            return response.data
        return None
    
    # Create a new reading
    async def create_reading(self, reading_data: Dict[str, Any]) -> Dict[str, Any]:
        response = self.supabase.table("readings").insert(reading_data).execute()
        if hasattr(response, "data") and response.data:
            return response.data[0]
        return {}
    
    # Get recent readings for a user
    async def get_recent_readings(self, user_id: str, hours: int = 24) -> List[Dict[str, Any]]:
        from datetime import datetime, timedelta
        cutoff_time = datetime.now() - timedelta(hours=hours)
        response = self.supabase.table("readings").select("*").eq("user_id", user_id).gte("ts", cutoff_time.isoformat()).order("ts", desc=True).execute()
        if hasattr(response, "data") and response.data:
            return response.data
        return []
    
    # Count recent readings
    async def count_recent_readings(self, user_id: str, hours: int = 6) -> int:
        from datetime import datetime, timedelta
        cutoff_time = datetime.now() - timedelta(hours=hours)
        response = self.supabase.table("readings").select("id").eq("user_id", user_id).gte("ts", cutoff_time.isoformat()).execute()
        if hasattr(response, "data") and response.data:
            return len(response.data)
        return 0
    
    # Create a prediction
    async def create_prediction(self, prediction_data: Dict[str, Any]) -> Dict[str, Any]:
        response = self.supabase.table("predictions").insert(prediction_data).execute()
        if hasattr(response, "data") and response.data:
            return response.data[0]
        return {}
    
    # Get latest predictions for a user
    async def get_latest_predictions(self, user_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        response = self.supabase.table("predictions").select("*").eq("user_id", user_id).order("ts", desc=True).limit(limit).execute()
        if hasattr(response, "data") and response.data:
            return response.data
        return []
    
    # Create a medical alert
    async def create_medical_alert(self, alert_data: Dict[str, Any]) -> Dict[str, Any]:
        response = self.supabase.table("medical_alerts").insert(alert_data).execute()
        if hasattr(response, "data") and response.data:
            return response.data[0]
        return {}
    
    # Get medical alerts for a user
    async def get_medical_alerts(self, user_id: str, unread_only: bool = False) -> List[Dict[str, Any]]:
        query = self.supabase.table("medical_alerts").select("*").eq("user_id", user_id).order("timestamp", desc=True)
        if unread_only:
            query = query.eq("read", False)
        response = query.execute()
        if hasattr(response, "data") and response.data:
            return response.data
        return []
    
    # Mark alerts as read
    async def mark_alerts_read(self, user_id: str, alert_ids: List[str]) -> bool:
        response = self.supabase.table("medical_alerts").update({"read": True}).eq("user_id", user_id).in_("id", alert_ids).execute()
        return hasattr(response, "data") and response.data

# Create a global DB instance
db = Database()
