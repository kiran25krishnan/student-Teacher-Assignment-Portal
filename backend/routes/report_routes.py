from fastapi import APIRouter
from database import marks_collection

router = APIRouter(prefix="/report", tags=["Report"])


def calculate_grade(avg):

    if avg >= 90:
        return "A"
    elif avg >= 75:
        return "B"
    elif avg >= 60:
        return "C"
    elif avg >= 50:
        return "D"
    else:
        return "F"


@router.get("/{student_id}")
async def student_report(student_id: str):

    marks = []

    async for mark in marks_collection.find({"student_id": student_id}):
        marks.append(mark)

    subject_data = {}

    for m in marks:
        subject = m["subject"]
        subject_data.setdefault(subject, []).append(m["marks"])

    report = {}

    for subject, scores in subject_data.items():

        avg = sum(scores) / len(scores)

        report[subject] = {
            "average": avg,
            "grade": calculate_grade(avg)
        }

    return report