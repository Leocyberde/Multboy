import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "./_core/simpleAuth";

describe("Authentication", () => {
  describe("Password hashing", () => {
    it("should hash a password", async () => {
      const password = "test123";
      const hash = await hashPassword(password);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
    });

    it("should verify a correct password", async () => {
      const password = "test123";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const password = "test123";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword("wrongpassword", hash);
      expect(isValid).toBe(false);
    });
  });

  describe("JWT tokens", () => {
    it("should create a valid session token", async () => {
      const payload = { userId: 1, username: "testuser", role: "user" as const };
      const token = await createSessionToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    it("should verify a valid session token", async () => {
      const payload = { userId: 1, username: "testuser", role: "user" as const };
      const token = await createSessionToken(payload);
      const verified = await verifySessionToken(token);
      expect(verified).toBeDefined();
      expect(verified?.userId).toBe(1);
      expect(verified?.username).toBe("testuser");
      expect(verified?.role).toBe("user");
    });

    it("should reject an invalid token", async () => {
      const verified = await verifySessionToken("invalid.token.here");
      expect(verified).toBeNull();
    });
  });
});
