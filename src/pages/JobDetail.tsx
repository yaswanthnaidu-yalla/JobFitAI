import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Link2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJobStore } from "@/lib/job-store";
import type { Job, Candidate } from "@/lib/mock-data";
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
  const { getJob, getJobCandidates, addCandidate, deleteJob } = useJobStore();

  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingJob, setLoadingJob] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  const addAndRefresh = async (
    candidate: Omit<Candidate, "id" | "created_at">
  ) => {
    const created = await addCandidate(candidate);
    setCandidates((prev) =>
      [...prev, created].sort((a, b) => b.match_score - a.match_score)
    );
  };

  const [jdExpanded, setJdExpanded] = useState(false);

  const handleDeleteJob = async () => {
    if (!window.confirm("Delete this job and all its candidates?")) return;
    try {
      await deleteJob(id!);
      navigate("/jobs");
    } catch {
      toast.error("Failed to delete job. Please try again.");
    }
  };

  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinMethod, setLinkedinMethod] = useState<"url" | "text">("url");
  const [profileText, setProfileText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        const [jobData, candidateList] = await Promise.all([
          getJob(id),
          getJobCandidates(id),
        ]);
        if (!cancelled) {
          setJob(jobData ?? null);
          setCandidates(candidateList);
        }
      } catch (err) {
        console.error("Failed to load job detail:", err);
      } finally {
        if (!cancelled) {
          setLoadingJob(false);
          setLoadingCandidates(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, getJob, getJobCandidates]);

  const handleExportShortlist = () => {
    if (!candidates.length) return;

    const header = [
      "Rank",
      "Name",
      "Headline",
      "Score",
      "Status",
      "Skills Matched",
      "Skills Missing",
    ];

    const escape = (value: string | number | null | undefined) => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = candidates.map((c, idx) => [
      idx + 1,
      c.name,
      c.headline,
      c.match_score,
      c.status,
      (c.skills_matched || []).join("; "),
      (c.skills_missing || []).join("; "),
    ]);

    const csvLines = [
      header.map(escape).join(","),
      ...rows.map((row) => row.map(escape).join(",")),
    ];

    const csv = csvLines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${job?.title ?? "shortlist"}-shortlist.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ── Shared screening function (Groq llama-3.1-8b-instant) ────────────────
  const screenCandidate = async (resumeText: string, jobDescription: string) => {
    const userMessage = `Job Description:
${jobDescription}

Candidate Resume / Profile:
${resumeText}

Return a JSON object with these fields:
- name: string (candidate name extracted from the resume, or "Candidate" if not found)
- match_score: number 0-100 (based on fit with the job description)
- summary: array of exactly 3 strings (each explaining an aspect of the match)
- skills_matched: array of strings
- skills_missing: array of strings`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are a resume screening AI. Always respond with valid JSON only, no markdown, no explanation.",
          },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`Groq API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const raw: string = data.choices[0].message.content;

    // Strip markdown code fences in case the model adds them despite instructions
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    return JSON.parse(cleaned) as {
      name: string;
      match_score: number;
      summary: string[];
      skills_matched: string[];
      skills_missing: string[];
    };
  };
  // ── LinkedIn Profile Import ────────────────────────────────────────────────
  const handleImportCandidate = useCallback(async () => {
    setImporting(true);

    try {
      if (!job) {
        toast.error("Job details not loaded yet. Please wait a moment and try again.");
        return;
      }

      if (linkedinMethod === "text") {
        if (!profileText.trim()) {
          toast.error("Please paste candidate profile text");
          return;
        }

        setImportMessage("Running AI screening for pasted profile...");
        const resumeText = profileText;
        const result = await screenCandidate(resumeText, job.description);

        await addAndRefresh({
          job_id: id!,
          name: result.name,
          headline: "",
          resume_url: null,
          source: "linkedin",
          match_score: result.match_score,
          ai_summary: result.summary,
          skills_matched: result.skills_matched,
          skills_missing: result.skills_missing,
          status: "pending",
        });

        setProfileText("");
        toast.success(`${result.name} screened — Score: ${result.match_score}`);
      } else {
        if (!linkedinUrl.trim()) {
          toast.error("Please paste a LinkedIn profile URL");
          return;
        }

        // Step 1 — mock LinkedIn fetch (1.5s delay, returns name + headline + skills)
        setImportMessage("Importing profile from LinkedIn...");
        const profile = await mockProfileImport(linkedinUrl);

        // Step 2 — build resume text from profile and call /api/screen
        setImportMessage(`Running AI screening for ${profile.name}...`);
        const resumeText = `Name: ${profile.name}\nCurrent Role: ${profile.headline}\nSkills: ${profile.skills}`;
        const result = await screenCandidate(resumeText, job.description);

        // Step 3 — save to store
        await addAndRefresh({
          job_id: id!,
          name: profile.name,
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
      }
    } catch (err) {
      toast.error("Screening failed. Try again.");
    } finally {
      setImporting(false);
      setImportMessage("");
    }
  }, [linkedinUrl, linkedinMethod, profileText, id, job, addCandidate, toast]);

  // ── PDF Upload ─────────────────────────────────────────────────────────────
  const handleFileUpload = useCallback(async (e?: React.ChangeEvent<HTMLInputElement>) => {
    // Support both click-to-upload (file input) and the div onClick fallback
    const file = e?.target?.files?.[0];

    setImporting(true);
    setImportMessage("Parsing resume...");

    try {
      if (!job) {
        toast.error("Job details not loaded yet. Please wait a moment and try again.");
        return;
      }
      let resumeText = "";

      if (file) {
        // Real PDF extraction via pdfjs-dist
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
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

      // Try to extract a likely name from the first chunk of PDF text,
      // since formatting is stripped and "Name:" prefixes may be missing.
      const snippet = resumeText.slice(0, 500);
      const nameMatch = snippet.match(/\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/);
      const extractedName = nameMatch ? `${nameMatch[1]} ${nameMatch[2]}` : null;

      setImportMessage("Running AI screening...");
      const result = await screenCandidate(resumeText, job.description);

      const finalName = extractedName || result.name;

      await addAndRefresh({
        job_id: id!,
        name: finalName,
        headline: "",
        resume_url: file ? file.name : null,
        source: "upload",
        match_score: result.match_score,
        ai_summary: result.summary,
        skills_matched: result.skills_matched,
        skills_missing: result.skills_missing,
        status: "pending",
      });

      toast.success(`${finalName} screened — Score: ${result.match_score}`);
    } catch (err) {
      toast.error("Resume screening failed. Try again.");
    } finally {
      setImporting(false);
      setImportMessage("");
    }
  }, [id, job, addCandidate, toast]);

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
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteJob}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Delete job"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
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
        <Tabs
          defaultValue="url"
          onValueChange={(v) => { if (v === "url" || v === "text") setLinkedinMethod(v); }}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="url">Import by URL</TabsTrigger>
            <TabsTrigger value="text">Paste Profile Text</TabsTrigger>
            <TabsTrigger value="upload">Upload Resume</TabsTrigger>
          </TabsList>

          <TabsContent value="url">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Paste profile URL from LinkedIn, Naukri, Indeed, or anywhere"
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
              <p className="text-xs text-muted-foreground">
                Tip: If URL import fails, paste the profile text directly.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="text">
            <div className="space-y-2">
              <textarea
                placeholder="Paste candidate's profile text (from LinkedIn, Naukri, Indeed, or any platform)"
                className="w-full min-h-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={profileText}
                onChange={(e) => setProfileText(e.target.value)}
                disabled={importing}
              />
              <div className="flex justify-end">
                <Button onClick={handleImportCandidate} disabled={importing}>
                  Screen Candidate
                </Button>
              </div>
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
        <div className="flex items-center justify-between mb-4 gap-2">
          <h2 className="font-semibold text-foreground">
            Ranked Candidates ({candidates.length})
          </h2>
          {candidates.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportShortlist}
            >
              Export Shortlist
            </Button>
          )}
        </div>

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
