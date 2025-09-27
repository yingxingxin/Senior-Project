DO $$ BEGIN
 CREATE TYPE "public"."skill_level" AS ENUM('beginner', 'intermediate', 'advanced');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TYPE "public"."onboarding_step" ADD VALUE 'skill_quiz' BEFORE 'persona';
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "skill_level" "skill_level";