-- Migration: Add quiz_progress table for tracking incomplete quiz attempts
-- Created: 2025-01-XX
-- Description: Allows users to save and resume quiz progress

-- Create quiz_progress table
CREATE TABLE IF NOT EXISTS "quiz_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"quiz_id" integer NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "quiz_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "quiz_progress_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "uq_quiz_progress__user_quiz" UNIQUE("user_id","quiz_id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "ix_quiz_progress__user" ON "quiz_progress" ("user_id");
CREATE INDEX IF NOT EXISTS "ix_quiz_progress__quiz" ON "quiz_progress" ("quiz_id");

