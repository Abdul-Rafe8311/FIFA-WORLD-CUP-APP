"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/schedule", label: "Schedule", icon: "📅" },
  { href: "/leaderboard", label: "Leaderboard", icon: "🏆" },
  { href: "/penalty", label: "Penalty", icon: "🥅" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function SideNav() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-[100dvh] w-60 shrink-0 flex-col border-r border-ink-line bg-ink/40 p-4 lg:flex">
      <Link href="/schedule" className="mb-6 flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pitch text-lg">⚽</span>
        <span className="text-lg font-black">
          Goal<span className="text-pitch">Cast</span>
        </span>
      </Link>

      <nav className="space-y-1">
        {TABS.map((t) => {
          const active = pathname === t.href || pathname.startsWith(t.href + "/");
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active ? "bg-pitch/10 text-pitch" : "text-white/60 hover:bg-ink-soft hover:text-white",
              )}
            >
              <span className="text-lg">{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
      </nav>

      <p className="mt-auto px-2 text-[11px] text-white/30">GoalCast · World Cup 2026</p>
    </aside>
  );
}
