import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Job } from "@/lib/mock-data";
import ScoreBadge from "@/components/ScoreBadge";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useJobStore } from "@/lib/job-store";

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const { getJobs } = useJobStore();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getJobs();
        if (!cancelled) {
          setJobs(data);
        }
      } catch (err) {
        console.error("Failed to load jobs:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getJobs]);

  return (
    <div className="max-w-[1128px] mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">All Jobs</h1>
        <Link to="/jobs/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Post a Job
          </Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="linkedin-card p-12 text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No jobs yet</h2>
          <p className="text-muted-foreground mb-4">
            Post your first job to start screening candidates with AI.
          </p>
          <Link to="/jobs/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Post a Job
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`}>
              <div className="linkedin-card p-5 card-hover cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {job.candidates_count} candidates • Posted{" "}
                      {formatDistanceToNow(new Date(job.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {job.top_score !== null && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">
                        Top Score
                      </p>
                      <ScoreBadge score={job.top_score} />
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Jobs;

