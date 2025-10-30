-- Add parent_lesson_id for hierarchical lesson structure
-- NULL = top-level course, integer = topic within a course
ALTER TABLE "lessons" ADD COLUMN "parent_lesson_id" integer;

-- Add foreign key constraint
ALTER TABLE "lessons"
ADD CONSTRAINT "fk_lessons__parent"
FOREIGN KEY ("parent_lesson_id")
REFERENCES "lessons"("id")
ON DELETE CASCADE;

-- Drop old course grouping columns/indexes
DROP INDEX IF EXISTS "uq_lessons__course_order";
DROP INDEX IF EXISTS "ix_lessons__course_slug";
ALTER TABLE "lessons" DROP COLUMN IF EXISTS "course_slug";

-- Create new indexes for hierarchy
CREATE INDEX "ix_lessons__parent" ON "lessons" USING btree ("parent_lesson_id");
CREATE UNIQUE INDEX "uq_lessons__parent_order" ON "lessons" USING btree ("parent_lesson_id", "order_index");
