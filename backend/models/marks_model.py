from pydantic import BaseModel

class Marks(BaseModel):
    student_id: str
    subject: str
    exam: str
    marks: int
    max_marks: int