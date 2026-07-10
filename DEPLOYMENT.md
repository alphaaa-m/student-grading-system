# 🚀 Deployment Guide – Student Grade Calculator

## Architecture Overview

```
Browser (User)
    │
    │  HTTPS request
    ▼
┌──────────────────────┐
│   Vercel             │  ← Next.js Frontend
│   your-app.vercel.app│
└──────────┬───────────┘
           │
           │  POST /calculate  (HTTPS, JSON)
           │  NEXT_PUBLIC_API_URL env var
           ▼
┌──────────────────────┐
│   Render             │  ← FastAPI Backend
│   your-api.onrender. │
│   com                │
└──────────────────────┘
```

**Key concept:** The frontend and backend are two completely separate services, each deployed independently. They talk to each other through a public HTTP API.

---

## Step 0 – Push to GitHub

Every deployment platform (Render, Vercel) pulls code from GitHub automatically.

```bash
# In d:\Student_Grading
git init
git add .
git commit -m "Initial commit – Student Grade Calculator"
```

1. Go to https://github.com/new
2. Create a **public** repository (e.g. `student-grade-calculator`)
3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/student-grade-calculator.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 1 – Deploy the Backend on Render

### 1.1 Create a Render Account
1. Go to https://render.com and sign up (free tier available).
2. Connect your **GitHub** account when prompted.

### 1.2 Create a New Web Service
1. Click **"New +"** → **"Web Service"**
2. Select your `student-grade-calculator` repository
3. Fill in the settings:

| Setting | Value |
|---------|-------|
| **Name** | `student-grade-api` (or any name) |
| **Region** | Closest to you |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | Free |

> [!IMPORTANT]
> The `--host 0.0.0.0` flag is **required** on Render. Without it, the server only listens on localhost and Render's proxy cannot reach it.
> The `$PORT` variable is automatically provided by Render — do **not** hardcode a port number.

### 1.3 Deploy
1. Click **"Create Web Service"**
2. Watch the build logs – it will run `pip install -r requirements.txt`
3. Once the status shows **"Live"**, your API is deployed

### 1.4 Get Your Backend URL
Your API URL will look like:
```
https://student-grade-api.onrender.com
```

**Test it:**
```bash
curl https://student-grade-api.onrender.com/
# Expected: {"status":"ok","message":"Student Grade Calculator API is running"}

curl -X POST https://student-grade-api.onrender.com/calculate \
  -H "Content-Type: application/json" \
  -d '{"name":"Ali","obtained_marks":85,"total_marks":100}'
# Expected: {"name":"Ali","percentage":85.0,"grade":"A"}
```

---

## Step 2 – Deploy the Frontend on Vercel

### 2.1 Create a Vercel Account
1. Go to https://vercel.com and sign up (free tier available).
2. Connect your **GitHub** account.

### 2.2 Import Your Repository
1. Click **"Add New…"** → **"Project"**
2. Find and click **"Import"** next to your `student-grade-calculator` repo

### 2.3 Configure the Project

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js (auto-detected) |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` (auto) |
| **Output Directory** | `.next` (auto) |

### 2.4 Set the Environment Variable

> [!IMPORTANT]
> This is the most critical step. The frontend needs to know your backend URL **at build time**.

1. Expand **"Environment Variables"**
2. Add:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://student-grade-api.onrender.com`  ← your actual Render URL

3. Click **"Deploy"**

### 2.5 Get Your Frontend URL
After deployment, your app will be at:
```
https://student-grade-calculator.vercel.app
```

---

## Step 3 – Update CORS on the Backend

> [!NOTE]
> The current `main.py` uses `allow_origins=["*"]` which works for learning. For production, restrict it to your Vercel URL.

Edit `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://student-grade-calculator.vercel.app"],  # your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Push to GitHub → Render auto-redeploys.

---

## Step 4 – Test the Full Flow

Open your Vercel URL in a browser and try:

```
Browser → Vercel (Next.js) → Render (FastAPI) → JSON → UI
```

Open DevTools → Network tab → Submit the form → you should see a `POST /calculate` request to your Render URL returning JSON.

---

## How to Update and Redeploy

Both Vercel and Render watch your `main` branch by default.

```bash
# Make your changes, then:
git add .
git commit -m "Fix: update grade boundary logic"
git push origin main
```

- **Render** detects the push → rebuilds backend automatically (~1–2 min)
- **Vercel** detects the push → rebuilds frontend automatically (~30 sec)

---

## Common Deployment Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Forgot `--host 0.0.0.0` in start command | Render service starts but requests time out | Add `--host 0.0.0.0` to start command |
| Hardcoded port instead of `$PORT` | Render can't bind to port | Use `--port $PORT` |
| `NEXT_PUBLIC_API_URL` not set on Vercel | 404 or fetch to `localhost:8000` from browser | Add env var in Vercel dashboard → redeploy |
| CORS not configured | Browser error: "Access-Control-Allow-Origin" | Add your Vercel URL to `allow_origins` in `main.py` |
| Committed `.env.local` | Secrets exposed | Add `.env.local` to `.gitignore` |
| Root Directory not set to `backend` or `frontend` | Wrong files deployed | Set Root Directory in Render/Vercel settings |
| Free Render tier sleeps | First request takes 30–60 seconds | Expected on free tier; upgrade to paid to avoid |
| `NEXT_PUBLIC_` prefix missing | Env var undefined in browser | Variable MUST start with `NEXT_PUBLIC_` to be exposed |

---

## Environment Variable Explained

```
NEXT_PUBLIC_API_URL = https://your-api.onrender.com
│          │                  │
│          │                  └─ Your deployed backend
│          └─ Accessible in browser JS (public)
└─ Next.js prefix convention
```

**Why the prefix matters:**
- Variables without `NEXT_PUBLIC_` are only available in server-side code
- Variables with `NEXT_PUBLIC_` are embedded into the browser bundle at build time
- Never put secrets (API keys, passwords) in `NEXT_PUBLIC_` variables

---

## Local Development vs Production

| Concern | Local | Production |
|---------|-------|------------|
| Frontend URL | `http://localhost:3000` | `https://your-app.vercel.app` |
| Backend URL | `http://localhost:8000` | `https://your-api.onrender.com` |
| Env var value | `http://localhost:8000` | `https://your-api.onrender.com` |
| Env file | `.env.local` (git-ignored) | Vercel dashboard |
| CORS | `allow_origins=["*"]` | Specific Vercel URL |
