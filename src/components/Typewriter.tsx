"use client";

import { useEffect, useState } from "react";

/**
 * Typewriter effect that types out a list of words/phrases one character at a
 * time, pauses, deletes, and cycles to the next — with a blinking caret.
 */
export default function Typewriter({
  words,
  className = "",
  typeSpeed = 90,
  deleteSpeed = 45,
  pause = 1500,
  caretClassName = "bg-pitch",
}: {
  words: string[];
  className?: string;
  typeSpeed?: number;
  deleteSpeed?: number;
  pause?: number;
  caretClassName?: string;
}) {
  const [index, setIndex] = useState(0); // which word
  const [text, setText] = useState(""); // visible substring
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[index % words.length];

    // Finished typing → hold, then start deleting.
    if (!deleting && text === word) {
      const t = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(t);
    }

    // Finished deleting → advance to next word.
    if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
      return;
    }

    const t = setTimeout(
      () => {
        setText((cur) =>
          deleting ? word.slice(0, cur.length - 1) : word.slice(0, cur.length + 1)
        );
      },
      deleting ? deleteSpeed : typeSpeed
    );
    return () => clearTimeout(t);
  }, [text, deleting, index, words, typeSpeed, deleteSpeed, pause]);

  return (
    <span className={className} aria-label={words.join(", ")}>
      {text}
      <span
        className={`ml-1 inline-block h-[0.9em] w-[3px] translate-y-[0.08em] animate-pulse rounded-full align-middle ${caretClassName}`}
      />
    </span>
  );
}
