CREATE TABLE "player_progress" (
	"user_id" text PRIMARY KEY NOT NULL,
	"cred" integer DEFAULT 0 NOT NULL,
	"unlocked_languages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"unlocked_concepts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"permanent_upgrade_levels" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "player_progress" ADD CONSTRAINT "player_progress_user_id_player_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."player_profiles"("user_id") ON DELETE cascade ON UPDATE no action;