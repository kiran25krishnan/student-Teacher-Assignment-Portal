from fastapi import APIRouter
from database import marks_collection
from models.marks_model import Marks
from bson import ObjectId

router = APIRouter(prefix="/marks", tags=["Marks"])


@router.post("/")
async def create_marks(mark: Marks):

    result = await marks_collection.insert_one(mark.dict())

    return {"id": str(result.inserted_id)}


@router.get("/")
async def get_marks(student_id: str = None, subject: str = None, exam: str = None):

    query = {}

    if student_id:
        query["student_id"] = student_id

    if subject:
        query["subject"] = subject

    if exam:
        query["exam"] = exam

    marks = []

    async for mark in marks_collection.find(query):
        mark["id"] = str(mark["_id"])
        del mark["_id"] 
        marks.append(mark)

    return marks


@router.put("/{id}")
async def update_marks(id: str, mark: Marks):

    await marks_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": mark.dict()}
    )

    return {"message": "updated"}


@router.delete("/{id}")
async def delete_marks(id: str):

    await marks_collection.delete_one({"_id": ObjectId(id)})

    return {"message": "deleted"}