import { getScoreColor } from "@/lib/mock-data";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "lg";
}

const ScoreBadge = ({ score, size = "sm" }: ScoreBadgeProps) => {
  const color = getScoreColor(score);
  const colorClass =
    color === "green"
      ? "score-badge-green"
      : color === "yellow"
      ? "score-badge-yellow"
      : "score-badge-red";

  if (size === "lg") {
    return (
      <div className={`${colorClass} w-20 h-20 rounded-full flex items-center justify-center`}>
        <span className="text-2xl font-bold">{score}</span>
      </div>
    );
  }

  return (
    <span className={`${colorClass} px-2.5 py-0.5 rounded-full text-sm font-semibold`}>
      {score}
    </span>
  );
};

export default ScoreBadge;
