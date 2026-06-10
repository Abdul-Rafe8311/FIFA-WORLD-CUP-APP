"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// "" means "auto" (use the device's timezone).
type TimezoneCtx = { tz: string; setTz: (tz: string) => void };
const Ctx = createContext<TimezoneCtx>({ tz: "", setTz: () => {} });

const STORE_KEY = "goalcast-timezone";

export function TimezoneProvider({ children }: { children: ReactNode }) {
  const [tz, setTzState] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (saved) setTzState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const setTz = (next: string) => {
    setTzState(next);
    try {
      localStorage.setItem(STORE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  return <Ctx.Provider value={{ tz, setTz }}>{children}</Ctx.Provider>;
}

/** Returns the effective IANA timezone (selected, or device default). */
export function useTimezone(): { tz: string | undefined; selected: string; setTz: (t: string) => void } {
  const { tz, setTz } = useContext(Ctx);
  return { tz: tz || undefined, selected: tz, setTz };
}

// Curated list of common timezones (label + IANA zone).
export const TIMEZONES: { value: string; label: string }[] = [
  { value: "", label: "🌐 Auto (my device)" },
  { value: "Asia/Karachi", label: "🇵🇰 Pakistan (PKT)" },
  { value: "Asia/Kolkata", label: "🇮🇳 India (IST)" },
  { value: "Asia/Dubai", label: "🇦🇪 UAE (GST)" },
  { value: "Asia/Riyadh", label: "🇸🇦 Saudi Arabia (AST)" },
  { value: "Europe/London", label: "🇬🇧 UK (GMT/BST)" },
  { value: "Europe/Berlin", label: "🇪🇺 Central Europe (CET)" },
  { value: "Africa/Lagos", label: "🇳🇬 West Africa (WAT)" },
  { value: "America/New_York", label: "🇺🇸 US East (ET)" },
  { value: "America/Chicago", label: "🇺🇸 US Central (CT)" },
  { value: "America/Los_Angeles", label: "🇺🇸 US West (PT)" },
  { value: "America/Mexico_City", label: "🇲🇽 Mexico (CST)" },
  { value: "America/Sao_Paulo", label: "🇧🇷 Brazil (BRT)" },
  { value: "America/Argentina/Buenos_Aires", label: "🇦🇷 Argentina (ART)" },
  { value: "Asia/Tokyo", label: "🇯🇵 Japan (JST)" },
  { value: "Australia/Sydney", label: "🇦🇺 Australia East (AET)" },
];

export function TimezoneSelect({ className = "" }: { className?: string }) {
  const { selected, setTz } = useTimezone();
  return (
    <label className={`flex items-center gap-2 ${className}`}>
      <span className="text-[11px] font-semibold text-white/45">🕑 Times in</span>
      <div className="relative">
        <select
          value={selected}
          onChange={(e) => setTz(e.target.value)}
          className="appearance-none rounded-lg border border-ink-line bg-ink-card py-1.5 pl-2.5 pr-7 text-xs font-semibold outline-none transition-colors hover:border-pitch/40 focus:border-pitch"
        >
          {TIMEZONES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/40">▾</span>
      </div>
    </label>
  );
}
