"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface GradeResult {
  name: string;
  percentage: number;
  grade: string;
}

interface FormState {
  name: string;
  obtained_marks: string;
  total_marks: string;
}

// ---------------------------------------------------------------------------
// Grade colour mapping (for visual feedback)
// ---------------------------------------------------------------------------
const GRADE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  A: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "Excellent" },
  B: { bg: "bg-blue-500/20",    text: "text-blue-400",    label: "Good"      },
  C: { bg: "bg-yellow-500/20",  text: "text-yellow-400",  label: "Average"   },
  D: { bg: "bg-orange-500/20",  text: "text-orange-400",  label: "Poor"      },
  F: { bg: "bg-red-500/20",     text: "text-red-400",     label: "Fail"      },
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function Home() {
  const [form, setForm] = useState<FormState>({
    name: "",
    obtained_marks: "",
    total_marks: "",
  });
  const [result, setResult] = useState<GradeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The environment variable is injected at build-time by Next.js.
  // Locally: set NEXT_PUBLIC_API_URL=http://localhost:8000 in .env.local
  // On Vercel: set NEXT_PUBLIC_API_URL=https://your-app.onrender.com
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    // Basic client-side validation
    const obtained = parseFloat(form.obtained_marks);
    const total = parseFloat(form.total_marks);

    if (!form.name.trim()) {
      setError("Please enter the student name.");
      return;
    }
    if (isNaN(obtained) || isNaN(total)) {
      setError("Marks must be valid numbers.");
      return;
    }
    if (total <= 0) {
      setError("Total marks must be greater than 0.");
      return;
    }
    if (obtained < 0 || obtained > total) {
      setError("Obtained marks must be between 0 and total marks.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          obtained_marks: obtained,
          total_marks: total,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: GradeResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Request failed: ${err.message}`
          : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  const gradeStyle = result ? GRADE_STYLES[result.grade] ?? GRADE_STYLES.F : null;

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 mb-4">
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Grade Calculator</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Enter marks to calculate the student&apos;s grade
          </p>
        </div>

        {/* ── Card ── */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Student Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Student Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Ali Ahmed"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white
                           placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500
                           transition"
              />
            </div>

            {/* Marks row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="obtained_marks"
                  className="block text-sm font-medium text-slate-300 mb-1"
                >
                  Obtained Marks
                </label>
                <input
                  id="obtained_marks"
                  name="obtained_marks"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 85"
                  value={form.obtained_marks}
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white
                             placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500
                             transition"
                />
              </div>
              <div>
                <label
                  htmlFor="total_marks"
                  className="block text-sm font-medium text-slate-300 mb-1"
                >
                  Total Marks
                </label>
                <input
                  id="total_marks"
                  name="total_marks"
                  type="number"
                  min="1"
                  step="any"
                  placeholder="e.g. 100"
                  value={form.total_marks}
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white
                             placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500
                             transition"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              id="calculate-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed
                         text-white font-semibold py-3 rounded-xl transition-all duration-200
                         active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Calculating…
                </span>
              ) : (
                "Calculate Grade"
              )}
            </button>
          </form>

          {/* ── Result ── */}
          {result && gradeStyle && (
            <div
              id="result-card"
              className={`mt-6 rounded-xl p-5 border ${gradeStyle.bg} border-opacity-30`}
            >
              <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Result
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-lg">{result.name}</p>
                  <p className="text-slate-300 text-sm mt-0.5">
                    {result.percentage}% · {gradeStyle.label}
                  </p>
                </div>
                <div
                  className={`text-5xl font-black ${gradeStyle.text}`}
                  id="grade-display"
                >
                  {result.grade}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${gradeStyle.text.replace(
                    "text-",
                    "bg-"
                  )}`}
                  style={{ width: `${Math.min(result.percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Grade legend ── */}
        <div className="mt-4 grid grid-cols-5 gap-2 text-center">
          {Object.entries(GRADE_STYLES).map(([grade, style]) => (
            <div key={grade} className={`rounded-lg py-2 ${style.bg}`}>
              <span className={`font-bold text-sm ${style.text}`}>{grade}</span>
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-slate-600 text-xs mt-6">
          Frontend: Vercel · Backend: Render
        </p>
      </div>
    </main>
  );
}
