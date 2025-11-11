-- Legacy course_slug column creation extracted from historical migration.
-- Keep this in place so later migrations that expect the column continue to work.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'lessons'
      AND column_name = 'course_slug'
  ) THEN
    ALTER TABLE "lessons"
      ADD COLUMN "course_slug" varchar(64) DEFAULT '' NOT NULL;
  END IF;
END $$;
