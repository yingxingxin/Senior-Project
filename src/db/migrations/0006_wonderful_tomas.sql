ALTER TABLE "account" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::varchar(255);--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::varchar(255);--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::varchar(255);