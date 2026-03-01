"use client";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-surface-hover flex-shrink-0">
      <span className="text-sm text-muted">
        Welcome back, <span className="text-white font-medium">Adam</span>
      </span>

      <div className="flex items-center gap-1">
        {["Learn", "Completed/Ongoing Challenges", "Profile", "About"].map(
          (item) => (
            <button
              key={item}
              className="px-4 py-2 text-sm text-muted hover:text-white transition-colors rounded hover:bg-surface-overlay"
            >
              {item}
            </button>
          )
        )}
      </div>
    </nav>
  );
}
