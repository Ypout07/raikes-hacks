"use client";

import { useState } from "react";
import { Challenge, ProviderChallenge } from "@/lib/types";
import { mockProviderChallenges } from "@/lib/mockProviderChallenges";
import ChallengeList from "@/components/ChallengeList";
import ProviderNavbar from "@/components/ProviderNavbar";
import ChallengeForm from "@/components/ChallengeForm";
import ProviderChallengeDetail from "@/components/ProviderChallengeDetail";

export default function CompanyPage() {
  const [challenges, setChallenges] = useState<ProviderChallenge[]>(mockProviderChallenges);
  const [selected, setSelected] = useState<ProviderChallenge | null>(null);
  const [showForm, setShowForm] = useState(true);

  function handleSelect(challenge: Challenge) {
    const full = challenges.find((c) => c.id === challenge.id);
    if (full) {
      setSelected(full);
      setShowForm(false);
    }
  }

  function handleNewChallenge() {
    setSelected(null);
    setShowForm(true);
  }

  function handleSubmit(newChallenge: ProviderChallenge) {
    setChallenges((prev) => [newChallenge, ...prev]);
    setShowForm(false);
  }

  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <ProviderNavbar />
      <div className="flex flex-1 min-h-0 gap-px bg-surface-hover">
        {/* Left — Provider's challenges */}
        <div className="flex-1 min-w-0 p-6 min-h-0 bg-white">
          <ChallengeList
            heading="Your Challenges"
            challenges={challenges}
            selectedId={selected?.id ?? null}
            onSelect={handleSelect}
            action={
              <button
                onClick={handleNewChallenge}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-accent text-white hover:bg-accent-dim transition-colors"
              >
                New Challenge
              </button>
            }
          />
        </div>

        {/* Right — Detail or Form */}
        <div className="flex-1 min-w-0 flex flex-col bg-white">
          {showForm ? (
            <ChallengeForm onSubmit={handleSubmit} />
          ) : selected ? (
            <ProviderChallengeDetail challenge={selected} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted text-sm">
              Select a challenge or create a new one
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
