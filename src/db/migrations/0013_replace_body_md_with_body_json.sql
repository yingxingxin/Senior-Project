-- Migration: Add body_json column to lesson_sections table
-- This is Step 1 of the Tiptap migration - adds new column alongside existing body_md
--
-- DEPLOYMENT SEQUENCE:
--   1. Run THIS migration (adds body_json column as nullable)
--   2. Run migration script (scripts/migrate-to-tiptap.ts) to populate body_json
--   3. Verify all content migrated successfully
--   4. Deploy application code that reads from body_json
--   5. Later: Run cleanup migration to drop body_md column

-- Add body_json column (nullable during migration period)
ALTER TABLE "lesson_sections" ADD COLUMN IF NOT EXISTS "body_json" jsonb;
