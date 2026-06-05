import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createRouter,
  protectedProcedure,
  adminProcedure,
} from "../middleware";
import { getDb } from "../queries/connection";
import { ecole, candidat, inscription } from "@db/schema";
import { eq, count, like } from "drizzle-orm";

export const ecoleRouter = createRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    if (ctx.user.role === "ecole") {
      return db.select().from(ecole).where(eq(ecole.idEcole, ctx.user.id));
    }
    return db.select().from(ecole);
  }),

  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(ecole)
        .where(like(ecole.nom, `%${input.query}%`));
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const results = await db
        .select()
        .from(ecole)
        .where(eq(ecole.idEcole, input.id))
        .limit(1);
      const school = results[0] || null;
      if (!school) return null;
      if (ctx.user.role === "ecole" && school.idEcole !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return school;
    }),

  create: adminProcedure
    .input(
      z.object({
        nom: z.string().min(2),
        ifu: z.string().optional(),
        departement: z.string().min(1),
        type: z.string().min(1),
        contact: z.string().optional(),
        email: z.string().email(),
        password: z.string().min(6),
        adresse: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(ecole).values({
        ...input,
        status: "active",
      });

      return { success: true };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        nom: z.string().optional(),
        ifu: z.string().optional(),
        departement: z.string().optional(),
        type: z.string().optional(),
        contact: z.string().optional(),
        email: z.string().optional(),
        adresse: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(ecole).set(data).where(eq(ecole.idEcole, id));
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(ecole).where(eq(ecole.idEcole, input.id));
      return { success: true };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    if (ctx.user.role === "ecole") {
      const totalEcoles = 1;
      const ecolesActives = await db
        .select({ count: count() })
        .from(ecole)
        .where(eq(ecole.idEcole, ctx.user.id), eq(ecole.status, "active"));
      const totalCandidats = await db
        .select({ count: count() })
        .from(candidat)
        .where(eq(candidat.idEcole, ctx.user.id));
      return {
        totalEcoles,
        ecolesActives: ecolesActives[0]?.count || 0,
        totalCandidats: totalCandidats[0]?.count || 0,
      };
    }

    const totalEcoles = await db.select({ count: count() }).from(ecole);
    const ecolesActives = await db
      .select({ count: count() })
      .from(ecole)
      .where(eq(ecole.status, "active"));
    const totalCandidats = await db.select({ count: count() }).from(candidat);
    return {
      totalEcoles: totalEcoles[0]?.count || 0,
      ecolesActives: ecolesActives[0]?.count || 0,
      totalCandidats: totalCandidats[0]?.count || 0,
    };
  }),

  // School inscription to session
  inscrireSession: protectedProcedure
    .input(
      z.object({
        idEcole: z.number(),
        idSession: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role === "ecole" && ctx.user.id !== input.idEcole) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = getDb();
      await db.insert(inscription).values({
        idEcole: input.idEcole,
        idSession: input.idSession,
        dateInscription: new Date(),
      });
      return { success: true };
    }),
});
