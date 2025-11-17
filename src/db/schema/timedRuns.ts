import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const timedRuns = pgTable("timed_runs", {
    id: serial("id").primaryKey(),

    userId: text("user_id"),                    // null allowed for now
    exerciseId: text("exercise_id").notNull(),
    lang: text("lang").notNull(),

    elapsedMs: integer("elapsed_ms").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});