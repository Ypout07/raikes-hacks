"use client";

import { useState, useRef, useMemo } from "react";
import { ProviderChallenge } from "@/lib/types";

const PRESET_METRICS = [
  "Accuracy",
  "AUC",
  "Cost reduction %",
  "Data freshness",
  "Execution time",
  "F1 score",
  "False positive rate",
  "Inference time",
  "Latency",
  "Memory usage",
  "p95 latency",
  "Pipeline reliability",
  "Test coverage",
  "Throughput",
  "Tokens used",
];

interface ChallengeFormProps {
  onSubmit: (challenge: ProviderChallenge) => void;
}

export default function ChallengeForm({ onSubmit }: ChallengeFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [metricSearch, setMetricSearch] = useState("");
  const [metricDropdownOpen, setMetricDropdownOpen] = useState(false);
  const metricInputRef = useRef<HTMLInputElement>(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [deadline, setDeadline] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const challenge: ProviderChallenge = {
      id: "p" + Date.now(),
      title: title.trim(),
      company: "Capital One",
      description: description.trim(),
      request: "",
      status: "unattempted",
      postedAt: new Date().toISOString(),
      startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      deadline: deadline ? new Date(deadline).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString(),
      metrics: selectedMetrics,
      repoUrl: repoUrl.trim(),
      submissionCount: 0,
    };

    onSubmit(challenge);
    setTitle("");
    setDescription("");
    setSelectedMetrics([]);
    setMetricSearch("");
    setRepoUrl("");
    setStartDate(() => {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      return now.toISOString().slice(0, 16);
    });
    setDeadline("");
  }

  const inputClass =
    "w-full bg-surface-overlay border border-surface-hover rounded-lg py-2.5 px-4 text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all";

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-4 bg-surface-overlay flex-shrink-0">
        <h1 className="text-2xl font-bold text-heading">Post New Challenge</h1>
        <p className="text-muted text-sm mt-1">
          Define the problem, set your metrics, and share the repository.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Title
            </label>
            <input
              type="text"
              placeholder="Challenge title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Description
            </label>
            <textarea
              placeholder="Describe the problem and what participants need to accomplish..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} min-h-[120px] resize-none`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Metrics
            </label>
            <div className="relative">
              <input
                ref={metricInputRef}
                type="text"
                placeholder="Search or add metrics..."
                value={metricSearch}
                onChange={(e) => {
                  setMetricSearch(e.target.value);
                  setMetricDropdownOpen(true);
                }}
                onFocus={() => setMetricDropdownOpen(true)}
                onBlur={() => setTimeout(() => setMetricDropdownOpen(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && metricSearch.trim()) {
                    e.preventDefault();
                    const val = metricSearch.trim();
                    if (!selectedMetrics.includes(val)) {
                      setSelectedMetrics([...selectedMetrics, val]);
                    }
                    setMetricSearch("");
                  }
                }}
                className={inputClass}
              />
              {metricDropdownOpen && (() => {
                const q = metricSearch.toLowerCase();
                const filtered = PRESET_METRICS.filter(
                  (m) => m.toLowerCase().includes(q) && !selectedMetrics.includes(m)
                );
                if (filtered.length === 0) return null;
                return (
                  <div className="absolute z-10 w-full mt-1 bg-surface-overlay border border-surface-hover rounded-lg shadow-md max-h-32 overflow-y-auto">
                    {filtered.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSelectedMetrics([...selectedMetrics, m]);
                          setMetricSearch("");
                          metricInputRef.current?.focus();
                        }}
                        className="w-full text-left px-3 py-1.5 text-sm text-heading hover:bg-surface-hover transition-colors"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
            {selectedMetrics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedMetrics.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent text-xs font-medium rounded-full"
                  >
                    {m}
                    <button
                      type="button"
                      onClick={() => setSelectedMetrics(selectedMetrics.filter((s) => s !== m))}
                      className="hover:text-red-500 transition-colors"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Repository URL
            </label>
            <input
              type="url"
              placeholder="https://github.com/..."
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Start Date
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              End Date
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-accent text-white text-sm font-medium py-2.5 rounded-lg hover:bg-accent-dim transition-colors mt-8"
        >
          Post Challenge
        </button>
      </form>
    </div>
  );
}
