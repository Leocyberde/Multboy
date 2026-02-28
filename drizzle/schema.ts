import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Username for simple auth */
  username: varchar("username", { length: 255 }).notNull().unique(),
  /** Hashed password */
  passwordHash: text("passwordHash").notNull(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  creditBalance: decimal("creditBalance", { precision: 10, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Solicitações de delivery e frete
 */
export const requests = mysqlTable("requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["delivery", "frete"]).notNull(),
  pickupLocation: text("pickupLocation").notNull(),
  deliveryLocation: text("deliveryLocation").notNull(),
  pickupCoordinates: text("pickupCoordinates"), // JSON: {lat, lng}
  deliveryCoordinates: text("deliveryCoordinates"), // JSON: {lat, lng}
  description: text("description"),
  status: mysqlEnum("status", ["aguardando_resposta", "cotado", "aceito", "concluido", "cancelado"]).default("aguardando_resposta").notNull(),
  quotedPrice: decimal("quotedPrice", { precision: 10, scale: 2 }),
  estimatedDistance: decimal("estimatedDistance", { precision: 10, scale: 2 }), // em km
  clientAccepted: mysqlEnum("clientAccepted", ["pending", "accepted", "rejected"]).default("pending"),
  orderNumber: varchar("orderNumber", { length: 10 }), // 4 dígitos do número do pedido
  pickupCode: varchar("pickupCode", { length: 10 }), // 4 dígitos do código de coleta
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Request = typeof requests.$inferSelect;
export type InsertRequest = typeof requests.$inferInsert;

/**
 * Histórico de transações de créditos
 */
export const creditTransactions = mysqlTable("creditTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  requestId: int("requestId"),
  type: mysqlEnum("type", ["purchase", "debit"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = typeof creditTransactions.$inferInsert;