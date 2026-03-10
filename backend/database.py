from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb://localhost:27017"

client = AsyncIOMotorClient(MONGO_URL)

db = client["school_db"]

users_collection = db["users"]
students_collection = db["students"]
marks_collection = db["marks"]
leave_collection = db["leave_requests"]