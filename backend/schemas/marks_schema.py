def marks_serializer(mark) -> dict:
    return {
        "id": str(mark["_id"]),
        "student_id": mark["student_id"],
        "subject": mark["subject"],
        "exam": mark["exam"],
        "marks": mark["marks"],
        "max_marks": mark["max_marks"]
    }