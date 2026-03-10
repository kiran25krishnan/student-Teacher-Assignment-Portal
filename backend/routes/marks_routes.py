from fastapi import APIRouter
from database import marks_collection
from models.marks_model import Marks

router = APIRouter(prefix="/marks", tags=["Marks"])


@router.post("/")
async def create_marks(mark: Marks):

    result = await marks_collection.insert_one(mark.dict())

    return {"id": str(result.inserted_id)}


@router.get("/")
async def get_marks():

    marks = []

    async for mark in marks_collection.find():
        mark["id"] = str(mark["_id"])
        marks.append(mark)

    return marks


@router.put("/{id}")
async def update_marks(id: str, mark: Marks):

    await marks_collection.update_one(
        {"_id": id},
        {"$set": mark.dict()}
    )

    return {"message": "updated"}


@router.delete("/{id}")
async def delete_marks(id: str):

    await marks_collection.delete_one({"_id": id})

    return {"message": "deleted"}