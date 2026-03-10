from fastapi import FastAPI
from routes import auth_routes, marks_routes, leave_routes, student_routes

app = FastAPI(title="School Management API")

app.include_router(auth_routes.router)
app.include_router(marks_routes.router)
app.include_router(leave_routes.router)
app.include_router(student_routes.router)


@app.get("/")
def root():
    return {"message": "API running"}