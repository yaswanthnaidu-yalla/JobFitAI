import { Link } from "react-router-dom";
import { Plus, Briefcase, Users, TrendingUp } from "lucide-react";
import { useJobStore } from "@/lib/job-store";
import ScoreBadge from "@/components/ScoreBadge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

const Dashboard = () => {
  const { jobs, candidates } = useJobStore();

  const totalResumes = candidates.length;
  const avgScore =
    candidates.length > 0
      ? Math.round(candidates.reduce((sum, c) => sum + c.match_score, 0) / candidates.length)
      : 0;

  return (
    <div className="max-w-[1128px] mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_300px] gap-6">
        {/* Left Sidebar */}
        <aside className="hidden lg:block space-y-4">
          <div className="linkedin-card p-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-3">
              <span className="text-primary-foreground font-bold text-lg">HR</span>
            </div>
            <h3 className="font-semibold text-foreground">HR Recruiter</h3>
            <p className="text-sm text-muted-foreground">TechCorp Inc.</p>
          </div>
          <nav className="linkedin-card p-2">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-primary/10 text-primary font-medium text-sm"
            >
              <Briefcase className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-muted-foreground hover:bg-secondary text-sm"
            >
              <Users className="w-4 h-4" />
              Candidates
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground">Your Jobs</h1>
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
              <p className="text-muted-foreground mb-4">Post your first job to start screening candidates with AI</p>
              <Link to="/jobs/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Post a Job
                </Button>
              </Link>
            </div>
          ) : (
            jobs.map((job) => (
              <Link key={job.id} to={`/jobs/${job.id}`}>
                <div className="linkedin-card p-5 card-hover cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {job.candidates_count} candidates • Posted{" "}
                        {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {job.top_score !== null && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Top Score</p>
                        <ScoreBadge score={job.top_score} />
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="hidden lg:block space-y-4">
          <div className="linkedin-card p-4">
            <h3 className="font-semibold text-foreground mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{jobs.length}</p>
                  <p className="text-xs text-muted-foreground">Active Jobs</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-score-green/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-score-green" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalResumes}</p>
                  <p className="text-xs text-muted-foreground">Resumes Screened</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-score-yellow/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-score-yellow" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{avgScore || "—"}</p>
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
