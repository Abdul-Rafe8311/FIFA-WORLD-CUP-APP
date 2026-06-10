# GoalCast ⚽ — FIFA World Cup 2026 Predictions PWA

Mobile-first, installable PWA where you predict every World Cup match, beat an
AI Pundit, climb global/country leaderboards, run private leagues, predict the
starting XI, and play a daily penalty shootout vs an AI keeper.

Built with **Next.js 14 (App Router) · TypeScript · Tailwind · Drizzle +
Supabase Postgres · Auth.js (Google) · Groq · football-data.org · @vercel/og**.
Runs entirely on free tiers.

---

## 1. Local setup

```bash
npm install
cp .env.example .env.local   # then fill in the values (see below)
```

### Environment variables (`.env.local`)

| Var | Where to get it |
| --- | --- |
| `DATABASE_URL` | Supabase → Project Settings → Database → **Connection string → Transaction (pooled, port 6543)**. Append `?sslmode=require`. Required for Vercel serverless. |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google Cloud OAuth client (see §4) |
| `GROQ_API_KEY` | https://console.groq.com (free) |
| `FOOTBALL_DATA_TOKEN` | https://www.football-data.org (free tier) |
| `CRON_SECRET` | `openssl rand -hex 24` — the `?key=` cron-job.org passes |
| `ADMIN_EMAILS` | Comma-separated emails allowed at `/admin/lineups` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` locally; your Vercel URL in prod |

## 2. Database

```bash
npm run db:push      # create all tables from the Drizzle schema
npm run seed:bot     # create the "The Pundit" AI bot user (auto-joins every league)
npm run seed         # load the 104-match WC schedule (football-data, else data/fixtures.json)
npm run seed:squads  # load 26-man squads from data/squads.json
```

- `data/fixtures.json` ships with the full **104-match** placeholder structure
  (12 groups + full knockout bracket). The seed prefers football-data.org and
  only falls back to the file. Set `homeCode`/`awayCode` to ISO-2 (e.g. `BR`,
  `AR`) for flag emojis. Regenerate with `node scripts/gen-fixtures.mjs`.
- `data/squads.json` ships with **placeholder** squads for 3 teams. Replace with
  real 26-man squads (see §6), then re-run `npm run seed:squads`.

```bash
npm run dev          # http://localhost:3000
```

## 3. Game rules (all enforced server-side)

- **Score:** exact = **3 pts**, correct result (W/D/L) = **1 pt**, else 0. One
  prediction per match, editable until **kickoff**.
- **Lineup:** 11/11 = **5**, 9–10 = **3**, 7–8 = **1**, else 0. Locks **90 min
  before kickoff** (before official lineups drop). Exactly 1 GK required.
- Points are computed only when a match is **FINISHED**.

## 4. Google OAuth

1. Google Cloud Console → APIs & Services → Credentials → **Create OAuth client
   ID** → Web application.
2. Authorized JavaScript origins: `http://localhost:3000` and your Vercel URL.
3. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://YOUR-APP.vercel.app/api/auth/callback/google`
4. Copy client ID/secret into `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.

## 5. Deploy to Vercel + cron

1. Push to GitHub, import the repo in Vercel (Hobby is fine).
2. Add **all** env vars from `.env.example` in the Vercel project settings. Set
   `NEXT_PUBLIC_APP_URL` to your real Vercel URL.
3. Deploy.

### Cron (via cron-job.org — **not** vercel.json)

Create two jobs at https://cron-job.org, each calling a GET URL:

| Job | URL | Schedule |
| --- | --- | --- |
| AI content | `https://YOUR-APP.vercel.app/api/cron/ai-content?key=CRON_SECRET` | once daily, morning UTC |
| Results | `https://YOUR-APP.vercel.app/api/cron/results?key=CRON_SECRET` | every 30 min |

Both return 401 without the correct `?key=`. `results` is idempotent.

## 6. Squads — needed before lineup predictions work

`data/squads.json` currently has placeholder names. Paste the real 26-man squads
in this shape (one entry per player, ISO-2 team codes, unique shirt numbers):

```json
{ "BR": [{ "name": "Alisson", "position": "GK", "shirtNumber": 1 }, ...] }
```

Positions must be `GK | DEF | MID | FWD`. Then `npm run seed:squads`.

## 7. Admin lineup entry

Free fixture APIs don't reliably include lineups, so the actual XI is entered by
hand. Visit `/admin/lineups` (only for `ADMIN_EMAILS`), tick the 11 starters per
team, and save — this writes the actual lineup **and immediately scores** every
lineup prediction for that team.

---

Unofficial fan game. Not affiliated with FIFA.
