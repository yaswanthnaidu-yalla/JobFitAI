import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJobStore } from "@/lib/job-store";
import CandidateAvatar from "@/components/Avatar";
import ScoreBadge from "@/components/ScoreBadge";
import SkillChip from "@/components/SkillChip";
import { toast } from "sonner";

const CandidateDetail = () => {
  const { id, cid } = useParams<{ id: string; cid: string }>();
  const navigate = useNavigate();
  const { getCandidate, getJob, updateCandidateStatus } = useJobStore();
  const candidate = getCandidate(cid!);
  const job = getJob(id!);

  if (!candidate || !job) {
    return (
      <div className="max-w-[680px] mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Candidate not found</p>
      </div>
    );
  }

  const handleStatus = (status: "shortlisted" | "rejected") => {
    updateCandidateStatus(cid!, status);
    toast.success(
      status === "shortlisted"
        ? `${candidate.name} shortlisted!`
        : `${candidate.name} rejected`
    );
  };

  return (
    <div className="max-w-[680px] mx-auto px-4 py-6 space-y-0">
      <button
        onClick={() => navigate(`/jobs/${id}`)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to {job.title}
      </button>

      {/* Banner + Profile */}
      <div className="linkedin-card overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-[hsl(var(--banner-gradient-from))] to-[hsl(var(--banner-gradient-to))]" />
        <div className="px-6 pb-5 -mt-12">
          <CandidateAvatar name={candidate.name} size="xl" />
          <h1 className="text-xl font-semibold text-foreground mt-3">{candidate.name}</h1>
          <p className="text-sm text-muted-foreground">{candidate.headline}</p>
        </div>
      </div>

      {/* Score */}
      <div className="linkedin-card p-6 mt-4 flex items-center gap-6">
        <ScoreBadge score={candidate.match_score} size="lg" />
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">AI Screening Result</p>
          <p className="text-lg font-semibold text-foreground">
            Match Score: {candidate.match_score}/100
          </p>
        </div>
      </div>

      {/* AI Summary */}
      <div className="linkedin-card p-6 mt-4">
        <h2 className="font-semibold text-foreground mb-3">About</h2>
        <ul className="space-y-2">
          {candidate.ai_summary.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-primary mt-0.5">•</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Skills */}
      <div className="linkedin-card p-6 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Skills Matched</h3>
            <div className="flex flex-wrap gap-2">
              {candidate.skills_matched.map((s) => (
                <SkillChip key={s} skill={s} variant="matched" />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Skills Missing</h3>
            <div className="flex flex-wrap gap-2">
              {candidate.skills_missing.map((s) => (
                <SkillChip key={s} skill={s} variant="missing" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="linkedin-card p-4 mt-4 flex flex-wrap gap-3">
        <Button
          onClick={() => handleStatus("shortlisted")}
          disabled={candidate.status === "shortlisted"}
          className="gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          {candidate.status === "shortlisted" ? "Shortlisted ✅" : "Shortlist"}
        </Button>
        <Button
          variant="destructive"
          onClick={() => handleStatus("rejected")}
          disabled={candidate.status === "rejected"}
          className="gap-2"
        >
          <XCircle className="w-4 h-4" />
          {candidate.status === "rejected" ? "Rejected" : "Reject"}
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Download Resume
        </Button>
      </div>
    </div>
  );
};

export default CandidateDetail;
