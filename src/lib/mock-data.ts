export interface Job {
  id: string;
  title: string;
  description: string;
  created_at: string;
  candidates_count: number;
  top_score: number | null;
}

export interface Candidate {
  id: string;
  job_id: string;
  name: string;
  headline: string;
  source: "upload" | "linkedin";
  match_score: number;
  ai_summary: string[];
  skills_matched: string[];
  skills_missing: string[];
  status: "pending" | "shortlisted" | "rejected";
  created_at: string;
}

export const MOCK_JOB_IMPORT = {
  title: "Senior Software Engineer",
  description:
    "We are looking for a Senior Software Engineer at TechCorp to build scalable backend systems using Python, design RESTful APIs, and work with PostgreSQL. Required: 3+ years Python, REST APIs, SQL. Preferred: AWS, Docker, Kubernetes.",
};

export const MOCK_CANDIDATES: Omit<Candidate, "id" | "job_id" | "created_at">[] = [
  {
    name: "Sarah Chen",
    headline: "Senior Backend Engineer at Google",
    source: "linkedin",
    match_score: 91,
    ai_summary: [
      "Strong Python & API background matches all core requirements",
      "AWS and Docker cover all preferred qualifications",
      "No critical gaps — recommend for immediate interview",
    ],
    skills_matched: ["Python", "REST APIs", "PostgreSQL", "AWS", "Docker"],
    skills_missing: ["Kubernetes"],
    status: "pending",
  },
  {
    name: "James Patel",
    headline: "Full Stack Developer at Startupco",
    source: "linkedin",
    match_score: 74,
    ai_summary: [
      "Solid Python and SQL experience matches core requirements",
      "REST API knowledge aligns well with role needs",
      "Missing cloud infrastructure experience (AWS, Docker) — trainable",
    ],
    skills_matched: ["Python", "SQL", "REST APIs", "Node.js"],
    skills_missing: ["AWS", "Docker", "Kubernetes"],
    status: "pending",
  },
  {
    name: "Alex Wong",
    headline: "Junior Developer at Agency",
    source: "linkedin",
    match_score: 42,
    ai_summary: [
      "Limited Python experience — primarily a frontend developer",
      "No backend infrastructure or API design experience",
      "Significant skill gaps for a senior role — not recommended",
    ],
    skills_matched: ["JavaScript", "HTML", "CSS"],
    skills_missing: ["Python", "REST APIs", "PostgreSQL", "AWS", "Docker", "Kubernetes"],
    status: "pending",
  },
];

export function getScoreColor(score: number): "green" | "yellow" | "red" {
  if (score >= 80) return "green";
  if (score >= 60) return "yellow";
  return "red";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "hsl(209, 85%, 40%)",
  "hsl(142, 71%, 35%)",
  "hsl(280, 65%, 45%)",
  "hsl(25, 95%, 50%)",
  "hsl(340, 75%, 50%)",
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
