-- Migration: Add AI-generated lesson support to lessons table
-- Enables user-generated AI lessons alongside admin-curated global lessons
--
-- FEATURES ENABLED:
--   1. Scope-based visibility (global, user-private, shared)
--   2. User ownership for AI-generated lessons
--   3. AI generation metadata tracking
--   4. Social features (shared lessons between users)
--
-- BACKWARDS COMPATIBILITY:
--   - All existing lessons remain as scope='global', owner_user_id=NULL
--   - No changes required to existing data or application code
--   - New features are opt-in via new columns

-- Create enum for lesson scope
DO $$ BEGIN
  CREATE TYPE lesson_scope AS ENUM ('global', 'user', 'shared');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns to lessons table
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "scope" lesson_scope NOT NULL DEFAULT 'global';
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "owner_user_id" integer;
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "is_ai_generated" boolean NOT NULL DEFAULT false;
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "ai_metadata" jsonb;

-- Add foreign key constraint for owner_user_id
DO $$ BEGIN
  ALTER TABLE "lessons"
    ADD CONSTRAINT "fk_lessons_owner_user_id"
    FOREIGN KEY ("owner_user_id")
    REFERENCES "users"("id")
    ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add check constraint: user/shared lessons must have an owner
DO $$ BEGIN
  ALTER TABLE "lessons"
    ADD CONSTRAINT "ck_lessons_user_scope_requires_owner"
    CHECK (scope = 'global' OR owner_user_id IS NOT NULL);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_lessons_scope" ON "lessons"("scope");
CREATE INDEX IF NOT EXISTS "idx_lessons_owner_ai" ON "lessons"("owner_user_id") WHERE "is_ai_generated" = true;
CREATE INDEX IF NOT EXISTS "idx_lessons_global_published" ON "lessons"("is_published") WHERE "scope" = 'global';

-- Create table for tracking shared lesson access (for social features)
CREATE TABLE IF NOT EXISTS "shared_lesson_users" (
  "lesson_id" integer NOT NULL,
  "user_id" integer NOT NULL,
  "shared_by_user_id" integer NOT NULL,
  "shared_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("lesson_id", "user_id")
);

-- Add foreign keys for shared_lesson_users
DO $$ BEGIN
  ALTER TABLE "shared_lesson_users"
    ADD CONSTRAINT "fk_shared_lesson_users_lesson_id"
    FOREIGN KEY ("lesson_id")
    REFERENCES "lessons"("id")
    ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "shared_lesson_users"
    ADD CONSTRAINT "fk_shared_lesson_users_user_id"
    FOREIGN KEY ("user_id")
    REFERENCES "users"("id")
    ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "shared_lesson_users"
    ADD CONSTRAINT "fk_shared_lesson_users_shared_by_user_id"
    FOREIGN KEY ("shared_by_user_id")
    REFERENCES "users"("id")
    ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create index for shared lesson lookups
CREATE INDEX IF NOT EXISTS "idx_shared_lesson_users_user_id" ON "shared_lesson_users"("user_id");
CREATE INDEX IF NOT EXISTS "idx_shared_lesson_users_shared_by" ON "shared_lesson_users"("shared_by_user_id");

-- Add comment explaining ai_metadata structure
COMMENT ON COLUMN "lessons"."ai_metadata" IS 'JSONB structure: {
  "model_used": "gpt-4o",
  "generation_prompt": "original user request",
  "persona_snapshot": "calm" | "kind" | "direct",
  "skill_level_snapshot": "beginner" | "intermediate" | "advanced",
  "generation_job_id": "uuid",
  "generated_at": "ISO timestamp",
  "regeneration_count": 0,
  "generation_duration_ms": 45000,
  "token_usage": { "prompt": 500, "completion": 2000 }
}';
