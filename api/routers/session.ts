import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { session } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const sessionRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(session).orderBy(desc(session.annee));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select()
        .from(session)
        .where(eq(session.idSession, input.id))
        .limit(1);
      return results[0] || null;
    }),

  create: publicQuery
    .input(
      z.object({
        annee: z.number().min(2000).max(2100),
        libelleSession: z.string().min(1),
        dateOuverture: z.string().optional(),
        dateFermeture: z.string().optional(),
        statut: z.string().default("ouverte"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(session).values({
        annee: input.annee,
        libelleSession: input.libelleSession,
        dateOuverture: input.dateOuverture
          ? new Date(input.dateOuverture)
          : null,
        dateFermeture: input.dateFermeture
          ? new Date(input.dateFermeture)
          : null,
        statut: input.statut,
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        annee: z.number().optional(),
        libelleSession: z.string().optional(),
        dateOuverture: z.string().optional(),
        dateFermeture: z.string().optional(),
        statut: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.annee !== undefined) updateData.annee = data.annee;
      if (data.libelleSession !== undefined)
        updateData.libelleSession = data.libelleSession;
      if (data.dateOuverture !== undefined)
        updateData.dateOuverture = data.dateOuverture
          ? new Date(data.dateOuverture)
          : null;
      if (data.dateFermeture !== undefined)
        updateData.dateFermeture = data.dateFermeture
          ? new Date(data.dateFermeture)
          : null;
      if (data.statut !== undefined) updateData.statut = data.statut;

      await db.update(session).set(updateData).where(eq(session.idSession, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(session).where(eq(session.idSession, input.id));
      return { success: true };
    }),

  toggleStatus: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const sessions = await db
        .select()
        .from(session)
        .where(eq(session.idSession, input.id))
        .limit(1);
      if (sessions.length === 0) return { success: false };

      const newStatus =
        sessions[0].statut === "ouverte" ? "fermee" : "ouverte";
      await db
        .update(session)
        .set({ statut: newStatus })
        .where(eq(session.idSession, input.id));
      return { success: true, newStatus };
    }),
});
