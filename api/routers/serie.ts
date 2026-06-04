import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { serie, matiere, serieMatiere } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const serieRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(serie);
  }),

  listByType: publicQuery
    .input(z.object({ typeExamen: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(serie)
        .where(eq(serie.typeExamen, input.typeExamen));
    }),

  create: publicQuery
    .input(
      z.object({
        libelleSerie: z.string().min(1),
        typeExamen: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(serie).values(input);
      return { success: true, id: Number(result[0].insertId) };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(serie).where(eq(serie.idSerie, input.id));
      return { success: true };
    }),
});

export const matiereRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(matiere);
  }),

  create: publicQuery
    .input(
      z.object({
        libelleMatiere: z.string().min(1),
        code: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(matiere).values(input);
      return { success: true, id: Number(result[0].insertId) };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(matiere).where(eq(matiere.idMatiere, input.id));
      return { success: true };
    }),
});

export const serieMatiereRouter = createRouter({
  listBySerie: publicQuery
    .input(z.object({ idSerie: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(serieMatiere)
        .where(eq(serieMatiere.idSerie, input.idSerie));
    }),

  assign: publicQuery
    .input(
      z.object({
        idSerie: z.number(),
        idMatiere: z.number(),
        coefficient: z.number().min(1).max(20),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(serieMatiere).values(input);
      return { success: true };
    }),

  remove: publicQuery
    .input(
      z.object({
        idSerie: z.number(),
        idMatiere: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .delete(serieMatiere)
        .where(
          and(
            eq(serieMatiere.idSerie, input.idSerie),
            eq(serieMatiere.idMatiere, input.idMatiere)
          )
        );
      return { success: true };
    }),
});
