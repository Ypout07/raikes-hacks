"use client";

import { Challenge } from "@/lib/types";

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
        group relative w-full rounded-md overflow-hidden flex
        bg-surface-raised border transition-all duration-200 text-left
        ${
          isSelected
            ? "border-accent shadow-[0_0_20px_rgba(0,212,170,0.15)]"
            : "border-surface-hover hover:border-muted"
        }
      `}
    >
      {/* Accent left bar */}
      <div
        className={`w-1 flex-shrink-0 transition-colors duration-200 ${
          isSelected ? "bg-accent" : "bg-surface-hover group-hover:bg-muted"
        }`}
      />

      <div className={`flex-1 flex items-center gap-4 ${compact ? "px-4 py-3" : "px-5 py-4"}`}>
        {/* Left: company + title */}
        <div className="flex-1 min-w-0">
          <span className={`font-medium tracking-wide uppercase text-accent ${compact ? "text-[10px]" : "text-xs"}`}>
            {challenge.company}
          </span>
          <h3 className={`font-semibold text-white leading-snug ${compact ? "text-sm" : "text-base"}`}>
            {challenge.title}
          </h3>
        </div>

        {/* Right: meta */}
        <div className="flex-shrink-0 flex items-center gap-4 text-xs text-muted">
          <span className="hidden sm:inline">
            {formatPostedDate(challenge.postedAt)}
          </span>
          <span
            className={`font-medium ${
              getTimeRemaining(challenge.deadline) === "Ended"
                ? "text-red-400"
                : "text-accent-dim"
            }`}
          >
            {getTimeRemaining(challenge.deadline)}
          </span>
        </div>
      </div>
    </button>
  );
}
