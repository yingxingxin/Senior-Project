ALTER TABLE "user_theme_settings" RENAME COLUMN "theme_id" TO "active_theme_id";--> statement-breakpoint
ALTER TABLE "user_theme_settings" DROP CONSTRAINT "user_theme_settings_theme_id_themes_id_fk";
--> statement-breakpoint
ALTER TABLE "themes" ALTER COLUMN "primary" SET DATA TYPE varchar(32);--> statement-breakpoint
ALTER TABLE "themes" ALTER COLUMN "secondary" SET DATA TYPE varchar(32);--> statement-breakpoint
ALTER TABLE "themes" ALTER COLUMN "accent" SET DATA TYPE varchar(32);--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "base_bg" varchar(32);--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "base_fg" varchar(32);--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "card_bg" varchar(32);--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "card_fg" varchar(32);--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "popover_bg" varchar(32);--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "popover_fg" varchar(32);--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "muted_bg" varchar(32);--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "muted_fg" varchar(32);--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "destructive_bg" varchar(32);--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "destructive_fg" varchar(32);--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "font_sans" varchar(128);--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "font_serif" varchar(128);--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "font_mono" varchar(128);--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "letter_spacing" real;--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "hue_shift" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "saturation_adjust" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "lightness_adjust" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "spacing_scale" real DEFAULT 1;--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "shadow_strength" varchar(16) DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "is_dark_mode" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "parent_theme_id" integer;--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "is_built_in" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "themes" ADD CONSTRAINT "themes_parent_theme_id_themes_id_fk" FOREIGN KEY ("parent_theme_id") REFERENCES "public"."themes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "themes" ADD CONSTRAINT "themes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_theme_settings" ADD CONSTRAINT "user_theme_settings_active_theme_id_themes_id_fk" FOREIGN KEY ("active_theme_id") REFERENCES "public"."themes"("id") ON DELETE set null ON UPDATE no action;