"use client";

import { signIn, signOut } from "next-auth/react";

export function GoogleSignIn({ className = "" }: { className?: string }) {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/schedule" })}
      className={`btn-primary w-full text-base ${className}`}
    >
      <span className="text-lg">🇬</span> Continue with Google
    </button>
  );
}

export function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-ghost w-full">
      Sign out
    </button>
  );
}
