"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh]" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(
    params.get("mode") === "signup" ? "signup" : "login",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const j = await res.json();
        if (!res.ok) throw new Error(j.error ?? "Sign up failed");
      }
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) throw new Error("Invalid email or password");
      router.push("/schedule");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-5 py-10">
      <Link href="/" className="mb-6 flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pitch text-xl">⚽</span>
        <span className="text-2xl font-black">
          Goal<span className="text-pitch">Cast</span>
        </span>
      </Link>

      {/* Shine-border card */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl p-[1.5px]">
        <span className="absolute inset-[-150%] animate-[spin_6s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0%,#00e676_15%,transparent_35%)]" />
        <div className="relative rounded-2xl bg-ink-card p-6">
          <h1 className="text-xl font-bold">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-1 text-sm text-white/55">
            {mode === "login"
              ? "Log in to make your predictions."
              : "Sign up to start predicting and climb the ranks."}
          </p>

          <form onSubmit={submit} className="mt-5 space-y-3">
            {mode === "signup" && (
              <Field label="Name">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="login-input"
                />
              </Field>
            )}
            <Field label="Email">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="login-input"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="login-input"
              />
            </Field>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-50">
              {busy ? "Please wait…" : mode === "login" ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-[11px] text-white/35">
            <span className="h-px flex-1 bg-ink-line" /> OR <span className="h-px flex-1 bg-ink-line" />
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/schedule" })}
            className="btn-ghost w-full"
          >
            <span>🇬</span> Continue with Google
          </button>

          <p className="mt-4 text-center text-sm text-white/55">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError(null);
              }}
              className="font-semibold text-pitch"
            >
              {mode === "login" ? "Create an account" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-white/70">{label}</span>
      {children}
    </label>
  );
}
