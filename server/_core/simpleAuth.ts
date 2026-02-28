import { COOKIE_NAME } from "@shared/const";
import type { Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import * as db from "../db";
import { ENV } from "./env";
import { getSessionCookieOptions } from "./cookies";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(ENV.jwtSecret || "your-secret-key");

export type SessionPayload = {
  userId: number;
  username: string;
  role: "admin" | "user";
};

/**
 * Hash a password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a JWT session token
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
  return token;
}

/**
 * Verify and decode a JWT session token
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Authenticate a request by reading the session cookie
 */
export async function authenticateRequest(req: Request) {
  const cookies = req.headers.cookie || "";
  const cookieObj = Object.fromEntries(
    cookies.split("; ").map((c) => {
      const [key, value] = c.split("=");
      return [key, decodeURIComponent(value || "")];
    })
  );

  const sessionToken = cookieObj[COOKIE_NAME];
  if (!sessionToken) {
    return null;
  }

  const payload = await verifySessionToken(sessionToken);
  if (!payload) {
    return null;
  }

  const user = await db.getUserById(payload.userId);
  return user || null;
}

/**
 * Set session cookie on response
 */
export function setSessionCookie(
  res: Response,
  req: Request,
  token: string
): void {
  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(res: Response, req: Request): void {
  const cookieOptions = getSessionCookieOptions(req);
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
}

/**
 * Login with username and password
 */
export async function loginUser(username: string, password: string) {
  const user = await db.getUserByUsername(username);
  if (!user) {
    throw new Error("User not found");
  }

  const passwordMatch = await verifyPassword(password, user.passwordHash);
  if (!passwordMatch) {
    throw new Error("Invalid password");
  }

  const token = await createSessionToken({
    userId: user.id,
    username: user.username,
    role: user.role,
  });

  return { user, token };
}
