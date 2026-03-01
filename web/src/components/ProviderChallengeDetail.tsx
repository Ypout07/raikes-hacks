"use client";

import { ProviderChallenge } from "@/lib/types";

function getTimeRemaining(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface ProviderChallengeDetailProps {
  challenge: ProviderChallenge;
}

export default function ProviderChallengeDetail({
  challenge,
}: ProviderChallengeDetailProps) {
  const timeRemaining = getTimeRemaining(challenge.deadline);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 pb-5 bg-surface-overlay flex-shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
          {challenge.company}
        </h2>
        <h1 className="text-2xl font-bold text-heading mb-2">
          {challenge.title}
        </h1>
        <p className="text-muted text-sm leading-relaxed">
          {challenge.description}
        </p>
      </div>

      {/* Stats row */}
      <div className="px-6 py-4 border-b border-surface-hover bg-surface-raised flex-shrink-0">
        <div className="flex gap-3">
          {[
            { label: "Submissions", value: String(challenge.submissionCount) },
            { label: "Time Left", value: timeRemaining },
            { label: "Metrics", value: String(challenge.metrics.length) },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex-1 bg-surface-overlay rounded-lg px-4 py-3"
            >
              <p className="text-[10px] uppercase tracking-wider text-muted">
                {stat.label}
              </p>
              <p className="text-lg font-bold text-heading">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide space-y-6">
        {/* Metrics */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            Target Metrics
          </h3>
          <div className="flex flex-wrap gap-2">
            {challenge.metrics.map((m) => (
              <span
                key={m}
                className="inline-flex px-3 py-1 bg-surface-overlay rounded-full text-xs text-heading font-medium"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Repository */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            Repository
          </h3>
          <p className="font-mono text-sm text-accent bg-surface-overlay px-4 py-2.5 rounded-lg">
            {challenge.repoUrl}
          </p>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            Timeline
          </h3>
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-muted text-xs">Posted</p>
              <p className="text-heading font-medium">{formatDate(challenge.postedAt)}</p>
            </div>
            <div>
              <p className="text-muted text-xs">Deadline</p>
              <p className="text-heading font-medium">{formatDate(challenge.deadline)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
