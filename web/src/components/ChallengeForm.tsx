"use client";

import { useState } from "react";
import { ProviderChallenge } from "@/lib/types";

interface ChallengeFormProps {
  onSubmit: (challenge: ProviderChallenge) => void;
}

export default function ChallengeForm({ onSubmit }: ChallengeFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [metrics, setMetrics] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
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
      deadline: deadline ? new Date(deadline).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString(),
      metrics: metrics.split(",").map((m) => m.trim()).filter(Boolean),
      repoUrl: repoUrl.trim(),
      submissionCount: 0,
    };

    onSubmit(challenge);
    setTitle("");
    setDescription("");
    setMetrics("");
    setRepoUrl("");
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
            <input
              type="text"
              placeholder="latency, accuracy, throughput"
              value={metrics}
              onChange={(e) => setMetrics(e.target.value)}
              className={inputClass}
            />
            <p className="text-xs text-muted mt-1">Comma-separated metric names</p>
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
              Deadline
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
