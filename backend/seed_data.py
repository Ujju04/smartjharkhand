import asyncio
from datetime import datetime, timedelta
from auth import get_password_hash
from database import connect_to_mongo, get_database, init_counters
from models import AdminRole, ComplaintPriority, ComplaintStatus
import logging

logger = logging.getLogger(__name__)

async def seed_database():
    """Seed the database with initial data"""
    try:
        await connect_to_mongo()
        await init_counters()
        db = get_database()
        
        # Clear existing data (for development)
        await db.users.delete_many({})
        await db.complaints.delete_many({})
        await db.admin_users.delete_many({})
        
        logger.info("Cleared existing data")
        
        # Seed admin users
        await seed_admin_users(db)
        
        # Seed regular users
        await seed_users(db)
        
        # Seed complaints
        await seed_complaints(db)
        
        logger.info("Database seeded successfully!")
        
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        raise

async def seed_admin_users(db):
    """Seed admin users"""
    admin_users = [
        {
            "id": "admin",
            "username": "admin",
            "password": get_password_hash("admin123"),
            "name": "System Administrator",
            "email": "admin@system.com",
            "role": AdminRole.MAIN_ADMIN,
            "department": None,
            "assignedComplaints": 0,
            "completedComplaints": 0,
            "isActive": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "id": "worker1",
            "username": "mike.wilson",
            "password": get_password_hash("worker123"),
            "name": "Mike Wilson",
            "email": "mike.wilson@admin.com",
            "role": AdminRole.LOWER_ADMIN,
            "department": "Public Works",
            "assignedComplaints": 2,
            "completedComplaints": 15,
            "isActive": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "id": "worker2",
            "username": "lisa.chen",
            "password": get_password_hash("worker123"),
            "name": "Lisa Chen",
            "email": "lisa.chen@admin.com",
            "role": AdminRole.LOWER_ADMIN,
            "department": "Waste Management",
            "assignedComplaints": 0,
            "completedComplaints": 12,
            "isActive": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "id": "worker3",
            "username": "david.kumar",
            "password": get_password_hash("worker123"),
            "name": "David Kumar",
            "email": "david.kumar@admin.com",
            "role": AdminRole.LOWER_ADMIN,
            "department": "Water Department",
            "assignedComplaints": 0,
            "completedComplaints": 8,
            "isActive": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "id": "worker4",
            "username": "ana.rodriguez",
            "password": get_password_hash("worker123"),
            "name": "Ana Rodriguez",
            "email": "ana.rodriguez@admin.com",
            "role": AdminRole.LOWER_ADMIN,
            "department": "Traffic Management",
            "assignedComplaints": 0,
            "completedComplaints": 10,
            "isActive": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
    ]
    
    await db.admin_users.insert_many(admin_users)
    logger.info(f"Seeded {len(admin_users)} admin users")

async def seed_users(db):
    """Seed regular users"""
    users = [
        {
            "id": "USER001",
            "name": "John Doe",
            "email": "john.doe@email.com",
            "phone": "+1234567890",
            "totalComplaints": 3,
            "resolvedComplaints": 2,
            "joinedDate": datetime(2024, 6, 15),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "id": "USER002",
            "name": "Sarah Smith",
            "email": "sarah.smith@email.com",
            "phone": "+1234567891",
            "totalComplaints": 1,
            "resolvedComplaints": 0,
            "joinedDate": datetime(2024, 8, 22),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "id": "USER003",
            "name": "Robert Johnson",
            "email": "robert.johnson@email.com",
            "phone": "+1234567892",
            "totalComplaints": 5,
            "resolvedComplaints": 4,
            "joinedDate": datetime(2024, 3, 10),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "id": "USER004",
            "name": "Emma Davis",
            "email": "emma.davis@email.com",
            "phone": "+1234567893",
            "totalComplaints": 2,
            "resolvedComplaints": 1,
            "joinedDate": datetime(2024, 9, 5),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "id": "USER005",
            "name": "James Wilson",
            "email": "james.wilson@email.com",
            "phone": "+1234567894",
            "totalComplaints": 1,
            "resolvedComplaints": 0,
            "joinedDate": datetime(2024, 11, 18),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
    ]
    
    await db.users.insert_many(users)
    logger.info(f"Seeded {len(users)} users")

async def seed_complaints(db):
    """Seed complaints"""
    now = datetime.utcnow()
    complaints = [
        {
            "id": "CMP001",
            "title": "Street Light Not Working",
            "description": "Street light on Main Street has been broken for 2 weeks",
            "category": "Infrastructure",
            "department": "Public Works",
            "priority": ComplaintPriority.HIGH,
            "status": ComplaintStatus.IN_PROGRESS,
            "userId": "USER001",
            "userEmail": "john.doe@email.com",
            "userPhone": "+1234567890",
            "assignedTo": "worker1",
            "assignedWorker": "Mike Wilson",
            "proofImages": [],
            "remarks": "Work started, parts ordered",
            "createdAt": now - timedelta(days=2, hours=10),
            "updatedAt": now - timedelta(days=1, hours=14)
        },
        {
            "id": "CMP002",
            "title": "Water Leakage in Park",
            "description": "Major water pipe leak causing flooding in Central Park",
            "category": "Water",
            "department": "Water Department",
            "priority": ComplaintPriority.CRITICAL,
            "status": ComplaintStatus.PENDING,
            "userId": "USER002",
            "userEmail": "sarah.smith@email.com",
            "userPhone": "+1234567891",
            "assignedTo": None,
            "assignedWorker": None,
            "proofImages": [],
            "remarks": "",
            "createdAt": now - timedelta(hours=8),
            "updatedAt": now - timedelta(hours=8)
        },
        {
            "id": "CMP003",
            "title": "Garbage Collection Missed",
            "description": "Garbage not collected for 3 days in residential area",
            "category": "Sanitation",
            "department": "Waste Management",
            "priority": ComplaintPriority.MEDIUM,
            "status": ComplaintStatus.COMPLETED,
            "userId": "USER003",
            "userEmail": "robert.johnson@email.com",
            "userPhone": "+1234567892",
            "assignedTo": "worker2",
            "assignedWorker": "Lisa Chen",
            "proofImages": ["proof1.jpg", "proof2.jpg"],
            "remarks": "Area cleaned, schedule updated",
            "createdAt": now - timedelta(days=3, hours=16),
            "updatedAt": now - timedelta(hours=11)
        },
        {
            "id": "CMP004",
            "title": "Road Pothole Repair",
            "description": "Large pothole on Oak Avenue causing traffic issues",
            "category": "Infrastructure",
            "department": "Public Works",
            "priority": ComplaintPriority.HIGH,
            "status": ComplaintStatus.IN_PROGRESS,
            "userId": "USER004",
            "userEmail": "emma.davis@email.com",
            "userPhone": "+1234567893",
            "assignedTo": "worker1",
            "assignedWorker": "Mike Wilson",
            "proofImages": [],
            "remarks": "Materials arranged, work scheduled for tomorrow",
            "createdAt": now - timedelta(days=1, hours=12),
            "updatedAt": now - timedelta(hours=9)
        },
        {
            "id": "CMP005",
            "title": "Broken Traffic Signal",
            "description": "Traffic light at 5th and Main intersection not functioning",
            "category": "Traffic",
            "department": "Traffic Management",
            "priority": ComplaintPriority.CRITICAL,
            "status": ComplaintStatus.PENDING,
            "userId": "USER005",
            "userEmail": "james.wilson@email.com",
            "userPhone": "+1234567894",
            "assignedTo": None,
            "assignedWorker": None,
            "proofImages": [],
            "remarks": "",
            "createdAt": now - timedelta(hours=2),
            "updatedAt": now - timedelta(hours=2)
        }
    ]
    
    await db.complaints.insert_many(complaints)
    logger.info(f"Seeded {len(complaints)} complaints")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(seed_database())