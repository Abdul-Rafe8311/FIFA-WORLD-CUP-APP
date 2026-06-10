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
  const [imgOk, setImgOk] = useState(true);

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
    <main className="grid min-h-[100dvh] lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pitch text-lg">⚽</span>
            <span className="text-xl font-black">
              Goal<span className="text-pitch">Cast</span>
            </span>
          </Link>

          <h1 className="text-3xl font-black tracking-tight">
            {mode === "login" ? "Welcome back!" : "Create your account"}
          </h1>
          <p className="mt-2 text-white/55">
            {mode === "login"
              ? "Log in to make your World Cup predictions."
              : "Sign up to predict, beat the AI, and top your country."}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === "signup" && (
              <Field label="Name">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="login-input" />
              </Field>
            )}
            <Field label="Email">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="youremail@yourdomain.com" className="login-input" />
            </Field>
            <Field label="Password">
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "signup" ? "Create a password" : "Your password"} className="login-input" />
            </Field>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-50">
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Sign up"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-white/35">
            <span className="h-px flex-1 bg-ink-line" /> or <span className="h-px flex-1 bg-ink-line" />
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/schedule" })}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-ink-line bg-ink-card py-3 font-semibold transition-colors hover:border-pitch/40"
          >
            <span className="text-lg">🇬</span> Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-white/55">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError(null);
              }}
              className="font-bold text-pitch"
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>

      {/* Right: image panel with testimonial */}
      <div className="relative hidden overflow-hidden lg:block">
        {imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/auth-side.jpg"
            alt=""
            onError={() => setImgOk(false)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-pitch/30 via-emerald-700/20 to-ink" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute bottom-8 left-8 right-8">
          <div className="mb-3 flex gap-2">
            <span className="rounded-md bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">World Cup 2026</span>
            <span className="rounded-md bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">Free to play</span>
          </div>
          <div className="rounded-2xl bg-black/40 p-5 backdrop-blur">
            <p className="text-lg font-medium leading-snug">
              “I called Brazil 2–1 and beat the AI Pundit three matchdays running.
              GoalCast makes every game matter.”
            </p>
            <p className="mt-3 text-sm text-white/60">
              A GoalCast predictor · <span className="font-semibold text-white/80">Top 1%</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-white/80">{label}</span>
      {children}
    </label>
  );
}
