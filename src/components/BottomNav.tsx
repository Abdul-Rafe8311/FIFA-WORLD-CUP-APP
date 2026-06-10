"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/schedule", label: "Schedule", icon: "📅" },
  { href: "/leaderboard", label: "Ranks", icon: "🏆" },
  { href: "/penalty", label: "Penalty", icon: "🥅" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-app -translate-x-1/2 border-t border-ink-line bg-ink/95 backdrop-blur sm:max-w-2xl lg:max-w-3xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4">
        {TABS.map((t) => {
          const active = pathname === t.href || pathname.startsWith(t.href + "/");
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors active:scale-95",
                  active ? "text-pitch" : "text-white/55",
                )}
              >
                <span className="text-lg leading-none">{t.icon}</span>
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
