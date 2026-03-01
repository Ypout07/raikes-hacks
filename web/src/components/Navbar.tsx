"use client";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 h-12 bg-surface-hover/60 backdrop-blur-lg border-b border-surface-hover flex-shrink-0">
      <span className="text-sm text-muted">
        Welcome back, <span className="text-heading font-semibold">Adam</span>
      </span>

      <div className="flex items-center gap-0">
        {["Learn", "Completed/Ongoing Challenges", "Profile", "About"].map(
          (item) => (
            <button
              key={item}
              className="px-4 py-1.5 text-xs text-body hover:text-heading transition-colors"
            >
              {item}
            </button>
          )
        )}
      </div>
    </nav>
  );
}
