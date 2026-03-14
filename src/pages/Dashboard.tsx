import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Plus, Briefcase, Users, TrendingUp, Pencil, Check } from "lucide-react";
import { useJobStore } from "@/lib/job-store";
import { useAuthStore } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";
import type { Job, Candidate } from "@/lib/mock-data";
import ScoreBadge from "@/components/ScoreBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const Dashboard = () => {
  const getJobs = useJobStore((s) => s.getJobs);
  const getJobCandidates = useJobStore((s) => s.getJobCandidates);
  const user = useAuthStore((s) => s.user);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  // Profile state
  const [profileName, setProfileName] = useState("HR Recruiter");
  const [profileTitle, setProfileTitle] = useState("");
  const [profileCompany, setProfileCompany] = useState("TechCorp Inc.");
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) {
        console.error("Failed to fetch profile:", error);
        return;
      }
      if (data) {
        setProfileName(data.full_name || "HR Recruiter");
        setProfileTitle(data.title || "");
        setProfileCompany(data.company || "TechCorp Inc.");
      }
    })();
  }, [user]);

  const handleEditProfile = () => {
    setEditName(profileName);
    setEditTitle(profileTitle);
    setEditCompany(profileCompany);
    setEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: editName,
        title: editTitle,
        company: editCompany,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setProfileName(editName);
      setProfileTitle(editTitle);
      setProfileCompany(editCompany);
      setEditingProfile(false);
      toast.success("Profile updated!");
    } catch (err) {
      console.error("Failed to save profile:", err);
      toast.error("Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const fetchedJobs = await getJobs();
        if (cancelled) return;
        setJobs(fetchedJobs);

        // Fetch candidates for every job in parallel
        const allCandidates = (
          await Promise.all(fetchedJobs.map((j) => getJobCandidates(j.id)))
        ).flat();

        if (!cancelled) {
          setCandidates(allCandidates);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getJobs, getJobCandidates]);

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
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-3">
                <span className="text-primary-foreground font-bold text-lg">
                  {profileName
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "HR"}
                </span>
              </div>
              {editingProfile ? (
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="text-primary hover:text-primary/80 transition-colors p-1"
                  aria-label="Save profile"
                >
                  <Check className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleEditProfile}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label="Edit profile"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
            {editingProfile ? (
              <div className="space-y-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Full name"
                  className="h-8 text-sm"
                />
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Job title"
                  className="h-8 text-sm"
                />
                <Input
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  placeholder="Company"
                  className="h-8 text-sm"
                />
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-foreground">{profileName}</h3>
                {profileTitle && (
                  <p className="text-sm text-muted-foreground">{profileTitle}</p>
                )}
                <p className="text-sm text-muted-foreground">{profileCompany}</p>
              </>
            )}
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
              to="/candidates"
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

        {/* Right Sidebar — Quick Stats */}
        <aside className="space-y-4">
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
