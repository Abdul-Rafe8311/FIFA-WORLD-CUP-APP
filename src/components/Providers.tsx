"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { TimezoneProvider } from "@/components/Timezone";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <TimezoneProvider>{children}</TimezoneProvider>
    </SessionProvider>
  );
}
