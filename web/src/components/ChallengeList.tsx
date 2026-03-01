"use client";

import { useState, useMemo } from "react";
import { Challenge } from "@/lib/types";
import ChallengeCard from "./ChallengeCard";

type SortKey = "newest" | "deadline" | "company";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "deadline", label: "Deadline" },
  { key: "company", label: "Company" },
];

interface ChallengeListProps {
  heading: string;
  challenges: Challenge[];
  selectedId: string | null;
  onSelect: (challenge: Challenge) => void;
}

export default function ChallengeList({
  heading,
  challenges,
  selectedId,
  onSelect,
}: ChallengeListProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = challenges.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q)
    );

    list.sort((a, b) => {
      if (sort === "newest")
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
      if (sort === "deadline")
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      return a.company.localeCompare(b.company);
    });

    return list;
  }, [challenges, search, sort]);

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-sm font-medium uppercase tracking-wider text-muted mb-4">
        {heading}
      </h2>

      {/* Search bar */}
      <div className="relative mb-3">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search challenges..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface-overlay border border-surface-hover rounded-md py-2 pl-10 pr-4 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Sort toggles */}
      <div className="flex gap-1 mb-4">
        {sortOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSort(opt.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              sort === opt.key
                ? "bg-accent text-surface"
                : "bg-surface-overlay text-muted hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Challenge cards */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-hide">
        {filtered.length === 0 && (
          <p className="text-muted text-sm py-8 text-center">No challenges found.</p>
        )}
        {filtered.map((c) => (
          <ChallengeCard
            key={c.id}
            challenge={c}
            isSelected={selectedId === c.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
