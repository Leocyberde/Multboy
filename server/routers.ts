import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { notifyAdminNewRequest } from "./_core/notificationService";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  requests: router({
    createDelivery: protectedProcedure
      .input(z.object({
        pickupLocation: z.string(),
        deliveryLocation: z.string(),
        pickupCoordinates: z.string().optional(),
        deliveryCoordinates: z.string().optional(),
        customerName: z.string().optional(),
        customerWhatsapp: z.string().optional(),
        observations: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        await db.createRequest({
          userId: ctx.user.id,
          type: "delivery",
          pickupLocation: input.pickupLocation,
          deliveryLocation: input.deliveryLocation,
          pickupCoordinates: input.pickupCoordinates,
          deliveryCoordinates: input.deliveryCoordinates,
          customerName: input.customerName,
          customerWhatsapp: input.customerWhatsapp,
          observations: input.observations,
          status: "aguardando_resposta",
        });
        
        notifyAdminNewRequest(1, "delivery", input.pickupLocation, input.deliveryLocation).catch(err => console.error(err));
        
        return { success: true };
      }),

    createFrete: protectedProcedure
      .input(z.object({
        pickupLocation: z.string(),
        deliveryLocation: z.string(),
        description: z.string(),
        pickupCoordinates: z.string().optional(),
        deliveryCoordinates: z.string().optional(),
        customerName: z.string().optional(),
        customerWhatsapp: z.string().optional(),
        observations: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        await db.createRequest({
          userId: ctx.user.id,
          type: "frete",
          pickupLocation: input.pickupLocation,
          deliveryLocation: input.deliveryLocation,
          description: input.description,
          pickupCoordinates: input.pickupCoordinates,
          deliveryCoordinates: input.deliveryCoordinates,
          customerName: input.customerName,
          customerWhatsapp: input.customerWhatsapp,
          observations: input.observations,
          status: "aguardando_resposta",
        });
        
        notifyAdminNewRequest(1, "frete", input.pickupLocation, input.deliveryLocation).catch(err => console.error(err));
        
        return { success: true };
      }),

    getUserRequests: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return await db.getRequestsByUserId(ctx.user.id);
      }),

    getPending: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user?.role || ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return await db.getPendingRequests();
      }),

    getAccepted: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user?.role || ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const db_instance = await db.getDb();
        if (!db_instance) return [];
        const { requests } = await import("../drizzle/schema");
        const { eq, or, inArray } = await import("drizzle-orm");
        return await db_instance.select().from(requests).where(
          inArray(requests.status, ["aceito", "preparo", "pronto"])
        );
      }),

    updateRequestStatus: protectedProcedure
      .input(z.object({
        requestId: z.number(),
        status: z.enum(["preparo", "pronto", "concluido", "cancelado"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const request = await db.getRequestById(input.requestId);
        if (!request) throw new TRPCError({ code: "NOT_FOUND" });
        
        // Se não for admin, só pode atualizar se for o dono do pedido
        if (ctx.user.role !== "admin" && request.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        await db.updateRequestStatus(input.requestId, input.status);
        
        return { success: true };
      }),

    respondToRequest: protectedProcedure
      .input(z.object({
        requestId: z.number(),
        quotedPrice: z.string(),
        estimatedDistance: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.role || ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        await db.updateRequestStatus(
          input.requestId,
          "cotado",
          input.quotedPrice,
          input.estimatedDistance
        );
        
        return { success: true };
      }),

    acceptRequest: protectedProcedure
      .input(z.object({
        requestId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const request = await db.getRequestById(input.requestId);
        if (!request) throw new TRPCError({ code: "NOT_FOUND" });
        if (request.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
        if (!request.quotedPrice) throw new TRPCError({ code: "BAD_REQUEST" });
        
        const user = await db.getUserById(ctx.user.id);
        const currentBalance = parseFloat(user?.creditBalance as any || "0");
        const requestPrice = parseFloat(request.quotedPrice);
        
        if (currentBalance < requestPrice) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Saldo insuficiente" });
        }
        
        const newBalance = (currentBalance - requestPrice).toFixed(2);
        await db.updateUserCreditBalance(ctx.user.id, newBalance);
        
        await db.createCreditTransaction({
          userId: ctx.user.id,
          requestId: input.requestId,
          type: "debit",
          amount: request.quotedPrice,
          description: `Pagamento de ${request.type === "delivery" ? "delivery" : "frete"} - ID ${request.id}`,
        });
        
        const { orderNumber, pickupCode } = await db.updateRequestWithOrderAndPickupCode(input.requestId, "aceito");
        
        notifyAdminNewRequest(1, request.type, request.pickupLocation, request.deliveryLocation, orderNumber, pickupCode).catch(err => console.error(err));
        
        return { success: true, newBalance, orderNumber, pickupCode };
      }),

    rejectRequest: protectedProcedure
      .input(z.object({
        requestId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const request = await db.getRequestById(input.requestId);
        if (!request) throw new TRPCError({ code: "NOT_FOUND" });
        if (request.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
        
        await db.updateRequestStatus(input.requestId, "cancelado");
        
        return { success: true };
      }),
  }),

  credits: router({
    addCredits: protectedProcedure
      .input(z.object({
        amount: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const currentBalance = parseFloat(ctx.user.creditBalance as any);
        const newBalance = (currentBalance + parseFloat(input.amount)).toFixed(2);
        
        await db.updateUserCreditBalance(ctx.user.id, newBalance);
        await db.createCreditTransaction({
          userId: ctx.user.id,
          type: "purchase",
          amount: input.amount,
          description: "Compra de creditos via PIX",
        });
        
        return { success: true, newBalance };
      }),

    getBalance: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        const user = await db.getUserById(ctx.user.id);
        return { balance: user?.creditBalance || "0.00" };
      }),

    getTransactions: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return await db.getCreditTransactionsByUserId(ctx.user.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
