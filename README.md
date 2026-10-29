# AI Resume Analyzer

A responsive React and TypeScript dashboard for resume insights, job recommendations,
analysis history, and career resources.

## Run locally

Install Node.js, then run:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite.

## Sample data and real resume analysis

The initial ATS scores, resume history, profile, and job recommendations are
illustrative sample data, clearly labeled in the dashboard. They are not real
analysis results. Without a configured analyzer, selecting a resume keeps the
file in the browser; it is not uploaded or scored.

To connect a compatible Flask resume analyzer, copy `.env.example` to `.env.local`,
set `VITE_RESUME_API_URL` to the analyzer's origin, and restart Vite. The analyzer
should accept `POST` multipart form data with a `resume` file field at
`VITE_RESUME_ANALYZE_PATH` (default `/analyze`) and return JSON with a numeric
`ats_score` between 0 and 100. Optional `title` and `summary` strings are also
displayed when present. Ensure the analyzer allows requests from the frontend
origin via CORS.

This repository contains the dashboard; it does not include or implement a
resume-analysis backend.
