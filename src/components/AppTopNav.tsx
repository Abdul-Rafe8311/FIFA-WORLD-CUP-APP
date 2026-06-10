"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { cn, initials } from "@/lib/utils";

const LINKS = [
  { href: "/schedule", label: "Schedule" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/penalty", label: "Penalty" },
];

export default function AppTopNav() {
  const pathname = usePathname();
  const { data } = useSession();
  const user = data?.user;
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-ink-line bg-ink/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/schedule" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pitch text-base">⚽</span>
          <span className="text-lg font-black">
            Goal<span className="text-pitch">Cast</span>
          </span>
        </Link>

        {/* Desktop links (centered) */}
        <nav className="mx-auto hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                isActive(l.href) ? "bg-pitch/10 text-pitch" : "text-white/60 hover:bg-ink-soft hover:text-white",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right: avatar dropdown + mobile hamburger */}
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <div className="relative">
            <button
              onClick={() => setUserOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-ink-line bg-ink-card py-1 pl-1 pr-2 transition-colors hover:border-pitch/40"
            >
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="" className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-soft text-xs font-bold text-pitch">
                  {initials(user?.name)}
                </span>
              )}
              <span className="hidden max-w-[8rem] truncate text-sm font-semibold sm:block">
                {user?.name ?? "Account"}
              </span>
              <span className="text-white/40">▾</span>
            </button>

            {userOpen && (
              <>
                <button
                  className="fixed inset-0 z-40 cursor-default"
                  aria-label="Close menu"
                  onClick={() => setUserOpen(false)}
                />
                <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-ink-line bg-ink-card shadow-2xl">
                  <Link
                    href="/profile"
                    onClick={() => setUserOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium transition-colors hover:bg-ink-soft"
                  >
                    👤 Profile
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="block w-full px-4 py-2.5 text-left text-sm font-medium text-red-300 transition-colors hover:bg-ink-soft"
                  >
                    ↩ Sign out
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Hamburger (mobile) */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-line text-lg md:hidden"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="border-t border-ink-line bg-ink px-4 py-2 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                isActive(l.href) ? "bg-pitch/10 text-pitch" : "text-white/70 hover:bg-ink-soft",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
