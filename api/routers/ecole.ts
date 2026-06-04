import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { ecole, candidat, inscription } from "@db/schema";
import { eq, count, like } from "drizzle-orm";

export const ecoleRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(ecole);
  }),

  search: publicQuery
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(ecole)
        .where(like(ecole.nom, `%${input.query}%`));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select()
        .from(ecole)
        .where(eq(ecole.idEcole, input.id))
        .limit(1);
      return results[0] || null;
    }),

  create: publicQuery
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

  update: publicQuery
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

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(ecole).where(eq(ecole.idEcole, input.id));
      return { success: true };
    }),

  getStats: publicQuery.query(async () => {
    const db = getDb();
    const totalEcoles = await db.select({ count: count() }).from(ecole);
    const ecolesActives = await db
      .select({ count: count() })
      .from(ecole)
      .where(eq(ecole.status, "active"));
    const totalCandidats = await db
      .select({ count: count() })
      .from(candidat);
    return {
      totalEcoles: totalEcoles[0]?.count || 0,
      ecolesActives: ecolesActives[0]?.count || 0,
      totalCandidats: totalCandidats[0]?.count || 0,
    };
  }),

  // School inscription to session
  inscrireSession: publicQuery
    .input(
      z.object({
        idEcole: z.number(),
        idSession: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(inscription).values({
        idEcole: input.idEcole,
        idSession: input.idSession,
        dateInscription: new Date(),
      });
      return { success: true };
    }),
});
