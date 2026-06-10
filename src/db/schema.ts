import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  jsonb,
  uniqueIndex,
  index,
  varchar,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  image: text("image"),
  country: varchar("country", { length: 2 }), // ISO-2, nullable until set
  isBot: boolean("is_bot").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Matches
// ---------------------------------------------------------------------------
export const matches = pgTable(
  "matches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fdId: integer("fd_id").unique(), // football-data id, nullable
    stage: text("stage").notNull(), // GROUP_STAGE, ROUND_OF_32, ...
    groupName: text("group_name"), // "Group A" etc, nullable in knockouts
    homeTeam: text("home_team").notNull(),
    awayTeam: text("away_team").notNull(),
    homeCode: varchar("home_code", { length: 2 }), // ISO-2 for flags
    awayCode: varchar("away_code", { length: 2 }),
    kickoffUtc: timestamp("kickoff_utc", { withTimezone: true }).notNull(),
    status: text("status").notNull().default("scheduled"), // scheduled | live | finished
    homeScore: integer("home_score"),
    awayScore: integer("away_score"),
  },
  (t) => ({
    kickoffIdx: index("matches_kickoff_idx").on(t.kickoffUtc),
    statusIdx: index("matches_status_idx").on(t.status),
  }),
);

// ---------------------------------------------------------------------------
// Score predictions
// ---------------------------------------------------------------------------
export const predictions = pgTable(
  "predictions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    homePred: integer("home_pred").notNull(),
    awayPred: integer("away_pred").notNull(),
    points: integer("points"), // null until scored
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userMatch: uniqueIndex("predictions_user_match_uq").on(t.userId, t.matchId),
    matchIdx: index("predictions_match_idx").on(t.matchId),
  }),
);

// ---------------------------------------------------------------------------
// Leagues
// ---------------------------------------------------------------------------
export const leagues = pgTable("leagues", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  inviteCode: varchar("invite_code", { length: 6 }).notNull().unique(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const leagueMembers = pgTable(
  "league_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    leagueId: uuid("league_id")
      .notNull()
      .references(() => leagues.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pair: uniqueIndex("league_members_pair_uq").on(t.leagueId, t.userId),
  }),
);

// ---------------------------------------------------------------------------
// AI content (cached, served to all users)
// ---------------------------------------------------------------------------
export const aiContent = pgTable(
  "ai_content",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // prediction | preview | roast
    text: text("text").notNull(),
    homePred: integer("home_pred"),
    awayPred: integer("away_pred"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    matchType: uniqueIndex("ai_content_match_type_uq").on(t.matchId, t.type),
  }),
);

// ---------------------------------------------------------------------------
// Penalty mini-game scores
// ---------------------------------------------------------------------------
export const penaltyScores = pgTable(
  "penalty_scores",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: varchar("date", { length: 10 }).notNull(), // yyyy-mm-dd (UTC)
    score: integer("score").notNull().default(0),
    bestStreak: integer("best_streak").notNull().default(0),
  },
  (t) => ({
    userDate: uniqueIndex("penalty_user_date_uq").on(t.userId, t.date),
  }),
);

// ---------------------------------------------------------------------------
// Players (26-man squads)
// ---------------------------------------------------------------------------
export const players = pgTable(
  "players",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teamCode: varchar("team_code", { length: 2 }).notNull(),
    name: text("name").notNull(),
    position: text("position").notNull(), // GK | DEF | MID | FWD
    shirtNumber: integer("shirt_number"),
  },
  (t) => ({
    teamIdx: index("players_team_idx").on(t.teamCode),
    teamNumberUq: uniqueIndex("players_team_number_uq").on(t.teamCode, t.shirtNumber),
  }),
);

// ---------------------------------------------------------------------------
// Lineup predictions
// ---------------------------------------------------------------------------
export const lineupPredictions = pgTable(
  "lineup_predictions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    teamCode: varchar("team_code", { length: 2 }).notNull(),
    playerIds: jsonb("player_ids").notNull().$type<string[]>(), // exactly 11
    points: integer("points"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uq: uniqueIndex("lineup_pred_user_match_team_uq").on(t.userId, t.matchId, t.teamCode),
  }),
);

// ---------------------------------------------------------------------------
// Actual match lineups (admin-entered)
// ---------------------------------------------------------------------------
export const matchLineups = pgTable(
  "match_lineups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    teamCode: varchar("team_code", { length: 2 }).notNull(),
    playerIds: jsonb("player_ids").notNull().$type<string[]>(), // exactly 11
  },
  (t) => ({
    uq: uniqueIndex("match_lineups_match_team_uq").on(t.matchId, t.teamCode),
  }),
);

// ---------------------------------------------------------------------------
// Type exports
// ---------------------------------------------------------------------------
export type User = typeof users.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type Prediction = typeof predictions.$inferSelect;
export type League = typeof leagues.$inferSelect;
export type LeagueMember = typeof leagueMembers.$inferSelect;
export type AiContent = typeof aiContent.$inferSelect;
export type PenaltyScore = typeof penaltyScores.$inferSelect;
export type Player = typeof players.$inferSelect;
export type LineupPrediction = typeof lineupPredictions.$inferSelect;
export type MatchLineup = typeof matchLineups.$inferSelect;
