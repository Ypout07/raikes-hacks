"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Get Started", href: "/get-started" },
  { label: "Challenges", href: "/" },
  { label: "Profile", href: "/" },
  { label: "About", href: "/" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between px-8 h-12 bg-surface-hover/60 backdrop-blur-lg border-b border-surface-hover flex-shrink-0">
      <Link href="/" className="text-sm text-muted hover:text-heading transition-colors">
        Welcome back, <span className="text-heading font-semibold">Adam</span>
      </Link>

      <div className="flex items-center gap-0">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`px-4 py-1.5 text-xs transition-colors ${
              pathname === item.href
                ? "text-heading font-semibold"
                : "text-body hover:text-heading"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
