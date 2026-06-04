import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { candidat, convocation } from "@db/schema";
import { eq, and, count } from "drizzle-orm";

export const candidatRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(candidat);
  }),

  listByEcole: publicQuery
    .input(z.object({ idEcole: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(candidat)
        .where(eq(candidat.idEcole, input.idEcole));
    }),

  listBySerie: publicQuery
    .input(z.object({ idSerie: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(candidat)
        .where(eq(candidat.idSerie, input.idSerie));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select()
        .from(candidat)
        .where(eq(candidat.idInscription, input.id))
        .limit(1);
      return results[0] || null;
    }),

  searchByNumeroTable: publicQuery
    .input(z.object({ numeroTable: z.number(), idSession: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      // Search by numero_table in convocation
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
        .where(
          eq(candidat.idInscription, convocations[0].idInscription)
        )
        .limit(1);

      return candidates[0] || null;
    }),

  create: publicQuery
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
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(candidat).values({
        nom: input.nom,
        prenom: input.prenom,
        sexe: input.sexe,
        dateNaissance: input.dateNaissance
          ? new Date(input.dateNaissance)
          : null,
        idSerie: input.idSerie,
        idEcole: input.idEcole,
      });

      return { success: true };
    }),

  update: publicQuery
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
    .mutation(async ({ input }) => {
      const db = getDb();
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

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(candidat).where(eq(candidat.idInscription, input.id));
      return { success: true };
    }),

  getStats: publicQuery.query(async () => {
    const db = getDb();
    const total = await db.select({ count: count() }).from(candidat);
    const hommes = await db
      .select({ count: count() })
      .from(candidat)
      .where(eq(candidat.sexe, "M"));
    const femmes = await db
      .select({ count: count() })
      .from(candidat)
      .where(eq(candidat.sexe, "F"));
    return {
      total: total[0]?.count || 0,
      hommes: hommes[0]?.count || 0,
      femmes: femmes[0]?.count || 0,
    };
  }),
});
