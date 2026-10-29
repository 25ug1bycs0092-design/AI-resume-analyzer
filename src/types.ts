export type PageId =
  | "dashboard"
  | "upload"
  | "history"
  | "jobs"
  | "resources"
  | "profile"
  | "settings";

export type AnalysisResult = {
  atsScore: number;
  title?: string;
  summary?: string;
  skills?: string[];
  analyzedAt: string;
};

export type AnalysisRecord = {
  id: string;
  name: string;
  role: string;
  date: string;
  score: number;
  status: "Reviewed" | "In progress";
  isSample: boolean;
};

export type Job = {
  id: string;
  company: string;
  initials: string;
  role: string;
  location: string;
  type: string;
  match: number;
  tone: "mint" | "lavender" | "peach" | "blue";
};