CREATE TYPE "public"."assistant_gender" AS ENUM('feminine', 'masculine', 'androgynous');--> statement-breakpoint
CREATE TYPE "public"."assistant_persona" AS ENUM('calm', 'kind', 'direct');--> statement-breakpoint
CREATE TYPE "public"."onboarding_step" AS ENUM('gender', 'persona', 'guided_intro');--> statement-breakpoint
ALTER TABLE "assistants" ALTER COLUMN "gender" SET DATA TYPE "public"."assistant_gender" USING "gender"::"public"."assistant_gender";--> statement-breakpoint
ALTER TABLE "assistants" ADD COLUMN "slug" varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE "assistants" ADD COLUMN "tagline" varchar(160);--> statement-breakpoint
ALTER TABLE "assistants" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "assistants" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "assistants" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "assistant_persona" "assistant_persona";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_step" "onboarding_step";--> statement-breakpoint
CREATE UNIQUE INDEX "assistants_slug_key" ON "assistants" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "assistants" DROP COLUMN "personality";