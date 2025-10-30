DROP INDEX "uq_user_lesson_sections__user_section";--> statement-breakpoint
ALTER TABLE "quizzes" ALTER COLUMN "topic" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_lesson_sections" ADD CONSTRAINT "user_lesson_sections_user_id_section_id_pk" PRIMARY KEY("user_id","section_id");