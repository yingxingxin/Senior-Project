ALTER TABLE "timed_runs" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "timed_runs" ALTER COLUMN "exercise_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "timed_runs" ADD COLUMN "lang" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "timed_runs" ADD COLUMN "elapsed_ms" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "timed_runs" DROP COLUMN "best_ms";