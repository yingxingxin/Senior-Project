CREATE TYPE "public"."achievement_rarity" AS ENUM('common', 'uncommon', 'rare', 'epic', 'legendary');--> statement-breakpoint
CREATE TYPE "public"."activity_event_type" AS ENUM('lesson_started', 'lesson_progressed', 'lesson_completed', 'quiz_started', 'quiz_submitted', 'quiz_perfect', 'achievement_unlocked', 'level_up', 'goal_met');--> statement-breakpoint
CREATE TYPE "public"."assistant_gender" AS ENUM('feminine', 'masculine', 'androgynous');--> statement-breakpoint
CREATE TYPE "public"."assistant_persona" AS ENUM('calm', 'kind', 'direct');--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('easy', 'standard', 'hard');--> statement-breakpoint
CREATE TYPE "public"."onboarding_step" AS ENUM('welcome', 'gender', 'persona', 'guided_intro');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid()::varchar(255) NOT NULL,
	"user_id" integer NOT NULL,
	"account_id" varchar(255) NOT NULL,
	"provider_id" varchar(64) NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"id_token" text,
	"password" varchar(255),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(80) NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text,
	"icon_url" varchar(500),
	"rarity" "achievement_rarity" DEFAULT 'common' NOT NULL,
	"points_reward" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "activity_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"event_type" "activity_event_type" NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now(),
	"points_delta" integer DEFAULT 0 NOT NULL,
	"lesson_id" integer,
	"quiz_id" integer,
	"quiz_attempt_id" integer,
	"achievement_id" integer
);
--> statement-breakpoint
CREATE TABLE "assistants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(64) NOT NULL,
	"gender" "assistant_gender",
	"avatar_url" varchar(500),
	"tagline" varchar(160),
	"description" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dialogues" (
	"id" serial PRIMARY KEY NOT NULL,
	"assistant_id" integer,
	"scene" varchar(64),
	"order_index" integer DEFAULT 0 NOT NULL,
	"role" varchar(16) DEFAULT 'assistant' NOT NULL,
	"message" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"slug" varchar(64) NOT NULL,
	"title" varchar(255) NOT NULL,
	"body_md" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(64) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"difficulty" "difficulty",
	"estimated_duration_sec" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "levels" (
	"level" integer PRIMARY KEY NOT NULL,
	"xp_to_reach" integer NOT NULL,
	"label" varchar(80)
);
--> statement-breakpoint
CREATE TABLE "music_tracks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"artist" varchar(255),
	"duration_sec" integer,
	"file_url" varchar(500),
	"volume" real,
	CONSTRAINT "ck_music_tracks__volume" CHECK ("music_tracks"."volume" >= 0 AND "music_tracks"."volume" <= 1)
);
--> statement-breakpoint
CREATE TABLE "quiz_attempt_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"attempt_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"selected_option_id" integer NOT NULL,
	"time_taken_ms" integer
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"quiz_id" integer NOT NULL,
	"attempt_number" integer DEFAULT 1 NOT NULL,
	"started_at" timestamp with time zone DEFAULT now(),
	"submitted_at" timestamp with time zone,
	"duration_sec" integer
);
--> statement-breakpoint
CREATE TABLE "quiz_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"text" text NOT NULL,
	"points" integer DEFAULT 1 NOT NULL,
	"hint" text,
	"lesson_section_id" integer,
	CONSTRAINT "ck_quiz_questions__points_positive" CHECK ("quiz_questions"."points" > 0)
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" serial PRIMARY KEY NOT NULL,
	"topic" varchar(255),
	"difficulty" "difficulty",
	"time_limit_sec" integer,
	"passing_pct" integer DEFAULT 70 NOT NULL,
	"lesson_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "ck_quizzes__passing_pct" CHECK ("quizzes"."passing_pct" BETWEEN 0 AND 100)
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid()::varchar(255) NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" varchar(64),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "study_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"background" varchar(255),
	"is_mentor_visible" boolean,
	"background_ambience" varchar(255),
	"user_id" integer,
	CONSTRAINT "study_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name" varchar(100) NOT NULL,
	"radius" varchar(8),
	"font" varchar(64),
	"primary" varchar(16),
	"secondary" varchar(16),
	"accent" varchar(16)
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"user_id" integer NOT NULL,
	"achievement_id" integer NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_achievements_user_id_achievement_id_pk" PRIMARY KEY("user_id","achievement_id")
);
--> statement-breakpoint
CREATE TABLE "user_lesson_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"lesson_id" integer NOT NULL,
	"last_section_id" integer,
	"is_completed" boolean DEFAULT false NOT NULL,
	"started_at" timestamp with time zone,
	"last_accessed_at" timestamp with time zone DEFAULT now(),
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_lesson_sections" (
	"user_id" integer NOT NULL,
	"section_id" integer NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_music_tracks" (
	"user_id" integer NOT NULL,
	"music_track_id" integer NOT NULL,
	CONSTRAINT "user_music_tracks_user_id_music_track_id_pk" PRIMARY KEY("user_id","music_track_id")
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"difficulty" "difficulty",
	"daily_goal_minutes" integer,
	"daily_goal_points" integer,
	"timezone" varchar(64),
	"reminders_enabled" boolean DEFAULT false NOT NULL,
	"reminder_time" time,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_theme_settings" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"theme_id" integer,
	"wallpaper_url" varchar(500),
	"low_motion" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"email_verified_at" timestamp with time zone,
	"image" varchar(500),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"assistant_id" integer,
	"assistant_persona" "assistant_persona",
	"onboarding_completed_at" timestamp with time zone,
	"onboarding_step" "onboarding_step",
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid()::varchar(255) NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"value" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_quiz_attempt_id_quiz_attempts_id_fk" FOREIGN KEY ("quiz_attempt_id") REFERENCES "public"."quiz_attempts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dialogues" ADD CONSTRAINT "dialogues_assistant_id_assistants_id_fk" FOREIGN KEY ("assistant_id") REFERENCES "public"."assistants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_sections" ADD CONSTRAINT "lesson_sections_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "quiz_attempt_answers_attempt_id_quiz_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."quiz_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "quiz_attempt_answers_question_id_quiz_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_options" ADD CONSTRAINT "quiz_options_question_id_quiz_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_lesson_section_id_lesson_sections_id_fk" FOREIGN KEY ("lesson_section_id") REFERENCES "public"."lesson_sections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_settings" ADD CONSTRAINT "study_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_last_section_id_lesson_sections_id_fk" FOREIGN KEY ("last_section_id") REFERENCES "public"."lesson_sections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_lesson_sections" ADD CONSTRAINT "user_lesson_sections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_lesson_sections" ADD CONSTRAINT "user_lesson_sections_section_id_lesson_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."lesson_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_music_tracks" ADD CONSTRAINT "user_music_tracks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_music_tracks" ADD CONSTRAINT "user_music_tracks_music_track_id_music_tracks_id_fk" FOREIGN KEY ("music_track_id") REFERENCES "public"."music_tracks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_theme_settings" ADD CONSTRAINT "user_theme_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_theme_settings" ADD CONSTRAINT "user_theme_settings_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_assistant_id_assistants_id_fk" FOREIGN KEY ("assistant_id") REFERENCES "public"."assistants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_accounts__provider_account" ON "accounts" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_achievements__code" ON "achievements" USING btree ("code");--> statement-breakpoint
CREATE INDEX "ix_activity_events__user_time" ON "activity_events" USING btree ("user_id","occurred_at");--> statement-breakpoint
CREATE INDEX "ix_activity_events__time" ON "activity_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "ix_activity_events__lesson" ON "activity_events" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "ix_activity_events__quiz" ON "activity_events" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX "ix_activity_events__quiz_attempt" ON "activity_events" USING btree ("quiz_attempt_id");--> statement-breakpoint
CREATE INDEX "ix_activity_events__achievement" ON "activity_events" USING btree ("achievement_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_assistants__slug" ON "assistants" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "ix_dialogues__assistant_scene_order" ON "dialogues" USING btree ("assistant_id","scene","order_index");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_lesson_sections__lesson_order" ON "lesson_sections" USING btree ("lesson_id","order_index");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_lesson_sections__lesson_slug" ON "lesson_sections" USING btree ("lesson_id","slug");--> statement-breakpoint
CREATE INDEX "ix_lesson_sections__lesson" ON "lesson_sections" USING btree ("lesson_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_lessons__slug" ON "lessons" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_quiz_attempt_answers__attempt_question" ON "quiz_attempt_answers" USING btree ("attempt_id","question_id");--> statement-breakpoint
CREATE INDEX "ix_quiz_attempt_answers__attempt" ON "quiz_attempt_answers" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "ix_quiz_attempt_answers__selected_option" ON "quiz_attempt_answers" USING btree ("selected_option_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_quiz_attempts__user_quiz_num" ON "quiz_attempts" USING btree ("user_id","quiz_id","attempt_number");--> statement-breakpoint
CREATE INDEX "ix_quiz_attempts__user" ON "quiz_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ix_quiz_attempts__quiz_started" ON "quiz_attempts" USING btree ("quiz_id","started_at");--> statement-breakpoint
CREATE INDEX "ix_quiz_options__question" ON "quiz_options" USING btree ("question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_quiz_options__question_order" ON "quiz_options" USING btree ("question_id","order_index");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_quiz_options__one_correct_per_question" ON "quiz_options" USING btree ("question_id") WHERE "quiz_options"."is_correct" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_quiz_options__qid_id" ON "quiz_options" USING btree ("question_id","id");--> statement-breakpoint
ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "quiz_attempt_answers_selected_option_id_quiz_options_id_fk" FOREIGN KEY ("selected_option_id") REFERENCES "public"."quiz_options"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "fk_quiz_attempt_answers__option_belongs_to_question" FOREIGN KEY ("question_id","selected_option_id") REFERENCES "public"."quiz_options"("question_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ix_quiz_questions__quiz" ON "quiz_questions" USING btree ("quiz_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_quiz_questions__quiz_order" ON "quiz_questions" USING btree ("quiz_id","order_index");--> statement-breakpoint
CREATE INDEX "ix_quizzes__lesson" ON "quizzes" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "ix_quizzes__created" ON "quizzes" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_themes__slug" ON "themes" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "ix_user_achievements__unlocked_at" ON "user_achievements" USING btree ("unlocked_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_lesson_progress__user_lesson" ON "user_lesson_progress" USING btree ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX "ix_user_lesson_progress__user" ON "user_lesson_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ix_user_lesson_progress__lesson" ON "user_lesson_progress" USING btree ("lesson_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_lesson_sections__user_section" ON "user_lesson_sections" USING btree ("user_id","section_id");--> statement-breakpoint
CREATE INDEX "ix_user_lesson_sections__user" ON "user_lesson_sections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ix_user_lesson_sections__section" ON "user_lesson_sections" USING btree ("section_id");