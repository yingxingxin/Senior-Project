import { pgTable, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth"; // or wherever your users table is

export const timedRuns = pgTable("timed_runs", {
    id: serial("id").primaryKey(),

    exerciseId: varchar("exercise_id", { length: 100 }).notNull(),
    lang: varchar("lang", { length: 20 }).notNull(),

    elapsedMs: integer("elapsed_ms").notNull(),

    userId: integer("user_id")
        .references(() => users.id, { onDelete: "cascade" }),  // optional for now

    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

export type NewTimedRun = typeof timedRuns.$inferInsert;
export type TimedRun = typeof timedRuns.$inferSelect;



