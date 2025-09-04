from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class ComplaintPriority(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class ComplaintStatus(str, Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"

class AdminRole(str, Enum):
    MAIN_ADMIN = "Main Admin"
    LOWER_ADMIN = "Lower Admin"

# User Models
class User(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: str
    totalComplaints: int = 0
    resolvedComplaints: int = 0
    joinedDate: datetime
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    totalComplaints: int
    resolvedComplaints: int
    joinedDate: datetime

# Complaint Models
class Complaint(BaseModel):
    id: str
    title: str
    description: str
    category: str
    department: str
    priority: ComplaintPriority
    status: ComplaintStatus = ComplaintStatus.PENDING
    userId: str
    userEmail: EmailStr
    userPhone: str
    assignedTo: Optional[str] = None
    assignedWorker: Optional[str] = None
    proofImages: List[str] = []
    remarks: str = ""
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class ComplaintCreate(BaseModel):
    title: str
    description: str
    category: str
    department: str
    priority: ComplaintPriority
    userId: str
    userEmail: EmailStr
    userPhone: str

class ComplaintUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    department: Optional[str] = None
    priority: Optional[ComplaintPriority] = None
    status: Optional[ComplaintStatus] = None
    assignedTo: Optional[str] = None
    assignedWorker: Optional[str] = None
    remarks: Optional[str] = None

class ComplaintAssign(BaseModel):
    workerId: str
    workerName: str

class ComplaintTransfer(BaseModel):
    department: str

class ComplaintStatusUpdate(BaseModel):
    status: ComplaintStatus
    remarks: Optional[str] = ""
    proofImages: List[str] = []

class ComplaintResponse(BaseModel):
    id: str
    title: str
    description: str
    category: str
    department: str
    priority: str
    status: str
    userId: str
    userEmail: str
    userPhone: str
    assignedTo: Optional[str]
    assignedWorker: Optional[str]
    proofImages: List[str]
    remarks: str
    createdAt: datetime
    updatedAt: datetime

# Admin User Models
class AdminUser(BaseModel):
    id: str
    username: str
    password: str  # Will be hashed
    name: str
    email: EmailStr
    role: AdminRole
    department: Optional[str] = None  # Required for Lower Admin
    assignedComplaints: int = 0
    completedComplaints: int = 0
    isActive: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class AdminUserCreate(BaseModel):
    username: str
    password: str
    name: str
    email: EmailStr
    role: AdminRole
    department: Optional[str] = None

class AdminUserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    isActive: Optional[bool] = None

class AdminUserResponse(BaseModel):
    id: str
    username: str
    name: str
    email: str
    role: str
    department: Optional[str]
    assignedComplaints: int
    completedComplaints: int
    isActive: bool

# Authentication Models
class LoginRequest(BaseModel):
    username: str
    password: str
    role: AdminRole

class LoginResponse(BaseModel):
    token: str
    user: AdminUserResponse
    message: str

class TokenPayload(BaseModel):
    user_id: str
    username: str
    role: str
    exp: datetime

# Analytics Models
class DepartmentStats(BaseModel):
    department: str
    total: int
    completed: int
    pending: int
    inProgress: int

class AnalyticsResponse(BaseModel):
    totalComplaints: int
    pendingComplaints: int
    inProgressComplaints: int
    completedComplaints: int
    criticalComplaints: int
    averageResolutionTime: str
    departmentStats: List[DepartmentStats]

# API Response Models
class APIResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    message: str = ""
    error: Optional[str] = None

class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
    search: Optional[str] = None
    status: Optional[str] = None
    department: Optional[str] = None
    priority: Optional[str] = None

# Constants
DEPARTMENTS = [
    "Public Works",
    "Water Department",
    "Waste Management", 
    "Traffic Management",
    "Parks & Recreation",
    "Building & Safety"
]

CATEGORIES = [
    "Infrastructure",
    "Water",
    "Sanitation",
    "Traffic",
    "Parks",
    "Building"
]