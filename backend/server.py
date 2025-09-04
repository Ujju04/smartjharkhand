from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from pathlib import Path
from typing import List, Optional
import os
import logging
from datetime import datetime, timedelta
import uuid
import shutil

# Import local modules
from database import connect_to_mongo, close_mongo_connection, get_database, get_next_sequence_number, init_counters
from models import *
from auth import authenticate_admin, create_access_token, get_current_admin, require_main_admin, require_admin_access, get_password_hash

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create the main app
app = FastAPI(title="Admin Dashboard API", version="1.0.0")

# Create API router with /api prefix
api_router = APIRouter(prefix="/api")

# Create uploads directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup and shutdown events
@app.on_event("startup")
async def startup_db_client():
    """Initialize database connection and seed data"""
    await connect_to_mongo()
    await init_counters()
    logger.info("Database connected and initialized")

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close database connection"""
    await close_mongo_connection()

# Authentication Routes
@api_router.post("/auth/login", response_model=APIResponse)
async def login(request: LoginRequest):
    """Admin login"""
    try:
        # Authenticate admin
        admin = await authenticate_admin(request.username, request.password, request.role)
        if not admin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Create access token
        access_token = create_access_token(
            data={
                "user_id": admin["id"],
                "username": admin["username"],
                "role": admin["role"]
            }
        )
        
        # Prepare response
        user_response = AdminUserResponse(
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
        
        return APIResponse(
            success=True,
            data={
                "token": access_token,
                "user": user_response.dict()
            },
            message="Login successful"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/auth/me", response_model=APIResponse)
async def get_current_user(current_admin: AdminUserResponse = Depends(get_current_admin)):
    """Get current authenticated admin"""
    return APIResponse(
        success=True,
        data=current_admin.dict(),
        message="User retrieved successfully"
    )

@api_router.post("/auth/logout", response_model=APIResponse)
async def logout():
    """Logout (client-side token removal)"""
    return APIResponse(
        success=True,
        message="Logged out successfully"
    )

# Complaint Routes
@api_router.get("/complaints", response_model=APIResponse)
async def get_complaints(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    current_admin: AdminUserResponse = Depends(require_admin_access)
):
    """Get complaints with filtering and pagination"""
    try:
        db = get_database()
        
        # Build query
        query = {}
        
        # Role-based filtering
        if current_admin.role == AdminRole.LOWER_ADMIN:
            query["assignedTo"] = current_admin.id
        
        # Apply filters
        if status and status != "all":
            query["status"] = status.title()
        if department and department != "all":
            query["department"] = department
        if priority and priority != "all":
            query["priority"] = priority.title()
        
        # Search functionality
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"id": {"$regex": search, "$options": "i"}},
                {"userEmail": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}}
            ]
        
        # Get total count
        total = await db.complaints.count_documents(query)
        
        # Get paginated results
        skip = (page - 1) * limit
        cursor = db.complaints.find(query).sort("createdAt", -1).skip(skip).limit(limit)
        complaints = await cursor.to_list(length=limit)
        
        # Convert to response format
        complaint_responses = []
        for complaint in complaints:
            complaint_responses.append(ComplaintResponse(
                id=complaint["id"],
                title=complaint["title"],
                description=complaint["description"],
                category=complaint["category"],
                department=complaint["department"],
                priority=complaint["priority"],
                status=complaint["status"],
                userId=complaint["userId"],
                userEmail=complaint["userEmail"],
                userPhone=complaint["userPhone"],
                assignedTo=complaint.get("assignedTo"),
                assignedWorker=complaint.get("assignedWorker"),
                proofImages=complaint.get("proofImages", []),
                remarks=complaint.get("remarks", ""),
                createdAt=complaint["createdAt"],
                updatedAt=complaint["updatedAt"]
            ))
        
        return APIResponse(
            success=True,
            data={
                "complaints": [c.dict() for c in complaint_responses],
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": total,
                    "pages": (total + limit - 1) // limit
                }
            },
            message="Complaints retrieved successfully"
        )
        
    except Exception as e:
        logger.error(f"Error getting complaints: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/complaints/{complaint_id}", response_model=APIResponse)
async def get_complaint(
    complaint_id: str,
    current_admin: AdminUserResponse = Depends(require_admin_access)
):
    """Get single complaint by ID"""
    try:
        db = get_database()
        
        query = {"id": complaint_id}
        
        # Role-based access control
        if current_admin.role == AdminRole.LOWER_ADMIN:
            query["assignedTo"] = current_admin.id
        
        complaint = await db.complaints.find_one(query)
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
        
        complaint_response = ComplaintResponse(
            id=complaint["id"],
            title=complaint["title"],
            description=complaint["description"],
            category=complaint["category"],
            department=complaint["department"],
            priority=complaint["priority"],
            status=complaint["status"],
            userId=complaint["userId"],
            userEmail=complaint["userEmail"],
            userPhone=complaint["userPhone"],
            assignedTo=complaint.get("assignedTo"),
            assignedWorker=complaint.get("assignedWorker"),
            proofImages=complaint.get("proofImages", []),
            remarks=complaint.get("remarks", ""),
            createdAt=complaint["createdAt"],
            updatedAt=complaint["updatedAt"]
        )
        
        return APIResponse(
            success=True,
            data=complaint_response.dict(),
            message="Complaint retrieved successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting complaint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.put("/complaints/{complaint_id}/assign", response_model=APIResponse)
async def assign_complaint(
    complaint_id: str,
    assignment: ComplaintAssign,
    current_admin: AdminUserResponse = Depends(require_main_admin)
):
    """Assign complaint to worker (Main Admin only)"""
    try:
        db = get_database()
        
        # Update complaint
        result = await db.complaints.update_one(
            {"id": complaint_id},
            {
                "$set": {
                    "assignedTo": assignment.workerId,
                    "assignedWorker": assignment.workerName,
                    "status": ComplaintStatus.IN_PROGRESS,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Complaint not found")
        
        # Update worker's assigned complaints count
        await db.admin_users.update_one(
            {"id": assignment.workerId},
            {"$inc": {"assignedComplaints": 1}}
        )
        
        return APIResponse(
            success=True,
            message="Complaint assigned successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning complaint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.put("/complaints/{complaint_id}/transfer", response_model=APIResponse)
async def transfer_complaint(
    complaint_id: str,
    transfer: ComplaintTransfer,
    current_admin: AdminUserResponse = Depends(require_main_admin)
):
    """Transfer complaint to different department (Main Admin only)"""
    try:
        db = get_database()
        
        # Get current complaint
        complaint = await db.complaints.find_one({"id": complaint_id})
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
        
        # Update assigned complaints count for current worker
        if complaint.get("assignedTo"):
            await db.admin_users.update_one(
                {"id": complaint["assignedTo"]},
                {"$inc": {"assignedComplaints": -1}}
            )
        
        # Update complaint
        result = await db.complaints.update_one(
            {"id": complaint_id},
            {
                "$set": {
                    "department": transfer.department,
                    "assignedTo": None,
                    "assignedWorker": None,
                    "status": ComplaintStatus.PENDING,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        return APIResponse(
            success=True,
            message="Complaint transferred successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error transferring complaint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.put("/complaints/{complaint_id}/status", response_model=APIResponse)
async def update_complaint_status(
    complaint_id: str,
    status_update: ComplaintStatusUpdate,
    current_admin: AdminUserResponse = Depends(require_admin_access)
):
    """Update complaint status (assigned worker only)"""
    try:
        db = get_database()
        
        # Check if complaint is assigned to current admin (for Lower Admin)
        query = {"id": complaint_id}
        if current_admin.role == AdminRole.LOWER_ADMIN:
            query["assignedTo"] = current_admin.id
        
        complaint = await db.complaints.find_one(query)
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found or not assigned to you")
        
        # Update complaint
        update_data = {
            "status": status_update.status,
            "remarks": status_update.remarks,
            "updatedAt": datetime.utcnow()
        }
        
        if status_update.proofImages:
            update_data["proofImages"] = complaint.get("proofImages", []) + status_update.proofImages
        
        result = await db.complaints.update_one(
            {"id": complaint_id},
            {"$set": update_data}
        )
        
        # Update worker's completed complaints count if status is completed
        if status_update.status == ComplaintStatus.COMPLETED and current_admin.role == AdminRole.LOWER_ADMIN:
            await db.admin_users.update_one(
                {"id": current_admin.id},
                {
                    "$inc": {
                        "completedComplaints": 1,
                        "assignedComplaints": -1
                    }
                }
            )
            
            # Update user's resolved complaints count
            await db.users.update_one(
                {"id": complaint["userId"]},
                {"$inc": {"resolvedComplaints": 1}}
            )
        
        return APIResponse(
            success=True,
            message="Complaint status updated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating complaint status: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/complaints/analytics", response_model=APIResponse)
async def get_analytics(current_admin: AdminUserResponse = Depends(require_main_admin)):
    """Get complaint analytics (Main Admin only)"""
    try:
        db = get_database()
        
        # Get total counts
        total_complaints = await db.complaints.count_documents({})
        pending_complaints = await db.complaints.count_documents({"status": ComplaintStatus.PENDING})
        in_progress_complaints = await db.complaints.count_documents({"status": ComplaintStatus.IN_PROGRESS})
        completed_complaints = await db.complaints.count_documents({"status": ComplaintStatus.COMPLETED})
        critical_complaints = await db.complaints.count_documents({"priority": ComplaintPriority.CRITICAL})
        
        # Get department statistics
        pipeline = [
            {
                "$group": {
                    "_id": "$department",
                    "total": {"$sum": 1},
                    "completed": {
                        "$sum": {"$cond": [{"$eq": ["$status", ComplaintStatus.COMPLETED]}, 1, 0]}
                    },
                    "pending": {
                        "$sum": {"$cond": [{"$eq": ["$status", ComplaintStatus.PENDING]}, 1, 0]}
                    },
                    "inProgress": {
                        "$sum": {"$cond": [{"$eq": ["$status", ComplaintStatus.IN_PROGRESS]}, 1, 0]}
                    }
                }
            }
        ]
        
        dept_stats_cursor = db.complaints.aggregate(pipeline)
        dept_stats_raw = await dept_stats_cursor.to_list(length=None)
        
        department_stats = []
        for stat in dept_stats_raw:
            department_stats.append(DepartmentStats(
                department=stat["_id"],
                total=stat["total"],
                completed=stat["completed"],
                pending=stat["pending"],
                inProgress=stat["inProgress"]
            ))
        
        analytics = AnalyticsResponse(
            totalComplaints=total_complaints,
            pendingComplaints=pending_complaints,
            inProgressComplaints=in_progress_complaints,
            completedComplaints=completed_complaints,
            criticalComplaints=critical_complaints,
            averageResolutionTime="2.5 days",  # This could be calculated from actual data
            departmentStats=department_stats
        )
        
        return APIResponse(
            success=True,
            data=analytics.dict(),
            message="Analytics retrieved successfully"
        )
        
    except Exception as e:
        logger.error(f"Error getting analytics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# User Routes
@api_router.get("/users", response_model=APIResponse)
async def get_users(
    search: Optional[str] = Query(None),
    current_admin: AdminUserResponse = Depends(require_main_admin)
):
    """Get all users with search (Main Admin only)"""
    try:
        db = get_database()
        
        query = {}
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
                {"phone": {"$regex": search, "$options": "i"}},
                {"id": {"$regex": search, "$options": "i"}}
            ]
        
        users = await db.users.find(query).sort("createdAt", -1).to_list(length=None)
        
        user_responses = []
        for user in users:
            user_responses.append(UserResponse(
                id=user["id"],
                name=user["name"],
                email=user["email"],
                phone=user["phone"],
                totalComplaints=user["totalComplaints"],
                resolvedComplaints=user["resolvedComplaints"],
                joinedDate=user["joinedDate"]
            ))
        
        return APIResponse(
            success=True,
            data=[u.dict() for u in user_responses],
            message="Users retrieved successfully"
        )
        
    except Exception as e:
        logger.error(f"Error getting users: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Admin Management Routes
@api_router.get("/admin/workers", response_model=APIResponse)
async def get_workers(current_admin: AdminUserResponse = Depends(require_main_admin)):
    """Get all department workers (Main Admin only)"""
    try:
        db = get_database()
        
        workers = await db.admin_users.find({
            "role": AdminRole.LOWER_ADMIN,
            "isActive": True
        }).sort("createdAt", -1).to_list(length=None)
        
        worker_responses = []
        for worker in workers:
            worker_responses.append(AdminUserResponse(
                id=worker["id"],
                username=worker["username"],
                name=worker["name"],
                email=worker["email"],
                role=worker["role"],
                department=worker["department"],
                assignedComplaints=worker.get("assignedComplaints", 0),
                completedComplaints=worker.get("completedComplaints", 0),
                isActive=worker["isActive"]
            ))
        
        return APIResponse(
            success=True,
            data=[w.dict() for w in worker_responses],
            message="Workers retrieved successfully"
        )
        
    except Exception as e:
        logger.error(f"Error getting workers: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# File Upload Routes
@api_router.post("/upload/proof", response_model=APIResponse)
async def upload_proof_files(
    files: List[UploadFile] = File(...),
    current_admin: AdminUserResponse = Depends(require_admin_access)
):
    """Upload proof files"""
    try:
        uploaded_files = []
        
        for file in files:
            # Validate file type
            if not file.content_type.startswith(('image/', 'video/')):
                raise HTTPException(status_code=400, detail=f"Invalid file type: {file.content_type}")
            
            # Generate unique filename
            file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
            unique_filename = f"{uuid.uuid4()}.{file_extension}"
            file_path = UPLOAD_DIR / unique_filename
            
            # Save file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            uploaded_files.append(unique_filename)
            logger.info(f"File uploaded: {unique_filename}")
        
        return APIResponse(
            success=True,
            data={"files": uploaded_files},
            message="Files uploaded successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading files: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Test route
@api_router.get("/")
async def root():
    return {"message": "Admin Dashboard API is running"}

# Include the router in the main app
app.include_router(api_router)