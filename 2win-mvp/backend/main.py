from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
from jose import JWTError, jwt
from passlib.context import CryptContext
from database import db  # your Supabase DB wrapper
import os
import uvicorn

# =======================
# APP CONFIG
# =======================

app = FastAPI(
    title="2win API 🚀",
    description="Digital Twin Health Predictor - Week 1 MVP",
    version="1.0.0"
)

# FRONTEND ORIGINS
origins = [
    "http://localhost:3000",                  # local dev
    "http://10.166.71.151:3000",             # local network
    "https://2win-frontend.vercel.app"       # deployed frontend
]

# APPLY CORS MIDDLEWARE FIRST
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# =======================
# SECURITY
# =======================

SECRET_KEY = os.environ.get("SECRET_KEY", "super-secret-key")  # use ENV var in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_password_hash(password: str) -> str:
    truncated = password[:72]
    return pwd_context.hash(truncated)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    truncated = plain_password[:72]
    return pwd_context.verify(truncated, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await db.get_user_by_email(email)
    if user is None:
        raise credentials_exception
    return user

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

@app.post("/auth/register", response_model=Dict[str, Any])
async def register_user(user: UserCreate):
    existing_user = await db.get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    user_dict["user_id"] = str(uuid.uuid4())
    user_dict["hashed_password"] = hashed_password
    user_dict["created_at"] = datetime.utcnow().isoformat()
    user_dict["updated_at"] = datetime.utcnow().isoformat()
    user_dict.pop("password", None)

    await db.create_user(user_dict)

    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "id": user_dict["user_id"],
        "email": user.email,
        "name": user.name,
        "access_token": access_token,
        "token_type": "bearer"
    }

@app.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.get_user_by_email(form_data.username)
    if not user or not verify_password(form_data.password, user.get("hashed_password")):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=Dict[str, Any])
async def read_users_me(current_user: Dict = Depends(get_current_user)):
    return current_user

# =======================
# RUN APP ON RENDER
# =======================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))  # Render provides PORT
    uvicorn.run(app, host="0.0.0.0", port=port)
