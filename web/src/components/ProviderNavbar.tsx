"use client";

export default function ProviderNavbar() {
  return (
    <nav className="flex items-center justify-between px-8 h-12 bg-surface-hover/60 backdrop-blur-lg border-b border-surface-hover flex-shrink-0">
      <span className="text-sm text-muted">
        Provider Dashboard &mdash;{" "}
        <span className="text-heading font-semibold">Capital One</span>
      </span>

      <div className="flex items-center gap-0">
        {["My Challenges", "Analytics", "Settings"].map((item) => (
          <button
            key={item}
            className="px-4 py-1.5 text-xs text-body hover:text-heading transition-colors"
          >
            {item}
          </button>
        ))}
      </div>
    </nav>
  );
}
