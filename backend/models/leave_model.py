from pydantic import BaseModel

class LeaveRequest(BaseModel):
    student_id: str
    reason: str
    from_date: str
    to_date: str
    status: str = "pending"