from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

# ADD THESE 3 LINES:
from database import SessionLocal, User  # User model from database.py
class RegisterRequest(BaseModel):       # MISSING Pydantic model
    email: str
    name: str

app = FastAPI(
    title="2win API 🚀",
    description="Digital Twin Health Predictor - Week 1 MVP",
    version="1.0.0"
)

# CORS (unchanged)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://2win-frontend.vercel.app", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Your existing endpoints (unchanged)
@app.get("/")
async def root():
    return {"message": "2win Backend LIVE ✅", "status": "Week 1 MVP Ready"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get("/version")
async def version():
    return {"backend": "FastAPI 0.104.1", "week": "Week 1"}

# FIXED register endpoint
@app.post("/auth/register")
async def register(request: RegisterRequest):  # Now has Pydantic model
    db = SessionLocal()
    
    # Check if email exists
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        db.close()
        return {"error": "Email already registered"}
    
    # Create user
    user = User(
        user_id=str(uuid.uuid4())[:8],
        email=request.email,
        name=request.name
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    
    return {"message": "Registered!", "user_id": user.user_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
