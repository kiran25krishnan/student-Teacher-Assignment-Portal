from fastapi import APIRouter
from database import students_collection
from models.student_model import Student

router = APIRouter(prefix="/students", tags=["Students"])


@router.post("/")
async def create_student(student: Student):

    result = await students_collection.insert_one(student.dict())

    return {"id": str(result.inserted_id)}


@router.get("/")
async def get_students():

    students = []

    async for student in students_collection.find():
        student["id"] = str(student["_id"])
        del student["_id"]
        students.append(student)

    return students