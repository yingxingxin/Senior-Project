-- Migration: Add AI-generated quiz support to quizzes table
-- Enables user-generated AI quizzes alongside admin-curated global quizzes
--
-- FEATURES ENABLED:
--   1. User ownership for AI-generated quizzes
--   2. Ability to identify and filter AI-generated quizzes
--
-- BACKWARDS COMPATIBILITY:
--   - All existing quizzes remain as is_ai_generated=false, owner_user_id=NULL
--   - No changes required to existing data or application code
--   - New features are opt-in via new columns

-- Add new columns to quizzes table
ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "is_ai_generated" boolean NOT NULL DEFAULT false;
ALTER TABLE "quizzes" ADD COLUMN IF NOT EXISTS "owner_user_id" integer;

-- Add foreign key constraint for owner_user_id
DO $$ BEGIN
  ALTER TABLE "quizzes"
    ADD CONSTRAINT "fk_quizzes_owner_user_id"
    FOREIGN KEY ("owner_user_id")
    REFERENCES "users"("id")
    ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create index for performance (filtering AI-generated quizzes by owner)
CREATE INDEX IF NOT EXISTS "idx_quizzes_owner_ai" ON "quizzes"("owner_user_id") WHERE "is_ai_generated" = true;

