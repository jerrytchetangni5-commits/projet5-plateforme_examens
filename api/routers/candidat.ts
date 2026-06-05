import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createRouter,
  protectedProcedure,
  adminProcedure,
} from "../middleware";
import { getDb } from "../queries/connection";
import { candidat, convocation, ecole } from "@db/schema";
import { eq, and, count, inArray } from "drizzle-orm";

export const candidatRouter = createRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    if (ctx.user.role === "ecole") {
      return db
        .select()
        .from(candidat)
        .where(eq(candidat.idEcole, ctx.user.id));
    }
    return db.select().from(candidat);
  }),

  listByEcole: protectedProcedure
    .input(z.object({ idEcole: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role === "ecole" && ctx.user.id !== input.idEcole) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = getDb();
      return db
        .select()
        .from(candidat)
        .where(eq(candidat.idEcole, input.idEcole));
    }),

  listBySerie: protectedProcedure
    .input(z.object({ idSerie: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      let query = db
        .select()
        .from(candidat)
        .where(eq(candidat.idSerie, input.idSerie));
      if (ctx.user.role === "ecole") {
        query = query.where(eq(candidat.idEcole, ctx.user.id));
      }
      return query;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const results = await db
        .select()
        .from(candidat)
        .where(eq(candidat.idInscription, input.id))
        .limit(1);
      const candidate = results[0] || null;
      if (!candidate) return null;
      if (ctx.user.role === "ecole" && candidate.idEcole !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return candidate;
    }),

  searchByNumeroTable: protectedProcedure
    .input(z.object({ numeroTable: z.number(), idSession: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const convocations = await db
        .select()
        .from(convocation)
        .where(
          and(
            eq(convocation.numeroTable, input.numeroTable),
            eq(convocation.idSession, input.idSession)
          )
        )
        .limit(1);

      if (convocations.length === 0) return null;

      const candidates = await db
        .select()
        .from(candidat)
        .where(eq(candidat.idInscription, convocations[0].idInscription))
        .limit(1);

      const candidate = candidates[0] || null;
      if (!candidate) return null;
      if (ctx.user.role === "ecole" && candidate.idEcole !== ctx.user.id) {
        return null;
      }
      return candidate;
    }),

  create: protectedProcedure
    .input(
      z.object({
        nom: z.string().min(1),
        prenom: z.string().min(1),
        sexe: z.string().optional(),
        dateNaissance: z.string().optional(),
        idSerie: z.number().optional(),
        idEcole: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const isEcoleUser = ctx.user.role === "ecole";
      const idEcole = isEcoleUser ? ctx.user.id : input.idEcole;

      if (!isEcoleUser) {
        if (
          !input.sexe ||
          !input.dateNaissance ||
          !input.idSerie ||
          !input.idEcole
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Tous les champs sont obligatoires pour la creation d'un candidat par un administrateur.",
          });
        }

        const schools = await db
          .select()
          .from(ecole)
          .where(eq(ecole.idEcole, input.idEcole))
          .limit(1);

        if (schools.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "L'ecole saisie n'existe pas.",
          });
        }
      }

      await db.insert(candidat).values({
        nom: input.nom,
        prenom: input.prenom,
        sexe: input.sexe,
        dateNaissance: input.dateNaissance
          ? new Date(input.dateNaissance)
          : null,
        idSerie: input.idSerie,
        idEcole,
      });

      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        nom: z.string().optional(),
        prenom: z.string().optional(),
        sexe: z.string().optional(),
        dateNaissance: z.string().optional(),
        idSerie: z.number().optional(),
        idEcole: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(candidat)
        .where(eq(candidat.idInscription, input.id))
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const candidate = existing[0];
      if (ctx.user.role === "ecole" && candidate.idEcole !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      if (
        ctx.user.role === "ecole" &&
        input.idEcole !== undefined &&
        input.idEcole !== ctx.user.id
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.nom) updateData.nom = data.nom;
      if (data.prenom) updateData.prenom = data.prenom;
      if (data.sexe) updateData.sexe = data.sexe;
      if (data.dateNaissance)
        updateData.dateNaissance = new Date(data.dateNaissance);
      if (data.idSerie !== undefined) updateData.idSerie = data.idSerie;
      if (data.idEcole !== undefined) updateData.idEcole = data.idEcole;

      await db
        .update(candidat)
        .set(updateData)
        .where(eq(candidat.idInscription, id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(candidat)
        .where(eq(candidat.idInscription, input.id))
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (ctx.user.role === "ecole" && existing[0].idEcole !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db.delete(candidat).where(eq(candidat.idInscription, input.id));
      return { success: true };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const filter =
      ctx.user.role === "ecole" ? eq(candidat.idEcole, ctx.user.id) : undefined;

    const total = await db
      .select({ count: count() })
      .from(candidat)
      .where(filter ?? (true as any));
    const hommes = await db
      .select({ count: count() })
      .from(candidat)
      .where(filter ?? (true as any))
      .where(eq(candidat.sexe, "M"));
    const femmes = await db
      .select({ count: count() })
      .from(candidat)
      .where(filter ?? (true as any))
      .where(eq(candidat.sexe, "F"));
    return {
      total: total[0]?.count || 0,
      hommes: hommes[0]?.count || 0,
      femmes: femmes[0]?.count || 0,
    };
  }),
});
