# Student Grade Calculator 🎓

A full-stack web application for learning deployment concepts.

- **Frontend:** Next.js + TypeScript + Tailwind CSS → deployed on **Vercel**
- **Backend:** FastAPI + Pydantic → deployed on **Render**

## Project Structure

```
Student_Grading/
├── frontend/          # Next.js app (Vercel)
│   ├── app/
│   │   ├── page.tsx   # Main calculator page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── .env.local     # Local env vars (git-ignored)
│   ├── next.config.ts
│   └── package.json
│
└── backend/           # FastAPI app (Render)
    ├── main.py        # API with /calculate endpoint
    ├── requirements.txt
    └── README.md
```

## Quick Start (Local)

### Backend
```bash
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
# Create .env.local and add:
# NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev
```

Open http://localhost:3000

## Deployment

See the [Deployment Guide](./DEPLOYMENT.md) for step-by-step instructions.
