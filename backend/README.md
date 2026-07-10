# Student Grade Calculator – Backend

A minimal FastAPI backend that calculates student grades.

## Local Development

```bash
# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # macOS / Linux
venv\Scripts\activate           # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the dev server
uvicorn main:app --reload --port 8000
```

The API will be available at http://localhost:8000  
Interactive docs: http://localhost:8000/docs

## Endpoints

| Method | Path         | Description          |
|--------|--------------|----------------------|
| GET    | `/`          | Health check         |
| POST   | `/calculate` | Calculate grade      |

### POST /calculate

**Request**
```json
{
  "name": "Ali",
  "obtained_marks": 85,
  "total_marks": 100
}
```

**Response**
```json
{
  "name": "Ali",
  "percentage": 85.0,
  "grade": "A"
}
```

## Deployment on Render

- **Build command:** `pip install -r requirements.txt`
- **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment:** Python 3.11+
