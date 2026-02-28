import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import {
  createSessionToken,
  hashPassword,
  loginUser,
  setSessionCookie,
  clearSessionCookie,
} from "./simpleAuth";
import { COOKIE_NAME } from "@shared/const";

export function registerSimpleAuthRoutes(app: Express) {
  /**
   * POST /api/auth/login
   * Login with username and password
   */
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: "Username and password are required" });
        return;
      }

      const { user, token } = await loginUser(username, password);
      setSessionCookie(res, req, token);

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          creditBalance: user.creditBalance,
        },
      });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  /**
   * POST /api/auth/register
   * Register a new user
   */
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password, name, email } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: "Username and password are required" });
        return;
      }

      // Check if user already exists
      const existingUser = await db.getUserByUsername(username);
      if (existingUser) {
        res.status(409).json({ error: "Username already exists" });
        return;
      }

      // Hash password and create user
      const passwordHash = await hashPassword(password);
      const result = await db.createUser({
        username,
        passwordHash,
        name: name || null,
        email: email || null,
        role: "user",
        creditBalance: "0.00",
      });

      const user = await db.getUserByUsername(username);
      if (!user) {
        res.status(500).json({ error: "Failed to create user" });
        return;
      }

      const token = await createSessionToken({
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      setSessionCookie(res, req, token);

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          creditBalance: user.creditBalance,
        },
      });
    } catch (error) {
      console.error("[Auth] Registration failed", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  /**
   * POST /api/auth/logout
   * Logout user
   */
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    try {
      clearSessionCookie(res, req);
      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Logout failed", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });
}
