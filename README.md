# JobFitAI

> AI-powered resume screening and candidate ranking for lean hiring teams.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=flat-square&logo=vercel)](https://job-fit-ai-4uff.vercel.app)
[![Tech Stack](https://img.shields.io/badge/Stack-React%20%2B%20Supabase%20%2B%20Groq-blue?style=flat-square)]()
[![Hackathon](https://img.shields.io/badge/Built%20at-Hackathon-orange?style=flat-square)]()

---

## Overview

JobFitAI is a web application that helps HR recruiters screen and rank candidates without a dedicated HR team. Recruiters post a job, import candidate profiles from any platform or upload a PDF resume, and receive an AI-generated match score, skill gap breakdown, and reasoning summary for each candidate — automatically sorted from best to worst fit.

It was built during a hackathon with a focus on solving a real, practical problem: small companies and startups spend significant time manually comparing resumes against job descriptions. JobFitAI compresses that process to under 30 seconds per shortlist. The app is partially production-ready, with some features mocked or simplified due to time constraints.

---

## Problem Statement

Small startups and independent recruiters rarely have the budget for enterprise ATS platforms (Greenhouse, Lever, Workday). They end up manually reading every resume, comparing it mentally against a job description, and making hiring decisions that are slow, inconsistent, and prone to bias.

There is no lightweight, affordable tool that can instantly evaluate and rank candidates based purely on their skills and experience relative to a specific job description — and explain *why* each candidate was ranked the way they were.

---

## Solution / Approach

JobFitAI takes a simple approach: give the AI both the job description and the candidate's resume text, ask it to score the match and explain its reasoning, then persist and rank all results in a database.

The core workflow:
1. Recruiter posts a job with a title and description
2. Candidates are added via text paste, URL import, or PDF upload
3. Each candidate's resume text is sent to the Groq LLM alongside the job description
4. The model returns a structured JSON response: match score (0–100), 3 reasoning bullets, matched skills, and missing skills
5. Candidates are saved to Supabase and displayed ranked by score
6. Recruiter shortlists, rejects, annotates, and exports

Scoring is purely skills- and experience-based. Candidate names and photos are not factored into scoring.

---

## Tech Stack

**Frontend**
- React + Vite + TypeScript
- Tailwind CSS + shadcn/ui + Radix UI
- Zustand (state management)

**Backend / Database**
- Supabase (PostgreSQL + Auth)
- Supabase Auth — email/password, session persistence, protected routes

**AI**
- Groq API — `llama-3.1-8b-instant` model
- Structured JSON prompt → match score + reasoning

**Document Processing**
- pdfjs-dist — client-side PDF text extraction (no server required)

**Infrastructure**
- Vercel — auto-deploy from `main` branch

---

## Project Structure

```
JobFitAI/
├── src/                  # All application source code
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route-level page components
│   ├── lib/              # Supabase client, utilities
│   ├── store/            # Zustand state stores
│   └── types/            # TypeScript type definitions
├── api/                  # Serverless API functions (Vercel)
├── public/               # Static assets
├── index.html            # HTML entry point
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind configuration
├── components.json       # shadcn/ui component config
├── .env                  # Environment variables (not committed)
└── package.json
```

---

## Application Flow

1. **Sign up / Log in** — HR recruiter creates an account or signs in at `/login`. Session persists across reloads.

2. **Set up profile** — On the dashboard, the recruiter fills in their name, title, and company. Saved to Supabase and displayed on the sidebar.

3. **Post a job** — Click "Post a Job" → `/jobs/new`. Either paste a job posting URL (mock import with pre-written descriptions) or fill in the title and description manually. Job is saved and the recruiter is redirected to the job detail page.

4. **Add candidates** — On the job detail page (`/jobs/:id`), candidates are added via one of three methods:
   - **Paste Profile Text** — copy-paste a candidate's profile from LinkedIn, Naukri, Indeed, or anywhere
   - **Import by URL** — paste a profile URL (mock import for demo purposes)
   - **Upload Resume** — upload a PDF; text is extracted client-side via pdfjs-dist

5. **AI screening** — On submission, the resume text and job description are sent to the Groq API. The model returns a structured JSON with: `match_score`, `summary` (3 bullets), `skills_matched`, and `skills_missing`. This takes 2–3 seconds.

6. **Ranked list** — The candidate appears immediately in the ranked list, sorted by score descending. Rank position, name, headline, top matched skills, and score badge are visible at a glance.

7. **Candidate detail** — Click a candidate to open `/jobs/:id/candidates/:cid`. Shows the full score, AI reasoning bullets, skills matched vs missing side-by-side, and action buttons (Shortlist / Reject).

8. **Shortlist and annotate** — Recruiter clicks Shortlist or Reject. Status updates instantly in the UI and persists to Supabase. Private notes can be added per candidate.

9. **Filter and export** — Use the status filter bar to view only Shortlisted or Rejected candidates. Click "Export Shortlist CSV" to download the ranked shortlist with scores, skills, and status.

10. **Global candidates view** — `/candidates` shows all candidates across all jobs, grouped by job title, for a full pipeline overview.

---

## Usage Guide

**First time:**
1. Go to the [live app](https://job-fit-ai-4uff.vercel.app) and sign up with an email and password
2. Fill in your name, title, and company on the dashboard sidebar
3. Click "Post a Job" — either paste a URL or fill in the job details manually

**Screening a candidate:**
1. Open a job from the dashboard or jobs list
2. In the "Add Candidates" section, choose your input method (text paste, URL, or PDF)
3. Paste or upload the candidate's profile and click "Screen Candidate"
4. The candidate appears in the ranked list within a few seconds

**Reviewing results:**
- Click a candidate card to see their full score breakdown, AI reasoning, and skills analysis
- Use "Shortlist" or "Reject" to update their status
- Add notes in the notes textarea — they save automatically

**Exporting:**
- Once you have candidates, click "Export Shortlist CSV" on the job detail page
- The CSV includes name, score, matched skills, missing skills, and status

---

## Setup Instructions

### Prerequisites

- Node.js >= 18 or Bun
- A [Supabase](https://supabase.com) project
- A [Groq](https://console.groq.com) API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yaswanthnaidu-yalla/JobFitAI.git
cd JobFitAI

# Install dependencies
npm install
# or
bun install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
```

### Supabase Setup

Create the following tables in your Supabase project. Run these in the SQL editor:

```sql
-- Jobs table
create table jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  created_at timestamptz default now(),
  candidates_count integer default 0,
  top_score integer default 0,
  status text default 'active'
);

-- Candidates table
create table candidates (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  name text,
  headline text,
  resume_url text,
  source text,
  match_score integer,
  ai_summary text[],
  skills_matched text[],
  skills_missing text[],
  status text default 'pending',
  notes text,
  created_at timestamptz default now()
);

-- Profiles table
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  title text,
  company text,
  updated_at timestamptz default now()
);
```

Enable Row Level Security (RLS) on all tables and configure policies as needed for your use case.

### Running the Project

```bash
# Start the development server
npm run dev
# or
bun dev
```

App will be available at `http://localhost:5173`

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Limitations

These are known limitations resulting from hackathon time constraints:

- **URL import is mocked** — pasting a job posting URL or candidate profile URL does not actually scrape the page. It selects from a pool of pre-written sample descriptions/profiles for demo purposes. Real scraping would require a backend proxy to bypass CORS restrictions.
- **No real LinkedIn/Naukri integration** — profile import is copy-paste only. There is no API integration with any job board.
- **No email notifications** — candidate status changes (shortlisted / rejected) do not trigger any notifications.
- **Single-user scoped** — jobs and candidates are not shared across HR accounts. There is no team or organization layer.
- **No resume storage** — uploaded PDFs are processed client-side and the extracted text is stored, but the original file is not stored in Supabase Storage.
- **AI prompt is minimal** — the Groq prompt is functional but not heavily tuned. Edge cases (non-English resumes, heavily formatted PDFs) may produce inconsistent scores.
- **No pagination** — candidate and job lists load all records at once. Will not scale beyond a few hundred records without changes.
- **`.env` committed** — the `.env` file is present in the repository. This is intentional for the hackathon demo but should never be done in production.

---

## Future Improvements

- **Real URL scraping** — implement a serverless proxy (Vercel Edge Function) to fetch and parse job posting and profile URLs
- **Supabase Storage for resumes** — store uploaded PDFs and link them to candidate records
- **Team / org support** — allow multiple HR users under a shared workspace with role-based access
- **Prompt tuning** — improve the Groq prompt with few-shot examples and stricter output validation for more consistent scoring
- **Pagination and search** — add server-side pagination and indexed search for large candidate pools
- **Email notifications** — send candidates or internal team members status update emails via Resend or Supabase Edge Functions
- **Webhook / ATS integrations** — push shortlisted candidates to external tools like Notion, Airtable, or email
- **Analytics dashboard** — track time-to-shortlist, score distributions, and hiring funnel metrics over time

---

## Acknowledgements

Built during a hackathon. AI usage was a requirement — this project was made with AI assistance.

Development used Groq's LLM API for candidate screening, and AI coding tools were used throughout the development process. The project is intentionally transparent about what is real, what is mocked, and where shortcuts were taken.
