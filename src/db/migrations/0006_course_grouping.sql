-- Add course grouping columns to lessons table if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'course_slug') THEN
    ALTER TABLE "lessons" ADD COLUMN "course_slug" varchar(64) DEFAULT '' NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'order_index') THEN
    ALTER TABLE "lessons" ADD COLUMN "order_index" integer DEFAULT 0 NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'icon') THEN
    ALTER TABLE "lessons" ADD COLUMN "icon" varchar(10);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'is_published') THEN
    ALTER TABLE "lessons" ADD COLUMN "is_published" boolean DEFAULT true NOT NULL;
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS "ix_lessons__course_slug" ON "lessons" USING btree ("course_slug");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_lessons__course_order" ON "lessons" USING btree ("course_slug", "order_index");
