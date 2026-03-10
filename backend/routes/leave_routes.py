from fastapi import APIRouter
from database import leave_collection
from models.leave_model import LeaveRequest

router = APIRouter(prefix="/leave", tags=["Leave"])


@router.post("/apply")
async def apply_leave(leave: LeaveRequest):

    result = await leave_collection.insert_one(leave.dict())

    return {"id": str(result.inserted_id)}


@router.get("/")
async def get_all_leave():

    leaves = []

    async for leave in leave_collection.find():
        leave["id"] = str(leave["_id"])
        leaves.append(leave)

    return leaves


@router.put("/{id}/approve")
async def approve_leave(id: str):

    await leave_collection.update_one(
        {"_id": id},
        {"$set": {"status": "approved"}}
    )

    return {"message": "approved"}