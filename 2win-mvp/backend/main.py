
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

app = FastAPI(
    title="2win API 🚀",
    description="Digital Twin Health Predictor - Week 1 MVP",
    version="1.0.0"
)

# CORS for frontend (Vercel + localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "https://2win-frontend.vercel.app",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === DAY 1 ENDPOINTS ===

@app.get("/")
async def root():
    return {
        "message": "2win Backend LIVE ✅", 
        "status": "Week 1 MVP Ready",
        "endpoints": [
            "GET /health",
            "GET /version"
        ]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "team": "Nodemons - AISSMS IOIT Pune"
    }

@app.get("/version")
async def version():
    return {
        "backend": "FastAPI 0.104.1",
        "week": "Week 1 - Login + Database",
        "next": "Day 2: /auth/register"
    }

# === DAY 2 PREVIEW (Atharva will expand) ===
class UserBase(BaseModel):
    email: str
    height: Optional[float] = None
    weight: Optional[float] = None
    age: Optional[int] = None

@app.post("/auth/register")
async def register_preview(user: UserBase):
    """Day 2: Will connect to PostgreSQL"""
    user_id = str(uuid.uuid4())
    return {
        "success": True,
        "user_id": user_id,
        "message": f"User {user.email} registered (DB coming Day 2)",
        "demo_mode": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

