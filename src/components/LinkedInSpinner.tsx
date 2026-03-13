import { Loader2 } from "lucide-react";

interface LinkedInSpinnerProps {
  message: string;
}

const LinkedInSpinner = ({ message }: LinkedInSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};

export default LinkedInSpinner;
