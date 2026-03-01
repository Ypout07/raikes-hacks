"use client";

import { useState } from "react";
import { Challenge } from "@/lib/types";
import { mockChallenges } from "@/lib/mockChallenges";
import ChallengeList from "@/components/ChallengeList";
import Navbar from "@/components/Navbar";

// Top 5 by soonest deadline for trending
const trending = [...mockChallenges]
  .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
  .slice(0, 5);

export default function Home() {
  const [selected, setSelected] = useState<Challenge>(mockChallenges[0]);

  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      <div className="flex flex-1 min-h-0">
      {/* Left — Trending challenges, full height */}
      <div className="flex-1 min-w-0 p-6 min-h-0">
        <ChallengeList
          heading="Trending"
          challenges={trending}
          selectedId={selected.id}
          onSelect={setSelected}
        />
      </div>

      {/* Divider */}
      <div className="w-px bg-surface-hover flex-shrink-0" />

      {/* Right — Description + tabs */}
      <div className="flex-1 min-w-0 flex flex-col p-6">
        {/* Dynamic description */}
        <section className="pb-5 flex-shrink-0">
          <h2 className="text-sm font-medium uppercase tracking-wider text-accent mb-2">
            {selected.company}
          </h2>
          <h1 className="text-3xl font-bold mb-3">{selected.title}</h1>
          <p className="text-muted text-sm leading-relaxed">
            {selected.description}
          </p>
        </section>

        {/* Tab bar placeholder */}
        <div className="border-b border-surface-hover flex-shrink-0">
          <div className="flex gap-0">
            {["Request", "Obfuscated Repository", "Upload"].map((tab) => (
              <button
                key={tab}
                className="px-5 py-3 text-sm font-medium text-muted hover:text-white transition-colors border-b-2 border-transparent"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content area (placeholder) */}
        <div className="flex-1 min-h-0" />
      </div>
      </div>
    </main>
  );
}
