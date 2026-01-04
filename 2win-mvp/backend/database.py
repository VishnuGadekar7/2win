import os
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Dict, Any, Optional

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

# Create a global DB instance
db = Database()
