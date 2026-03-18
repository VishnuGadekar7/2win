from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
from jose import JWTError, jwt
from passlib.context import CryptContext
from database import db  # your Supabase wrapper or DB client
from device_api import router as device_router
from health_api import router as health_router
from iot_api import router as iot_router
from auth import get_current_user
from config import settings
from cron.scheduler import scheduler

# =======================
# APP CONFIG
# =======================

app = FastAPI(
    title="2win API 🚀",
    description="Digital Twin Health Predictor - Week 1 MVP",
    version="1.0.0"
)

# Include device router
app.include_router(device_router)
# Include health router
app.include_router(health_router)
# Include IoT router
app.include_router(iot_router)

# CORS: allow Vercel frontend + local dev
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    settings.FRONTEND_URL,
]
# Filter out empty strings
origins = [o for o in origins if o]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)


@app.on_event("startup")
async def startup_event():
    scheduler.start()
    print("✅ APScheduler started")


@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()
    print("⏹️ APScheduler stopped")

# =======================
# SECURITY
# =======================

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__ident="2b")

def get_password_hash(password: str) -> str:
    if not password:
        raise ValueError("Password cannot be empty")
    # bcrypt only supports up to 72 bytes
    truncated = password[:72]
    return pwd_context.hash(truncated)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password:
        return False
    truncated = plain_password[:72]
    return pwd_context.verify(truncated, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

# =======================
# MODELS
# =======================

class Token(BaseModel):
    access_token: str
    token_type: str

class UserBase(BaseModel):
    email: EmailStr
    name: str
    height: Optional[float] = Field(None, gt=0)
    weight: Optional[float] = Field(None, gt=0)
    age: Optional[int] = Field(None, gt=0, lt=150)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=72)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    age: Optional[int] = None

# =======================
# ROUTES
# =======================

@app.get("/")
async def root():
    return {"message": "2win Backend LIVE ✅"}

# -------- REGISTER --------
@app.post("/auth/register", response_model=Dict[str, Any])
async def register_user(user: UserCreate):
    # Check existing user
    existing_user = await db.get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password safely
    hashed_password = get_password_hash(user.password)

    # Build user dict
    user_dict = user.dict()
    user_dict["user_id"] = str(uuid.uuid4())
    user_dict["hashed_password"] = hashed_password
    user_dict["created_at"] = datetime.utcnow().isoformat()
    user_dict["updated_at"] = datetime.utcnow().isoformat()
    user_dict.pop("password", None)  # remove plain password

    # Optional numeric fields: ensure they are floats/ints or None
    for field in ["height", "weight"]:
        if user_dict.get(field) is not None:
            user_dict[field] = float(user_dict[field])
    if user_dict.get("age") is not None:
        user_dict["age"] = int(user_dict["age"])

    await db.create_user(user_dict)

    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "id": user_dict["user_id"],
        "email": user.email,
        "name": user.name,
        "access_token": access_token,
        "token_type": "bearer"
    }

# -------- LOGIN --------
@app.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.get_user_by_email(form_data.username)
    if not user or not verify_password(form_data.password, user.get("hashed_password")):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

# -------- GET CURRENT USER --------
@app.get("/users/me", response_model=Dict[str, Any])
async def read_users_me(current_user: Dict = Depends(get_current_user)):
    return current_user

# -------- UPDATE CURRENT USER --------
@app.patch("/users/me", response_model=Dict[str, Any])
async def update_users_me(
    update: UserUpdate,
    current_user: Dict = Depends(get_current_user)
):
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    update_data["updated_at"] = datetime.utcnow().isoformat()
    updated_user = await db.update_user(current_user["user_id"], update_data)
    if not updated_user:
        raise HTTPException(status_code=500, detail="Failed to update user")
    return updated_user
