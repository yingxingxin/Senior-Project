DROP INDEX IF EXISTS "ix_lessons__course_slug";--> statement-breakpoint
DROP INDEX IF EXISTS "uq_lessons__course_slug";--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "parent_lesson_id" integer;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ix_lessons__parent" ON "lessons" USING btree ("parent_lesson_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_lessons__parent_order" ON "lessons" USING btree ("parent_lesson_id","order_index");--> statement-breakpoint
ALTER TABLE "lessons" DROP COLUMN IF EXISTS "course_slug";