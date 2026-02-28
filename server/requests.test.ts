import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserContext(role: "admin" | "user" = "user"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    username: "testuser",
    email: "test@example.com",
    name: "Test User",
    role,
    creditBalance: "100.00",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Requests Router", () => {
  describe("createDelivery", () => {
    it("should create a delivery request for authenticated user", async () => {
      const { ctx } = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.requests.createDelivery({
        pickupLocation: "Rua A, 123",
        deliveryLocation: "Rua B, 456",
      });

      expect(result).toEqual({ success: true });
    });

    it("should reject unauthenticated users", async () => {
      const ctx: TrpcContext = {
        user: null,
        req: { protocol: "https", headers: {} } as TrpcContext["req"],
        res: { clearCookie: () => {} } as TrpcContext["res"],
      };
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.requests.createDelivery({
          pickupLocation: "Rua A, 123",
          deliveryLocation: "Rua B, 456",
        });
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });
  });

  describe("createFrete", () => {
    it("should create a frete request for authenticated user", async () => {
      const { ctx } = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.requests.createFrete({
        pickupLocation: "Rua A, 123",
        deliveryLocation: "Rua B, 456",
        description: "Ir no chaveiro",
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe("getPending", () => {
    it("should return pending requests for admin", async () => {
      const { ctx } = createUserContext("admin");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.requests.getPending();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should reject non-admin users", async () => {
      const { ctx } = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.requests.getPending();
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("respondToRequest", () => {
    it("should allow admin to respond to request", async () => {
      const { ctx } = createUserContext("admin");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.requests.respondToRequest({
        requestId: 1,
        quotedPrice: "50.00",
        estimatedDistance: "5.5",
      });

      expect(result).toEqual({ success: true });
    });

    it("should reject non-admin users from responding", async () => {
      const { ctx } = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.requests.respondToRequest({
          requestId: 1,
          quotedPrice: "50.00",
        });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });
});
