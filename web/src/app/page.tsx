"use client";

import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Challenge } from "@/lib/types";
import { mockChallenges } from "@/lib/mockChallenges";
import ChallengeList from "@/components/ChallengeList";
import Navbar from "@/components/Navbar";

// Top 5 by soonest deadline for trending
const trending = [...mockChallenges]
  .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
  .slice(0, 5);

type Tab = "Request" | "Obfuscated Repository" | "Upload";

export default function Home() {
  const [selected, setSelected] = useState<Challenge>(mockChallenges[0]);
  const [view, setView] = useState<"trending" | "library">("trending");
  const [activeTab, setActiveTab] = useState<Tab>("Request");

  const library = useMemo(
    () => mockChallenges.filter((c) => c.status === "submitted" || c.status === "ongoing" || c.status === "expired"),
    []
  );

  const allChallenges = useMemo(
    () => mockChallenges.filter((c) => c.status !== "expired"),
    []
  );

  const displayedChallenges = view === "trending" ? allChallenges : library;

  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      <div className="flex flex-1 min-h-0 gap-px bg-surface-hover">
        {/* Left — Challenge list */}
        <div className="flex-1 min-w-0 p-6 min-h-0 bg-white">
          <ChallengeList
            heading={
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setView("trending")}
                  className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                    view === "trending"
                      ? "text-heading"
                      : "text-muted hover:text-body"
                  }`}
                >
                  Challenges
                </button>
                <span className="text-surface-hover">|</span>
                <button
                  onClick={() => setView("library")}
                  className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                    view === "library"
                      ? "text-heading"
                      : "text-muted hover:text-body"
                  }`}
                >
                  Your Challenges
                </button>
              </div>
            }
            challenges={displayedChallenges}
            selectedId={selected.id}
            onSelect={setSelected}
          />
        </div>

        {/* Divider */}

        {/* Right — Description + tabs */}
        <div className="flex-1 min-w-0 flex flex-col bg-white">
          {/* Dynamic description */}
          <section className="p-6 pb-5 flex-shrink-0 bg-surface-overlay">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
              {selected.company}
            </h2>
            <h1 className="text-3xl font-bold text-heading mb-3">
              {selected.title}
            </h1>
            <p className="text-muted text-sm leading-relaxed">
              {selected.description}
            </p>
          </section>

          {/* Tab bar */}
          <div className="px-6 border-b border-surface-hover flex-shrink-0 bg-surface-raised">
            <div className="flex gap-0">
              {(["Request", "Obfuscated Repository", "Upload"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab
                      ? "text-heading border-heading"
                      : "text-muted hover:text-heading border-transparent"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content area */}
          <div className="flex-1 min-h-0 p-6 overflow-y-auto">
            {activeTab === "Request" && (
              <article className="prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selected.request}
                </ReactMarkdown>
              </article>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
