from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Student Grade Calculator API")

# ---------------------------------------------------------------------------
# CORS – allow requests from any origin during development.
# In production you should restrict this to your Vercel frontend URL, e.g.:
#   origins = ["https://your-app.vercel.app"]
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class GradeRequest(BaseModel):
    name: str
    obtained_marks: float
    total_marks: float


class GradeResponse(BaseModel):
    name: str
    percentage: float
    grade: str


# ---------------------------------------------------------------------------
# Grade logic
# ---------------------------------------------------------------------------
def assign_grade(percentage: float) -> str:
    if percentage >= 80:
        return "A"
    elif percentage >= 70:
        return "B"
    elif percentage >= 60:
        return "C"
    elif percentage >= 50:
        return "D"
    else:
        return "F"


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/")
def root():
    """Health-check endpoint."""
    return {"status": "ok", "message": "Student Grade Calculator API is running"}


@app.post("/calculate", response_model=GradeResponse)
def calculate_grade(request: GradeRequest):
    """
    Calculate the percentage and letter grade for a student.

    Rules:
        A  = 80% and above
        B  = 70 – 79%
        C  = 60 – 69%
        D  = 50 – 59%
        F  = Below 50%
    """
    percentage = round((request.obtained_marks / request.total_marks) * 100, 2)
    grade = assign_grade(percentage)
    return GradeResponse(name=request.name, percentage=percentage, grade=grade)
