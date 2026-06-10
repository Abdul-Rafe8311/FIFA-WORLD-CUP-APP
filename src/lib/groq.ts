import Groq from "groq-sdk";

const MODEL = "llama-3.3-70b-versatile";

function client(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");
  return new Groq({ apiKey });
}

const PERSONA =
  "You are 'The Pundit', a confident, witty, slightly savage English football " +
  "pundit. You're that friend who is annoyingly sure about football and right " +
  "just often enough to be insufferable. Never break character.";

/** Strip ```json fences and parse a strict-JSON object defensively. */
function parseJson<T>(raw: string): T | null {
  try {
    const cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

export type PunditPrediction = { home: number; away: number; reasoning: string };

export async function generatePrediction(args: {
  home: string;
  away: string;
  group?: string | null;
  stage: string;
}): Promise<PunditPrediction> {
  const res = await client().chat.completions.create({
    model: MODEL,
    temperature: 0.7,
    messages: [
      { role: "system", content: PERSONA },
      {
        role: "user",
        content:
          `Predict the score for ${args.home} vs ${args.away} ` +
          `(${args.stage}${args.group ? `, ${args.group}` : ""}) at the 2026 World Cup. ` +
          `Respond ONLY with strict JSON: ` +
          `{ "home": <int>, "away": <int>, "reasoning": "<max 2 sentences>" }. ` +
          `No prose outside the JSON.`,
      },
    ],
  });
  const raw = res.choices[0]?.message?.content ?? "";
  const parsed = parseJson<PunditPrediction>(raw);
  if (
    !parsed ||
    typeof parsed.home !== "number" ||
    typeof parsed.away !== "number"
  ) {
    // Defensive fallback so cron never hard-fails.
    return { home: 1, away: 1, reasoning: "Too close to call, but I'll back a draw." };
  }
  return {
    home: Math.max(0, Math.min(9, Math.round(parsed.home))),
    away: Math.max(0, Math.min(9, Math.round(parsed.away))),
    reasoning: String(parsed.reasoning ?? "").slice(0, 240),
  };
}

export async function generatePreview(args: {
  home: string;
  away: string;
  group?: string | null;
  stage: string;
}): Promise<string> {
  const res = await client().chat.completions.create({
    model: MODEL,
    temperature: 0.85,
    messages: [
      { role: "system", content: PERSONA },
      {
        role: "user",
        content:
          `Write a punchy ~60-word match preview for ${args.home} vs ${args.away} ` +
          `(${args.stage}${args.group ? `, ${args.group}` : ""}). ` +
          `End with a single bold, confident claim. No headings, no emojis.`,
      },
    ],
  });
  return (res.choices[0]?.message?.content ?? "").trim().slice(0, 600);
}

export async function generateRoast(args: {
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  punditWasRight: boolean;
}): Promise<string> {
  const res = await client().chat.completions.create({
    model: MODEL,
    temperature: 0.9,
    messages: [
      { role: "system", content: PERSONA },
      {
        role: "user",
        content:
          `Full time: ${args.home} ${args.homeScore}-${args.awayScore} ${args.away}. ` +
          `Your prediction was ${args.punditWasRight ? "RIGHT" : "WRONG"}. ` +
          `Write a ~50-word post-match reaction. ` +
          (args.punditWasRight
            ? "Be insufferably cocky about being right."
            : "Make a self-deprecating excuse, but stay charming.") +
          ` No headings, no emojis.`,
      },
    ],
  });
  return (res.choices[0]?.message?.content ?? "").trim().slice(0, 500);
}
