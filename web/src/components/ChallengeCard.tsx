"use client";

import { Challenge, ChallengeStatus } from "@/lib/types";

const statusConfig: Record<ChallengeStatus, { label: string; className: string }> = {
  submitted: { label: "Submitted", className: "bg-green-100 text-green-700" },
  ongoing: { label: "Ongoing", className: "bg-amber-100 text-amber-700" },
  unattempted: { label: "Unattempted", className: "bg-surface-overlay text-muted" },
  expired: { label: "Expired", className: "bg-red-100 text-red-600" },
};

function formatPostedDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getTimeRemaining(deadline: string): string {
  const now = Date.now();
  const end = new Date(deadline).getTime();
  const diff = end - now;

  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}

interface ChallengeCardProps {
  challenge: Challenge;
  isSelected: boolean;
  onSelect: (challenge: Challenge) => void;
  compact?: boolean;
}

export default function ChallengeCard({
  challenge,
  isSelected,
  onSelect,
  compact = false,
}: ChallengeCardProps) {
  return (
    <button
      onClick={() => onSelect(challenge)}
      className={`
        group relative w-full flex-shrink-0 rounded-xl overflow-hidden flex
        transition-all duration-200 text-left
        ${
          isSelected
            ? "bg-surface-overlay ring-1 ring-surface-hover shadow-sm"
            : "bg-surface hover:bg-surface-overlay"
        }
      `}
    >
      {/* Accent left bar */}
      <div
        className={`w-1 flex-shrink-0 rounded-l-xl transition-colors duration-200 ${
          isSelected ? "bg-muted" : "bg-transparent group-hover:bg-surface-hover"
        }`}
      />

      <div className={`flex-1 flex items-center gap-4 ${compact ? "px-4 py-3" : "px-5 py-4"}`}>
        {/* Left: company + title */}
        <div className="flex-1 min-w-0">
          <span className={`font-medium tracking-wide uppercase text-accent ${compact ? "text-[10px]" : "text-xs"}`}>
            {challenge.company}
          </span>
          <h3 className={`font-semibold text-heading leading-snug truncate ${compact ? "text-sm" : "text-base"}`}>
            {challenge.title}
          </h3>
        </div>

        {/* Right: meta */}
        <div className="flex-shrink-0 flex items-center gap-3 text-xs text-muted whitespace-nowrap">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig[challenge.status].className}`}
          >
            {statusConfig[challenge.status].label}
          </span>
          <span className="hidden sm:inline">
            {formatPostedDate(challenge.postedAt)}
          </span>
          <span
            className={`font-medium ${
              getTimeRemaining(challenge.deadline) === "Ended"
                ? "text-red-500"
                : "text-accent"
            }`}
          >
            {getTimeRemaining(challenge.deadline)}
          </span>
        </div>
      </div>
    </button>
  );
}
