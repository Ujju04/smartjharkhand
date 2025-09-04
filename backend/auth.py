from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os
from models import AdminUserResponse, TokenPayload, AdminRole
from database import get_admin_users_collection

# Security configurations
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer for token authentication
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def authenticate_admin(username: str, password: str, role: AdminRole) -> Optional[dict]:
    """Authenticate admin user"""
    collection = await get_admin_users_collection()
    
    # Find admin user by username and role
    admin = await collection.find_one({
        "username": username,
        "role": role,
        "isActive": True
    })
    
    if not admin:
        return None
    
    # Verify password
    if not verify_password(password, admin["password"]):
        return None
    
    return admin

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> AdminUserResponse:
    """Get current authenticated admin from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode JWT token
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("username")
        user_id: str = payload.get("user_id")
        role: str = payload.get("role")
        
        if username is None or user_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # Get admin user from database
    collection = await get_admin_users_collection()
    admin = await collection.find_one({
        "username": username,
        "id": user_id,
        "isActive": True
    })
    
    if admin is None:
        raise credentials_exception
    
    return AdminUserResponse(
        id=admin["id"],
        username=admin["username"],
        name=admin["name"],
        email=admin["email"],
        role=admin["role"],
        department=admin.get("department"),
        assignedComplaints=admin.get("assignedComplaints", 0),
        completedComplaints=admin.get("completedComplaints", 0),
        isActive=admin["isActive"]
    )

def require_main_admin(current_admin: AdminUserResponse = Depends(get_current_admin)) -> AdminUserResponse:
    """Require Main Admin role"""
    if current_admin.role != AdminRole.MAIN_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Main Admin access required"
        )
    return current_admin

def require_admin_access(current_admin: AdminUserResponse = Depends(get_current_admin)) -> AdminUserResponse:
    """Require any admin access (Main Admin or Lower Admin)"""
    if current_admin.role not in [AdminRole.MAIN_ADMIN, AdminRole.LOWER_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_admin