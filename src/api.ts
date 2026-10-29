import type { AnalysisResult } from "./types";

const apiBaseUrl = import.meta.env.VITE_RESUME_API_URL?.trim();
const analyzePath = import.meta.env.VITE_RESUME_ANALYZE_PATH?.trim() || "/analyze";

export const isResumeApiConfigured = Boolean(apiBaseUrl);

export async function analyzeResume(file: File): Promise<AnalysisResult> {
  if (!apiBaseUrl) {
    throw new Error("Resume analysis is not configured.");
  }

  const url = new URL(analyzePath, apiBaseUrl.endsWith("/") ? apiBaseUrl : `${apiBaseUrl}/`);
  const body = new FormData();
  body.append("resume", file);

  let response: Response;
  try {
    response = await fetch(url, { method: "POST", body });
  } catch {
    throw new Error("Could not reach the resume analysis service. Check that it is running and try again.");
  }

  if (!response.ok) {
    throw new Error(`Resume analysis failed (${response.status}). Please try again.`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("The resume analysis service returned an invalid response.");
  }

  if (typeof data !== "object" || data === null || !("ats_score" in data)) {
    throw new Error("The resume analysis response is missing an ATS score.");
  }

  const result = data as {
    ats_score?: unknown;
    title?: unknown;
    summary?: unknown;
    skills?: unknown;
  };
  if (
    typeof result.ats_score !== "number" ||
    !Number.isFinite(result.ats_score) ||
    result.ats_score < 0 ||
    result.ats_score > 100
  ) {
    throw new Error("The resume analysis service returned an invalid ATS score.");
  }

  return {
    atsScore: result.ats_score,
    ...(typeof result.title === "string" ? { title: result.title } : {}),
    ...(typeof result.summary === "string" ? { summary: result.summary } : {}),
    ...(Array.isArray(result.skills) && result.skills.every((skill) => typeof skill === "string")
      ? { skills: result.skills }
      : {}),
    analyzedAt: new Date().toISOString(),
  };
}