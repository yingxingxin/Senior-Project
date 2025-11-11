DROP INDEX "ix_lessons__course_slug";--> statement-breakpoint
DROP INDEX "uq_lessons__course_order";--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "parent_lesson_id" integer;--> statement-breakpoint
CREATE INDEX "ix_lessons__parent" ON "lessons" USING btree ("parent_lesson_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_lessons__parent_order" ON "lessons" USING btree ("parent_lesson_id","order_index");--> statement-breakpoint
ALTER TABLE "lessons" DROP COLUMN "course_slug";