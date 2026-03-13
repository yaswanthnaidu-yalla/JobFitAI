import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useJobStore } from "@/lib/job-store";
import { MOCK_JOB_IMPORT } from "@/lib/mock-data";
import LinkedInSpinner from "@/components/LinkedInSpinner";
import { toast } from "sonner";

const NewJob = () => {
  const navigate = useNavigate();
  const addJob = useJobStore((s) => s.addJob);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [importing, setImporting] = useState(false);

  const handleImport = () => {
    if (!linkedinUrl.trim()) {
      toast.error("Please paste a LinkedIn job URL");
      return;
    }
    setImporting(true);
    setTimeout(() => {
      setTitle(MOCK_JOB_IMPORT.title);
      setDescription(MOCK_JOB_IMPORT.description);
      setImporting(false);
      toast.success("Job details imported from LinkedIn!");
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      const job = await addJob(title, description);
      toast.success("Job created! Start adding candidates.");
      navigate(`/jobs/${job.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create job. Please try again.");
    }
  };

  return (
    <div className="max-w-[680px] mx-auto px-4 py-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="linkedin-card p-6">
        <h1 className="text-xl font-semibold text-foreground mb-6">Create a New Job</h1>

        {/* LinkedIn Import */}
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Job Posting URL
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Paste job URL from LinkedIn, Naukri, Indeed, or anywhere"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={handleImport} disabled={importing}>
              Import Job
            </Button>
          </div>
        </div>

        {importing && <LinkedInSpinner message="Fetching job details from LinkedIn..." />}

        {!importing && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or fill in manually</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Job Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Job Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Paste the full job description..."
                  rows={8}
                />
              </div>
              <Button type="submit" className="w-full">
                Create Job & Start Screening
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default NewJob;
