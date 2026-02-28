import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, requests, creditTransactions, Request, CreditTransaction } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// User queries
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
  const result = await db.insert(users).values(user);
  return result;
}

export async function updateUserCreditBalance(userId: number, newBalance: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ creditBalance: newBalance }).where(eq(users.id, userId));
}

// Request queries
export async function createRequest(request: typeof requests.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(requests).values(request);
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

// Credit transaction queries
export async function createCreditTransaction(transaction: typeof creditTransactions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(creditTransactions).values(transaction);
}

export async function getCreditTransactionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(creditTransactions).where(eq(creditTransactions.userId, userId));
}


// Gerar número aleatório de 4 dígitos
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
