import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useJobStore } from "@/lib/job-store";
import { useSearchStore } from "@/lib/search-store";
import type { Job, Candidate } from "@/lib/mock-data";
import CandidateAvatar from "@/components/Avatar";
import ScoreBadge from "@/components/ScoreBadge";
import SkillChip from "@/components/SkillChip";
import { Skeleton } from "@/components/ui/skeleton";

interface GroupedByJob {
  job: Job;
  candidates: Candidate[];
}

const Candidates = () => {
  const { getJobs, getJobCandidates } = useJobStore();
  const query = useSearchStore((s) => s.query);
  const [groups, setGroups] = useState<GroupedByJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const jobs = await getJobs();

        if (cancelled) return;

        // Fetch candidates for every job in parallel
        const candidateLists = await Promise.all(
          jobs.map((job) => getJobCandidates(job.id))
        );

        if (cancelled) return;

        const grouped: GroupedByJob[] = jobs.map((job, i) => ({
          job,
          candidates: candidateLists[i], // already sorted by match_score desc from the store
        }));

        setGroups(grouped);
      } catch (err) {
        console.error("Failed to load candidates page:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getJobs, getJobCandidates]);

  const filteredGroups = useMemo(() => {
    if (!query.trim()) return groups;
    const q = query.toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        candidates: g.candidates.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.skills_matched.some((s) => s.toLowerCase().includes(q))
        ),
      }))
      .filter((g) => g.candidates.length > 0);
  }, [groups, query]);

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-[780px] mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-7 w-44" />
        {[1, 2].map((i) => (
          <div key={i} className="linkedin-card p-5 space-y-3">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-3 w-24" />
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center gap-4 p-3">
                <Skeleton className="w-5 h-4" />
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-60" />
                </div>
                <Skeleton className="h-6 w-10 rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  const hasAnyCandidates = filteredGroups.some((g) => g.candidates.length > 0);

  return (
    <div className="max-w-[780px] mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold text-foreground">All Candidates</h1>

      {!hasAnyCandidates ? (
        <div className="linkedin-card p-8 text-center text-sm text-muted-foreground">
          {query.trim()
            ? "No candidates match your search. Try a different term."
            : "No candidates yet. Import profiles or upload resumes from any job page."}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGroups
            .filter((g) => g.candidates.length > 0)
            .map((group) => (
              <div key={group.job.id} className="linkedin-card p-5 space-y-3">
                {/* Group header */}
                <div className="flex items-center justify-between">
                  <div>
                    <Link
                      to={`/jobs/${group.job.id}`}
                      className="font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {group.job.title}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {group.candidates.length} candidate
                      {group.candidates.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                {/* Ranked candidate rows — same layout as JobDetail */}
                <div className="space-y-2">
                  {group.candidates.map((c, idx) => (
                    <Link
                      key={c.id}
                      to={`/jobs/${c.job_id}/candidates/${c.id}`}
                    >
                      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors">
                        <span className="text-sm font-medium text-muted-foreground w-5">
                          #{idx + 1}
                        </span>
                        <CandidateAvatar name={c.name} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm">
                            {c.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {c.headline}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {c.skills_matched.slice(0, 4).map((s) => (
                              <SkillChip key={s} skill={s} />
                            ))}
                          </div>
                        </div>
                        <ScoreBadge score={c.match_score} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Candidates;
