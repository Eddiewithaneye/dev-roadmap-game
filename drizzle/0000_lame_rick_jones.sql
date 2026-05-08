CREATE TABLE "test_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
