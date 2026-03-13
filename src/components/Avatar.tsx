import { getInitials, getAvatarColor } from "@/lib/mock-data";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
  xl: "w-24 h-24 text-3xl",
};

const CandidateAvatar = ({ name, size = "md" }: AvatarProps) => {
  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-primary-foreground shrink-0`}
      style={{ backgroundColor: getAvatarColor(name) }}
    >
      {getInitials(name)}
    </div>
  );
};

export default CandidateAvatar;
