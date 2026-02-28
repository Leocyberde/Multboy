import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, requests, creditTransactions } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(user: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(users).values(user).returning();
  return result;
}

export async function updateUserCreditBalance(userId: number, newBalance: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ creditBalance: newBalance }).where(eq(users.id, userId));
}

export async function createRequest(request: typeof requests.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(requests).values(request).returning();
  return result;
}

export async function getRequestsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(requests).where(eq(requests.userId, userId));
}

export async function getPendingRequests() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(requests).where(eq(requests.status, "aguardando_resposta"));
}

export async function getRequestById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(requests).where(eq(requests.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateRequestStatus(id: number, status: string, quotedPrice?: string, estimatedDistance?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updates: Record<string, any> = { status };
  if (quotedPrice) updates.quotedPrice = quotedPrice;
  if (estimatedDistance) updates.estimatedDistance = estimatedDistance;
  await db.update(requests).set(updates).where(eq(requests.id, id));
}

export async function createCreditTransaction(transaction: typeof creditTransactions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(creditTransactions).values(transaction).returning();
}

export async function getCreditTransactionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(creditTransactions).where(eq(creditTransactions.userId, userId));
}

function generateFourDigitNumber(): string {
  return String(Math.floor(Math.random() * 10000)).padStart(4, '0');
}

export async function updateRequestWithOrderAndPickupCode(id: number, status: "aguardando_resposta" | "cotado" | "aceito" | "concluido" | "cancelado") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const orderNumber = generateFourDigitNumber();
  const pickupCode = generateFourDigitNumber();
  await db.update(requests).set({ 
    status, 
    orderNumber, 
    pickupCode 
  }).where(eq(requests.id, id));
  return { orderNumber, pickupCode };
}
