-- Migration: Restructure quizzes table for standalone quiz feature
-- This migration restructures the quizzes system to be standalone (not tied to lessons)
-- and updates the question/answer structure to use JSON arrays instead of separate options table

-- Step 1: Drop foreign key constraints that reference old structure
ALTER TABLE "quiz_questions" DROP CONSTRAINT IF EXISTS "quiz_questions_lesson_section_id_lesson_sections_id_fk";
ALTER TABLE "quizzes" DROP CONSTRAINT IF EXISTS "quizzes_lesson_id_lessons_id_fk";

-- Step 2: Drop old quiz_options table (we're using JSON arrays in quiz_questions now)
DROP TABLE IF EXISTS "quiz_options" CASCADE;

-- Step 3-5: Drop old quiz-related tables (we'll recreate them with new structure)
-- Note: These are dropped here and will be recreated later with new schemas
DROP TABLE IF EXISTS "quiz_attempt_answers" CASCADE;
DROP TABLE IF EXISTS "quiz_attempts" CASCADE;
DROP TABLE IF EXISTS "quiz_questions" CASCADE;

-- Step 6: Restructure quizzes table
-- First, drop old columns
ALTER TABLE "quizzes" DROP COLUMN IF EXISTS "topic";
ALTER TABLE "quizzes" DROP COLUMN IF EXISTS "difficulty";
ALTER TABLE "quizzes" DROP COLUMN IF EXISTS "time_limit_sec";
ALTER TABLE "quizzes" DROP COLUMN IF EXISTS "passing_pct";
ALTER TABLE "quizzes" DROP COLUMN IF EXISTS "lesson_id";

-- Add new columns (using DO block to check if columns exist first)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quizzes' AND column_name='slug') THEN
        ALTER TABLE "quizzes" ADD COLUMN "slug" varchar(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quizzes' AND column_name='title') THEN
        ALTER TABLE "quizzes" ADD COLUMN "title" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quizzes' AND column_name='description') THEN
        ALTER TABLE "quizzes" ADD COLUMN "description" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quizzes' AND column_name='topic_slug') THEN
        ALTER TABLE "quizzes" ADD COLUMN "topic_slug" varchar(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quizzes' AND column_name='skill_level') THEN
        ALTER TABLE "quizzes" ADD COLUMN "skill_level" "skill_level";
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quizzes' AND column_name='default_length') THEN
        ALTER TABLE "quizzes" ADD COLUMN "default_length" integer DEFAULT 5;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quizzes' AND column_name='updated_at') THEN
        ALTER TABLE "quizzes" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();
    END IF;
END $$;

-- Make required columns NOT NULL (after data migration if needed)
-- Note: If you have existing data, you'll need to populate these first
-- For now, we'll make them nullable initially, then you can update and make them NOT NULL

-- Step 7: Add constraints and indexes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'uq_quizzes__slug') THEN
        CREATE UNIQUE INDEX "uq_quizzes__slug" ON "quizzes" ("slug");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_quizzes__topic_slug') THEN
        CREATE INDEX "ix_quizzes__topic_slug" ON "quizzes" ("topic_slug");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ix_quizzes__skill_level') THEN
        CREATE INDEX "ix_quizzes__skill_level" ON "quizzes" ("skill_level");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_quizzes__default_length') THEN
        ALTER TABLE "quizzes" ADD CONSTRAINT "ck_quizzes__default_length" CHECK ("default_length" > 0);
    END IF;
END $$;

-- Step 8: Recreate quiz_questions table with new structure
CREATE TABLE "quiz_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"prompt" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_index" integer NOT NULL,
	"explanation" text,
	CONSTRAINT "quiz_questions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "uq_quiz_questions__quiz_order" UNIQUE("quiz_id","order_index"),
	CONSTRAINT "ck_quiz_questions__correct_index" CHECK ("correct_index" >= 0 AND "correct_index" <= 3)
);

CREATE INDEX "ix_quiz_questions__quiz" ON "quiz_questions" ("quiz_id");

-- Step 9: Recreate quiz_attempts table with new structure
CREATE TABLE "quiz_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"quiz_id" integer NOT NULL,
	"score" integer NOT NULL,
	"total_questions" integer NOT NULL,
	"percentage" integer NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "quiz_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "quiz_attempts_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "ck_quiz_attempts__score" CHECK ("score" >= 0 AND "score" <= "total_questions"),
	CONSTRAINT "ck_quiz_attempts__percentage" CHECK ("percentage" >= 0 AND "percentage" <= 100)
);

CREATE INDEX "ix_quiz_attempts__user" ON "quiz_attempts" ("user_id");
CREATE INDEX "ix_quiz_attempts__quiz" ON "quiz_attempts" ("quiz_id");
CREATE INDEX "ix_quiz_attempts__completed_at" ON "quiz_attempts" ("completed_at");

-- Step 10: Recreate quiz_attempt_answers table with new structure
CREATE TABLE "quiz_attempt_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"attempt_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"selected_index" integer NOT NULL,
	CONSTRAINT "quiz_attempt_answers_attempt_id_quiz_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."quiz_attempts"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "quiz_attempt_answers_question_id_quiz_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "uq_quiz_attempt_answers__attempt_question" UNIQUE("attempt_id","question_id"),
	CONSTRAINT "ck_quiz_attempt_answers__selected_index" CHECK ("selected_index" >= 0 AND "selected_index" <= 3)
);

CREATE INDEX "ix_quiz_attempt_answers__attempt" ON "quiz_attempt_answers" ("attempt_id");

-- Step 11: Make required columns NOT NULL if table is empty
-- If you have existing quiz data, populate the new columns first, then run this:
DO $$ 
BEGIN
    -- Only set NOT NULL if there are no rows (safe for new installations)
    IF (SELECT COUNT(*) FROM "quizzes") = 0 THEN
        ALTER TABLE "quizzes" ALTER COLUMN "slug" SET NOT NULL;
        ALTER TABLE "quizzes" ALTER COLUMN "title" SET NOT NULL;
        ALTER TABLE "quizzes" ALTER COLUMN "topic_slug" SET NOT NULL;
        ALTER TABLE "quizzes" ALTER COLUMN "skill_level" SET NOT NULL;
    END IF;
END $$;

-- Step 12: Update activity_events foreign key if it exists
-- The foreign key should still work since we kept the quiz_id column in activity_events

