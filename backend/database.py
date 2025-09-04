from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING
import os
from pathlib import Path
from dotenv import load_dotenv
import logging

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    database = None

# Database connection
def get_database():
    return Database.database

async def connect_to_mongo():
    """Create database connection"""
    try:
        Database.client = AsyncIOMotorClient(os.environ['MONGO_URL'])
        Database.database = Database.client[os.environ['DB_NAME']]
        
        # Test connection
        await Database.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
        
        # Create indexes for better performance
        await create_indexes()
        
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    if Database.client:
        Database.client.close()
        logger.info("Disconnected from MongoDB")

async def create_indexes():
    """Create database indexes for better query performance"""
    try:
        db = Database.database
        
        # Users collection indexes
        await db.users.create_index([("email", ASCENDING)], unique=True)
        await db.users.create_index([("phone", ASCENDING)])
        await db.users.create_index([("id", ASCENDING)], unique=True)
        
        # Complaints collection indexes
        await db.complaints.create_index([("id", ASCENDING)], unique=True)
        await db.complaints.create_index([("userId", ASCENDING)])
        await db.complaints.create_index([("assignedTo", ASCENDING)])
        await db.complaints.create_index([("department", ASCENDING)])
        await db.complaints.create_index([("status", ASCENDING)])
        await db.complaints.create_index([("priority", ASCENDING)])
        await db.complaints.create_index([("createdAt", DESCENDING)])
        await db.complaints.create_index([
            ("title", "text"), 
            ("description", "text"),
            ("userEmail", "text")
        ])
        
        # Admin users collection indexes
        await db.admin_users.create_index([("username", ASCENDING)], unique=True)
        await db.admin_users.create_index([("email", ASCENDING)], unique=True)
        await db.admin_users.create_index([("id", ASCENDING)], unique=True)
        await db.admin_users.create_index([("role", ASCENDING)])
        await db.admin_users.create_index([("department", ASCENDING)])
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")

# Database helper functions
async def get_next_sequence_number(collection_name: str, prefix: str) -> str:
    """Generate next sequence number for IDs"""
    db = Database.database
    counter = await db.counters.find_one_and_update(
        {"_id": collection_name},
        {"$inc": {"sequence": 1}},
        upsert=True,
        return_document=True
    )
    return f"{prefix}{counter['sequence']:03d}"

async def init_counters():
    """Initialize counters for ID generation"""
    db = Database.database
    
    # Initialize counters if they don't exist
    counters = [
        {"_id": "users", "sequence": 5},  # Start from USER006
        {"_id": "complaints", "sequence": 5},  # Start from CMP006
        {"_id": "admin_users", "sequence": 4}  # Start from worker5
    ]
    
    for counter in counters:
        await db.counters.update_one(
            {"_id": counter["_id"]},
            {"$setOnInsert": counter},
            upsert=True
        )
    
    logger.info("Counters initialized successfully")

# Collection helper functions
async def get_complaints_collection():
    """Get complaints collection"""
    return Database.database.complaints

async def get_users_collection():
    """Get users collection"""
    return Database.database.users

async def get_admin_users_collection():
    """Get admin users collection"""
    return Database.database.admin_users

async def get_counters_collection():
    """Get counters collection"""
    return Database.database.counters