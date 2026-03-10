from pydantic import BaseModel

class Student(BaseModel):
    name: str
    roll_number: int
    class_name: str