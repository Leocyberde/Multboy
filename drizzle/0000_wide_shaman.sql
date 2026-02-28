CREATE TYPE "public"."client_accepted" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."credit_transaction_type" AS ENUM('purchase', 'debit');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('aguardando_resposta', 'cotado', 'aceito', 'concluido', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."request_type" AS ENUM('delivery', 'frete');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "creditTransactions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "creditTransactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"requestId" integer,
	"type" "credit_transaction_type" NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "requests" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "requests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"type" "request_type" NOT NULL,
	"pickupLocation" text NOT NULL,
	"deliveryLocation" text NOT NULL,
	"pickupCoordinates" text,
	"deliveryCoordinates" text,
	"description" text,
	"status" "request_status" DEFAULT 'aguardando_resposta' NOT NULL,
	"quotedPrice" numeric(10, 2),
	"estimatedDistance" numeric(10, 2),
	"clientAccepted" "client_accepted" DEFAULT 'pending',
	"orderNumber" varchar(10),
	"pickupCode" varchar(10),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"username" varchar(255) NOT NULL,
	"passwordHash" text NOT NULL,
	"name" text,
	"email" varchar(320),
	"role" "role" DEFAULT 'user' NOT NULL,
	"creditBalance" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
