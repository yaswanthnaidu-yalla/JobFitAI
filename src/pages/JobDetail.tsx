import { useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Link2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJobStore } from "@/lib/job-store";
import { MOCK_CANDIDATES } from "@/lib/mock-data";
import { mockProfileImport } from "@/lib/mockLinkedIn";
import CandidateAvatar from "@/components/Avatar";
import ScoreBadge from "@/components/ScoreBadge";
import SkillChip from "@/components/SkillChip";
import LinkedInSpinner from "@/components/LinkedInSpinner";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";


const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJob, getJobCandidates, addCandidate } = useJobStore();
  const job = getJob(id!);
  const candidates = getJobCandidates(id!);

  const [jdExpanded, setJdExpanded] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");

  // ── Shared screening function ──────────────────────────────────────────────
 const screenCandidate = async (resumeText: string) => {
  const mockResults = [
    {
      name: "Sarah Chen",
      match_score: 91,
      summary: [
        "Strong Python & API background matches all core requirements",
        "AWS and Docker experience covers all preferred qualifications",
        "No critical gaps — recommend for immediate interview"
      ],
      skills_matched: ["Python", "REST APIs", "PostgreSQL", "AWS", "Docker"],
      skills_missing: ["Kubernetes"]
    },
    {
      name: "James Patel",
      match_score: 74,
      summary: [
        "Solid Python and SQL skills meet core requirements",
        "REST API experience is relevant but limited in scale",
        "Missing cloud infrastructure experience — would need onboarding"
      ],
      skills_matched: ["Python", "SQL", "REST APIs", "Node.js"],
      skills_missing: ["AWS", "Docker", "Kubernetes"]
    },
    {
      name: "Alex Wong",
      match_score: 42,
      summary: [
        "Frontend-focused profile does not match backend requirements",
        "Basic Python knowledge insufficient for senior role",
        "Significant skill gaps across most required technologies"
      ],
      skills_matched: ["JavaScript", "Python"],
      skills_missing: ["REST APIs", "PostgreSQL", "AWS", "Docker"]
    }
  ]

  // Simulate AI delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Cycle through results
  const index = Math.floor(Math.random() * mockResults.length)
  return mockResults[index]
}
  // ── LinkedIn Profile Import ────────────────────────────────────────────────
  const handleImportCandidate = useCallback(async () => {
    if (!linkedinUrl.trim()) {
      toast.error("Please paste a LinkedIn profile URL");
      return;
    }

    setImporting(true);

    try {
      // Step 1 — mock LinkedIn fetch (1.5s delay, returns name + headline + skills)
      setImportMessage("Importing profile from LinkedIn...");
      const profile = await mockProfileImport(linkedinUrl);

      // Step 2 — build resume text from profile and call /api/screen
      setImportMessage(`Running AI screening for ${profile.name}...`);
      const resumeText = `Name: ${profile.name}\nCurrent Role: ${profile.headline}\nSkills: ${profile.skills}`;
      const result = await screenCandidate(resumeText, "linkedin");

      // Step 3 — save to store
      addCandidate({
        id: crypto.randomUUID(),
        job_id: id!,
        name: result.name || profile.name,
        headline: profile.headline,
        resume_url: null,
        source: "linkedin",
        match_score: result.match_score,
        ai_summary: result.summary,
        skills_matched: result.skills_matched,
        skills_missing: result.skills_missing,
        status: "pending",
      });

      setLinkedinUrl("");
      toast.success(`${result.name || profile.name} screened — Score: ${result.match_score}`);
    } catch (err) {
      toast.error("Screening failed. Try again.");
    } finally {
      setImporting(false);
      setImportMessage("");
    }
  }, [linkedinUrl, id, job, addCandidate]);

  // ── PDF Upload ─────────────────────────────────────────────────────────────
  const handleFileUpload = useCallback(async (e?: React.ChangeEvent<HTMLInputElement>) => {
    // Support both click-to-upload (file input) and the div onClick fallback
    const file = e?.target?.files?.[0];

    setImporting(true);
    setImportMessage("Parsing resume...");

    try {
      let resumeText = "";

      if (file) {
        // Real PDF extraction via pdfjs-dist
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pages = await Promise.all(
          Array.from({ length: pdf.numPages }, (_, i) =>
            pdf.getPage(i + 1).then((p) => p.getTextContent())
          )
        );
        resumeText = pages
          .flatMap((p) => p.items.map((item: any) => item.str))
          .join(" ");
      } else {
        // Fallback — no file selected, use first mock candidate text
        const mock = MOCK_CANDIDATES[0];
        resumeText = `Name: ${mock.name}\nRole: ${mock.headline}\nSkills: ${mock.skills_matched.join(", ")}`;
      }

      setImportMessage("Running AI screening...");
      const result = await screenCandidate(resumeText, "upload");

      addCandidate({
        id: crypto.randomUUID(),
        job_id: id!,
        name: result.name,
        headline: "",
        resume_url: file ? file.name : null,
        source: "upload",
        match_score: result.match_score,
        ai_summary: result.summary,
        skills_matched: result.skills_matched,
        skills_missing: result.skills_missing,
        status: "pending",
      });

      toast.success(`${result.name} screened — Score: ${result.match_score}`);
    } catch (err) {
      toast.error("Resume screening failed. Try again.");
    } finally {
      setImporting(false);
      setImportMessage("");
    }
  }, [id, job, addCandidate]);

  if (!job) {
    return (
      <div className="max-w-[680px] mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Job not found</p>
        <Link to="/">
          <Button variant="outline" className="mt-4">Go Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[780px] mx-auto px-4 py-6 space-y-4">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </button>

      {/* Job Header */}
      <div className="linkedin-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">{job.title}</h1>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-score-green/10 text-score-green">
              Active
            </span>
          </div>
        </div>
        <div className="mt-3">
          <p className={`text-sm text-muted-foreground ${!jdExpanded ? "line-clamp-2" : ""}`}>
            {job.description}
          </p>
          <button
            onClick={() => setJdExpanded(!jdExpanded)}
            className="flex items-center gap-1 text-xs text-primary mt-1 hover:underline"
          >
            {jdExpanded ? (
              <>Show less <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>Show more <ChevronDown className="w-3 h-3" /></>
            )}
          </button>
        </div>
      </div>

      {/* Add Candidates */}
      <div className="linkedin-card p-5">
        <h2 className="font-semibold text-foreground mb-4">Add Candidates</h2>
        <Tabs defaultValue="linkedin">
          <TabsList className="mb-4">
            <TabsTrigger value="linkedin">Import from LinkedIn</TabsTrigger>
            <TabsTrigger value="upload">Upload Resume</TabsTrigger>
          </TabsList>

          <TabsContent value="linkedin">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Paste LinkedIn Profile URL"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="pl-9"
                  disabled={importing}
                />
              </div>
              <Button onClick={handleImportCandidate} disabled={importing}>
                Import Candidate
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <label className="block">
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileUpload}
                disabled={importing}
              />
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload a PDF resume
                </p>
              </div>
            </label>
          </TabsContent>
        </Tabs>

        {importing && <LinkedInSpinner message={importMessage} />}
      </div>

      {/* Ranked Candidates */}
      <div className="linkedin-card p-5">
        <h2 className="font-semibold text-foreground mb-4">
          Ranked Candidates ({candidates.length})
        </h2>

        {importing && candidates.length === 0 && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-60" />
                </div>
                <Skeleton className="h-6 w-10 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {candidates.length === 0 && !importing && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No candidates yet. Import from LinkedIn or upload a resume to get started.
          </p>
        )}

        <div className="space-y-2">
          {candidates.map((c, idx) => (
            <Link key={c.id} to={`/jobs/${id}/candidates/${c.id}`}>
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors">
                <span className="text-sm font-medium text-muted-foreground w-5">
                  #{idx + 1}
                </span>
                <CandidateAvatar name={c.name} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.headline}</p>
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
    </div>
  );
};

export default JobDetail;
console.log("KEY:", import.meta.env.VITE_GEMINI_API_KEY?.slice(0, 15))