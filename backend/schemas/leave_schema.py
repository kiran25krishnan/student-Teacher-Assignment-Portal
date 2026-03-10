def leave_serializer(leave) -> dict:
    return {
        "id": str(leave["_id"]),
        "student_id": leave["student_id"],
        "reason": leave["reason"],
        "from_date": leave["from_date"],
        "to_date": leave["to_date"],
        "status": leave["status"]
    }