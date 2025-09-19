CREATE TYPE "public"."token_type" AS ENUM('password_reset', 'email_verification');--> statement-breakpoint
ALTER TABLE "auth_tokens" ADD COLUMN "token_type" "token_type" DEFAULT 'password_reset' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified_at" timestamp;