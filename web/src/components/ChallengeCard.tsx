"use client";

import { Challenge, ChallengeStatus } from "@/lib/types";

const statusConfig: Partial<Record<ChallengeStatus, { label: string; className: string }>> = {
  submitted: { label: "Submitted", className: "bg-green-100 text-green-700" },
};

function formatPostedDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDuration(startDate: string, deadline: string): string {
  const diff = new Date(deadline).getTime() - new Date(startDate).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days >= 1) return `${days}d`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  return `${hours}h`;
}

function getTimeLabel(startDate: string, deadline: string): { text: string; subtext?: string; upcoming: boolean; ended: boolean } {
  const now = Date.now();
  const start = new Date(startDate).getTime();
  const end = new Date(deadline).getTime();

  if (now < start) {
    const diff = start - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const beginsText = days > 0 ? `Begins in ${days}d ${hours}h` : `Begins in ${hours}h`;
    const subtext = `Ends ${formatDate(deadline)} · ${formatDuration(startDate, deadline)}`;
    return { text: beginsText, subtext, upcoming: true, ended: false };
  }

  const diff = end - now;
  if (diff <= 0) return { text: "Ended", upcoming: false, ended: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return { text: `${days}d ${hours}h left`, upcoming: false, ended: false };
  return { text: `${hours}h left`, upcoming: false, ended: false };
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
          {statusConfig[challenge.status] && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig[challenge.status]!.className}`}
            >
              {statusConfig[challenge.status]!.label}
            </span>
          )}
          <span className="hidden sm:inline">
            {formatPostedDate(challenge.postedAt)}
          </span>
          {(() => {
            const t = getTimeLabel(challenge.startDate, challenge.deadline);
            return (
              <div className="text-right">
                <span
                  className={`font-medium ${
                    t.ended ? "text-red-500" : t.upcoming ? "text-muted" : "text-accent"
                  }`}
                >
                  {t.text}
                </span>
                {t.subtext && (
                  <p className="text-[10px] text-muted">{t.subtext}</p>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </button>
  );
}
