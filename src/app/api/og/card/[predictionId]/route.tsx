import { ImageResponse } from "next/og";
import { db } from "@/db";
import { predictions, matches, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { predictionId: string } },
) {
  const rows = await db
    .select({
      homePred: predictions.homePred,
      awayPred: predictions.awayPred,
      points: predictions.points,
      userName: users.name,
      homeTeam: matches.homeTeam,
      awayTeam: matches.awayTeam,
      homeScore: matches.homeScore,
      awayScore: matches.awayScore,
      status: matches.status,
    })
    .from(predictions)
    .innerJoin(matches, eq(matches.id, predictions.matchId))
    .innerJoin(users, eq(users.id, predictions.userId))
    .where(eq(predictions.id, params.predictionId))
    .limit(1);

  const p = rows[0];
  const green = "#00e676";
  const ink = "#050807";

  if (!p) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: ink,
            color: "#fff",
            fontSize: 60,
          }}
        >
          GoalCast
        </div>
      ),
      { width: 1080, height: 1920 },
    );
  }

  const finished = p.status === "finished" && p.homeScore != null && p.awayScore != null;
  const pts = p.points ?? 0;
  const correct = pts > 0;
  const mark = !finished ? "" : correct ? "✓" : "✗";
  const accent = !finished ? green : correct ? green : "#ff5252";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(160deg, #0a1410, ${ink})`,
          color: "#fff",
          padding: 90,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 64, fontWeight: 800 }}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: 24,
              background: green,
              color: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 56,
              marginRight: 28,
            }}
          >
            ⚽
          </div>
          Goal<span style={{ color: green }}>Cast</span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 44, color: "#9aa", marginBottom: 30, display: "flex" }}>
            {p.userName ?? "A player"} predicted
          </div>

          <div style={{ display: "flex", alignItems: "center", fontSize: 130, fontWeight: 900 }}>
            <span>{p.homePred}</span>
            <span style={{ color: "#556", margin: "0 30px" }}>–</span>
            <span>{p.awayPred}</span>
          </div>
          <div style={{ display: "flex", fontSize: 48, color: "#cdd", marginTop: 16 }}>
            {p.homeTeam} v {p.awayTeam}
          </div>

          {finished && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 70,
                paddingTop: 40,
                borderTop: "3px solid #1f2627",
              }}
            >
              <div style={{ display: "flex", fontSize: 44, color: "#9aa" }}>
                Final {p.homeScore}–{p.awayScore}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: 24,
                  fontSize: 72,
                  fontWeight: 900,
                  color: accent,
                }}
              >
                {mark} {correct ? "I called it!" : "Not this time"} +{pts} pts
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", fontSize: 38, color: "#667" }}>
          Predict every World Cup match · goalcast.app
        </div>
      </div>
    ),
    { width: 1080, height: 1920 },
  );
}
