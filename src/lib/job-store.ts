import { create } from "zustand";
import type { Job, Candidate } from "./mock-data";

interface JobStore {
  jobs: Job[];
  candidates: Candidate[];
  addJob: (title: string, description: string) => string;
  addCandidate: (candidate: Omit<Candidate, "id" | "created_at">) => void;
  updateCandidateStatus: (id: string, status: Candidate["status"]) => void;
  getJobCandidates: (jobId: string) => Candidate[];
  getJob: (id: string) => Job | undefined;
  getCandidate: (id: string) => Candidate | undefined;
}

export const useJobStore = create<JobStore>((set, get) => ({
  jobs: [
    {
      id: "demo-job-1",
      title: "Frontend Engineer",
      description: "Looking for a React developer with TypeScript experience.",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      candidates_count: 5,
      top_score: 88,
    },
    {
      id: "demo-job-2",
      title: "Data Scientist",
      description: "ML engineer with Python and TensorFlow experience needed.",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      candidates_count: 3,
      top_score: 76,
    },
  ],
  candidates: [],
  addJob: (title, description) => {
    const id = crypto.randomUUID();
    set((s) => ({
      jobs: [
        {
          id,
          title,
          description,
          created_at: new Date().toISOString(),
          candidates_count: 0,
          top_score: null,
        },
        ...s.jobs,
      ],
    }));
    return id;
  },
  addCandidate: (candidate) => {
    const id = crypto.randomUUID();
    const newCandidate: Candidate = {
      ...candidate,
      id,
      created_at: new Date().toISOString(),
    };
    set((s) => {
      const updatedJobs = s.jobs.map((j) => {
        if (j.id === candidate.job_id) {
          const jobCandidates = [...s.candidates.filter((c) => c.job_id === j.id), newCandidate];
          return {
            ...j,
            candidates_count: jobCandidates.length,
            top_score: Math.max(...jobCandidates.map((c) => c.match_score)),
          };
        }
        return j;
      });
      return { candidates: [...s.candidates, newCandidate], jobs: updatedJobs };
    });
  },
  updateCandidateStatus: (id, status) => {
    set((s) => ({
      candidates: s.candidates.map((c) => (c.id === id ? { ...c, status } : c)),
    }));
  },
  getJobCandidates: (jobId) => get().candidates.filter((c) => c.job_id === jobId).sort((a, b) => b.match_score - a.match_score),
  getJob: (id) => get().jobs.find((j) => j.id === id),
  getCandidate: (id) => get().candidates.find((c) => c.id === id),
}));
