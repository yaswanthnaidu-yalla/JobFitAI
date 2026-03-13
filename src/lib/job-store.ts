import { create } from "zustand";
import type { Job, Candidate } from "./mock-data";
import { supabase } from "./supabase";

interface JobStore {
  jobs: Job[];
  candidates: Candidate[];
  getJobs: () => Promise<Job[]>;
  addJob: (title: string, description: string) => Promise<Job>;
  addCandidate: (
    candidate: Omit<Candidate, "id" | "created_at">
  ) => Promise<Candidate>;
  updateCandidateStatus: (
    id: string,
    status: Candidate["status"]
  ) => Promise<Candidate | null>;
  getJobCandidates: (jobId: string) => Promise<Candidate[]>;
  getJob: (id: string) => Promise<Job | null>;
  getCandidate: (id: string) => Candidate | undefined;
  deleteJob: (id: string) => Promise<void>;
  deleteCandidate: (id: string) => Promise<void>;
}

export const useJobStore = create<JobStore>((set, get) => ({
  jobs: [],
  candidates: [],

  // Fetch all jobs from Supabase
  getJobs: async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch jobs from Supabase:", error);
      throw error;
    }

    const list = (data as Job[]) ?? [];

    set(() => ({
      jobs: list,
    }));

    return list;
  },

  // Insert a new job into Supabase and update local cache
  addJob: async (title, description) => {
    const id = crypto.randomUUID();
    const newJob: Job = {
      id,
      title,
      description,
      created_at: new Date().toISOString(),
      candidates_count: 0,
      top_score: null,
    };

    const { data, error } = await supabase
      .from("jobs")
      .insert(newJob)
      .select("*")
      .single();

    if (error) {
      console.error("Failed to insert job into Supabase:", error);
      throw error;
    }

    const job = (data ?? newJob) as Job;

    set((s) => ({
      jobs: [job, ...s.jobs.filter((j) => j.id !== job.id)],
    }));

    return job;
  },

  // Insert a new candidate into Supabase and update local cache
  addCandidate: async (candidate) => {
    const id = crypto.randomUUID();
    const newCandidate: Candidate = {
      ...candidate,
      id,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("candidates")
      .insert(newCandidate)
      .select("*")
      .single();

    if (error) {
      console.error("Failed to insert candidate into Supabase:", error);
      throw error;
    }

    const created = (data ?? newCandidate) as Candidate;

    set((s) => {
      const updatedJobs = s.jobs.map((j) => {
        if (j.id === created.job_id) {
          const jobCandidates = [
            ...s.candidates.filter((c) => c.job_id === j.id),
            created,
          ];
          return {
            ...j,
            candidates_count: jobCandidates.length,
            top_score: Math.max(...jobCandidates.map((c) => c.match_score)),
          };
        }
        return j;
      });
      return { candidates: [...s.candidates, created], jobs: updatedJobs };
    });

    return created;
  },

  // Update candidate status in Supabase and local cache
  updateCandidateStatus: async (id, status) => {
    const { data, error } = await supabase
      .from("candidates")
      .update({ status })
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("Failed to update candidate status in Supabase:", error);
      throw error;
    }

    const updated = (data as Candidate) ?? null;

    if (updated) {
      set((s) => ({
        candidates: s.candidates.map((c) =>
          c.id === id ? { ...c, status: updated.status } : c
        ),
      }));
    }

    return updated;
  },

  // Fetch candidates for a job from Supabase
  getJobCandidates: async (jobId) => {
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("job_id", jobId)
      .order("match_score", { ascending: false });

    if (error) {
      console.error("Failed to fetch candidates from Supabase:", error);
      throw error;
    }

    const list = (data as Candidate[]) ?? [];

    set((s) => ({
      candidates: [
        ...s.candidates.filter((c) => c.job_id !== jobId),
        ...list,
      ],
    }));

    return list;
  },

  // Fetch a single job by id from Supabase
  getJob: async (id) => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch job from Supabase:", error);
      throw error;
    }

    const job = (data as Job) ?? null;

    if (job) {
      set((s) => ({
        jobs: [job, ...s.jobs.filter((j) => j.id !== job.id)],
      }));
    }

    return job;
  },

  // Local selector for a candidate; callers can ensure candidates are loaded via getJobCandidates
  getCandidate: (id) => get().candidates.find((c) => c.id === id),

  // Delete a job and all its candidates from Supabase, then remove from local state
  deleteJob: async (id) => {
    // Delete candidates first to avoid FK constraint issues
    const { error: candidatesError } = await supabase
      .from("candidates")
      .delete()
      .eq("job_id", id);

    if (candidatesError) {
      console.error("Failed to delete candidates for job from Supabase:", candidatesError);
      throw candidatesError;
    }

    const { error: jobError } = await supabase
      .from("jobs")
      .delete()
      .eq("id", id);

    if (jobError) {
      console.error("Failed to delete job from Supabase:", jobError);
      throw jobError;
    }

    set((s) => ({
      jobs: s.jobs.filter((j) => j.id !== id),
      candidates: s.candidates.filter((c) => c.job_id !== id),
    }));
  },

  // Delete a single candidate from Supabase and remove from local state
  deleteCandidate: async (id) => {
    const { error } = await supabase
      .from("candidates")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete candidate from Supabase:", error);
      throw error;
    }

    set((s) => ({
      candidates: s.candidates.filter((c) => c.id !== id),
    }));
  },
}));


