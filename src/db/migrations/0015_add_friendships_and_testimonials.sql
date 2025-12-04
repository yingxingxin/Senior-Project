-- Migration: Add friendships and testimonials tables
-- Enables friend requests and testimonials features
--
-- FEATURES ENABLED:
--   1. Friend requests (pending, accepted, rejected)
--   2. Testimonials written by friends
--   3. Profile moderation of testimonials

-- Create enum for friendship status
DO $$ BEGIN
  CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_friendships table
CREATE TABLE IF NOT EXISTS "user_friendships" (
  "id" serial PRIMARY KEY NOT NULL,
  "requester_user_id" integer NOT NULL,
  "receiver_user_id" integer NOT NULL,
  "status" friendship_status NOT NULL DEFAULT 'pending',
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "user_friendships_requester_user_id_users_id_fk" FOREIGN KEY ("requester_user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "user_friendships_receiver_user_id_users_id_fk" FOREIGN KEY ("receiver_user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create unique constraint to prevent duplicate friendships
CREATE UNIQUE INDEX IF NOT EXISTS "uq_friendships__pair" ON "user_friendships" ("requester_user_id", "receiver_user_id");

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "ix_friendships__requester" ON "user_friendships" ("requester_user_id");
CREATE INDEX IF NOT EXISTS "ix_friendships__receiver" ON "user_friendships" ("receiver_user_id");
CREATE INDEX IF NOT EXISTS "ix_friendships__status" ON "user_friendships" ("status");

-- Create user_testimonials table
CREATE TABLE IF NOT EXISTS "user_testimonials" (
  "id" serial PRIMARY KEY NOT NULL,
  "author_user_id" integer NOT NULL,
  "recipient_user_id" integer NOT NULL,
  "body" text NOT NULL,
  "is_public" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "user_testimonials_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "user_testimonials_recipient_user_id_users_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create indexes for testimonials
CREATE INDEX IF NOT EXISTS "ix_testimonials__recipient" ON "user_testimonials" ("recipient_user_id");
CREATE INDEX IF NOT EXISTS "ix_testimonials__author" ON "user_testimonials" ("author_user_id");
CREATE INDEX IF NOT EXISTS "ix_testimonials__public" ON "user_testimonials" ("is_public");

