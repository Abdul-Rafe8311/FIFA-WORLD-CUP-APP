"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "goalcast-install-dismissed";

export default function InstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosModal, setShowIosModal] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS legacy
      window.navigator.standalone === true;
    if (isStandalone) return;

    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const isSafari =
      /safari/i.test(window.navigator.userAgent) &&
      !/crios|fxios|chrome/i.test(window.navigator.userAgent);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS Safari has no beforeinstallprompt — show the manual hint.
    if (isIos && isSafari) setVisible(true);

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    setVisible(false);
    setShowIosModal(false);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  const onInstall = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      dismiss();
    } else {
      setShowIosModal(true);
    }
  };

  if (!visible) return null;

  return (
    <>
      <div
        className="fixed bottom-20 left-1/2 z-50 w-[calc(100%-2rem)] max-w-[448px] -translate-x-1/2 animate-slide-up"
        role="dialog"
        aria-label="Install GoalCast"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-ink-line bg-ink-card p-3 shadow-2xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pitch text-xl">
            ⚽
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Install GoalCast</p>
            <p className="text-xs text-white/55">Add to your home screen</p>
          </div>
          <button onClick={onInstall} className="btn-primary px-3 text-sm">
            Install
          </button>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="px-1 text-white/40"
          >
            ✕
          </button>
        </div>
      </div>

      {showIosModal && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4"
          onClick={dismiss}
        >
          <div
            className="w-full max-w-app animate-slide-up rounded-2xl border border-ink-line bg-ink-card p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-2 text-lg font-bold">Add to Home Screen</p>
            <ol className="space-y-2 text-sm text-white/80">
              <li>
                1. Tap the <span className="font-semibold">Share</span> icon{" "}
                <span aria-hidden>􀈂</span> at the bottom of Safari.
              </li>
              <li>
                2. Scroll and tap{" "}
                <span className="font-semibold">Add to Home Screen</span>.
              </li>
              <li>
                3. Tap <span className="font-semibold">Add</span>. GoalCast lives
                on your home screen.
              </li>
            </ol>
            <button onClick={dismiss} className="btn-primary mt-4 w-full">
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
