ALTER TYPE "public"."request_status" ADD VALUE 'preparo';--> statement-breakpoint
ALTER TYPE "public"."request_status" ADD VALUE 'pronto';--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "customerName" text;--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "customerWhatsapp" varchar(20);--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "observations" text;