CREATE TABLE "assistants" (
	"assistant_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"gender" varchar(50),
	"avatar_png" varchar(500),
	"personality" text
);
--> statement-breakpoint
CREATE TABLE "dashboards" (
	"dashboard_id" serial PRIMARY KEY NOT NULL,
	"theme" varchar(100),
	"custom" json,
	"user_id" integer,
	CONSTRAINT "dashboards_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "dialogues" (
	"dialogue_id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"type" varchar(50),
	"assistant_id" integer
);
--> statement-breakpoint
CREATE TABLE "leaderboards" (
	"leaderboard_id" serial PRIMARY KEY NOT NULL,
	"rank" integer,
	"total_points" integer
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"lesson_id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text,
	"difficulty" varchar(50),
	"hint" text,
	"correct_answer" text,
	"assistant_id" integer
);
--> statement-breakpoint
CREATE TABLE "music" (
	"music_id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"artist" varchar(255),
	"duration" integer,
	"file_url" varchar(500),
	"volume" numeric(3, 2)
);
--> statement-breakpoint
CREATE TABLE "progress" (
	"progress_id" serial PRIMARY KEY NOT NULL,
	"status" varchar(50),
	"score" integer
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"quiz_id" serial PRIMARY KEY NOT NULL,
	"topic" varchar(255),
	"difficulty" varchar(50),
	"time_limit" integer
);
--> statement-breakpoint
CREATE TABLE "study_modes" (
	"study_mode_id" serial PRIMARY KEY NOT NULL,
	"background" varchar(255),
	"mentor_visibility" boolean,
	"background_ambience" varchar(255),
	"user_id" integer,
	CONSTRAINT "study_modes_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_participates_leaderboard" (
	"user_id" integer NOT NULL,
	"leaderboard_id" integer NOT NULL,
	CONSTRAINT "user_participates_leaderboard_user_id_leaderboard_id_pk" PRIMARY KEY("user_id","leaderboard_id")
);
--> statement-breakpoint
CREATE TABLE "user_plays_music" (
	"user_id" integer NOT NULL,
	"music_id" integer NOT NULL,
	CONSTRAINT "user_plays_music_user_id_music_id_pk" PRIMARY KEY("user_id","music_id")
);
--> statement-breakpoint
CREATE TABLE "user_takes_quiz" (
	"user_id" integer NOT NULL,
	"quiz_id" integer NOT NULL,
	CONSTRAINT "user_takes_quiz_user_id_quiz_id_pk" PRIMARY KEY("user_id","quiz_id")
);
--> statement-breakpoint
CREATE TABLE "user_tracks_progress" (
	"user_id" integer NOT NULL,
	"lesson_id" integer NOT NULL,
	"progress_id" integer NOT NULL,
	CONSTRAINT "user_tracks_progress_user_id_lesson_id_pk" PRIMARY KEY("user_id","lesson_id"),
	CONSTRAINT "user_tracks_progress_progress_id_unique" UNIQUE("progress_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"assistant_id" integer,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dialogues" ADD CONSTRAINT "dialogues_assistant_id_assistants_assistant_id_fk" FOREIGN KEY ("assistant_id") REFERENCES "public"."assistants"("assistant_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_assistant_id_assistants_assistant_id_fk" FOREIGN KEY ("assistant_id") REFERENCES "public"."assistants"("assistant_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_modes" ADD CONSTRAINT "study_modes_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_participates_leaderboard" ADD CONSTRAINT "user_participates_leaderboard_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_participates_leaderboard" ADD CONSTRAINT "user_participates_leaderboard_leaderboard_id_leaderboards_leaderboard_id_fk" FOREIGN KEY ("leaderboard_id") REFERENCES "public"."leaderboards"("leaderboard_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_plays_music" ADD CONSTRAINT "user_plays_music_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_plays_music" ADD CONSTRAINT "user_plays_music_music_id_music_music_id_fk" FOREIGN KEY ("music_id") REFERENCES "public"."music"("music_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_takes_quiz" ADD CONSTRAINT "user_takes_quiz_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_takes_quiz" ADD CONSTRAINT "user_takes_quiz_quiz_id_quizzes_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("quiz_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tracks_progress" ADD CONSTRAINT "user_tracks_progress_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tracks_progress" ADD CONSTRAINT "user_tracks_progress_lesson_id_lessons_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("lesson_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tracks_progress" ADD CONSTRAINT "user_tracks_progress_progress_id_progress_progress_id_fk" FOREIGN KEY ("progress_id") REFERENCES "public"."progress"("progress_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_assistant_id_assistants_assistant_id_fk" FOREIGN KEY ("assistant_id") REFERENCES "public"."assistants"("assistant_id") ON DELETE no action ON UPDATE no action;