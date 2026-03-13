interface SkillChipProps {
  skill: string;
  variant?: "default" | "matched" | "missing";
}

const SkillChip = ({ skill, variant = "default" }: SkillChipProps) => {
  const classes =
    variant === "matched"
      ? "bg-score-green/10 text-score-green border-score-green/30"
      : variant === "missing"
      ? "bg-score-red/10 text-score-red border-score-red/30"
      : "bg-secondary text-secondary-foreground border-border";

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${classes}`}>
      {variant === "matched" && "✓ "}
      {variant === "missing" && "✗ "}
      {skill}
    </span>
  );
};

export default SkillChip;
