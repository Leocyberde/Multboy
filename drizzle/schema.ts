import { decimal, integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const requestTypeEnum = pgEnum("request_type", ["delivery", "frete"]);
export const requestStatusEnum = pgEnum("request_status", ["aguardando_resposta", "cotado", "aceito", "concluido", "cancelado", "preparo", "pronto"]);
export const clientAcceptedEnum = pgEnum("client_accepted", ["pending", "accepted", "rejected"]);
export const creditTransactionTypeEnum = pgEnum("credit_transaction_type", ["purchase", "debit"]);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  role: roleEnum("role").default("user").notNull(),
  creditBalance: decimal("creditBalance", { precision: 10, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Solicitações de delivery e frete
 */
export const requests = pgTable("requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  type: requestTypeEnum("type").notNull(),
  pickupLocation: text("pickupLocation").notNull(),
  deliveryLocation: text("deliveryLocation").notNull(),
  pickupCoordinates: text("pickupCoordinates"),
  deliveryCoordinates: text("deliveryCoordinates"),
  description: text("description"),
  customerName: text("customerName"),
  customerWhatsapp: varchar("customerWhatsapp", { length: 20 }),
  observations: text("observations"),
  status: requestStatusEnum("status").default("aguardando_resposta").notNull(),
  quotedPrice: decimal("quotedPrice", { precision: 10, scale: 2 }),
  estimatedDistance: decimal("estimatedDistance", { precision: 10, scale: 2 }),
  clientAccepted: clientAcceptedEnum("clientAccepted").default("pending"),
  orderNumber: varchar("orderNumber", { length: 10 }),
  pickupCode: varchar("pickupCode", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Request = typeof requests.$inferSelect;
export type InsertRequest = typeof requests.$inferInsert;

/**
 * Histórico de transações de créditos
 */
export const creditTransactions = pgTable("creditTransactions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  requestId: integer("requestId"),
  type: creditTransactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = typeof creditTransactions.$inferInsert;
