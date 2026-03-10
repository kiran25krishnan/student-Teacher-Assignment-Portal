from fastapi import APIRouter
from database import users_collection
from models.user_model import User
from utils.password_hash import hash_password, verify_password
from utils.jwt_auth import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register")
async def register(user: User):

    user.password = hash_password(user.password)

    result = await users_collection.insert_one(user.dict())

    return {"message": "User created", "id": str(result.inserted_id)}


@router.post("/login")
async def login(email: str, password: str):

    user = await users_collection.find_one({"email": email})

    if not user:
        return {"error": "User not found"}

    if not verify_password(password, user["password"]):
        return {"error": "Invalid password"}

    token = create_access_token({"user_id": str(user["_id"]), "role": user["role"]})

    return {"access_token": token}