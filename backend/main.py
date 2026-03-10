from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth_routes, marks_routes, leave_routes, student_routes
from routes import report_routes

app = FastAPI(title="School Management API")

# ✅ Add this block
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(marks_routes.router)
app.include_router(leave_routes.router)
app.include_router(student_routes.router)
app.include_router(report_routes.router)

@app.get("/")
def root():
    return {"message": "API running"}
