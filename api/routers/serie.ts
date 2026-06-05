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
      // prevent duplicate series with same label and exam type
      const existing = await db
        .select()
        .from(serie)
        .where(
          and(
            eq(serie.libelleSerie, input.libelleSerie),
            eq(serie.typeExamen, input.typeExamen)
          )
        );
      if (existing.length > 0) {
        throw new Error(
          "Une série avec ce libellé et type d'examen existe déjà."
        );
      }
      const result = await db.insert(serie).values(input);
      const id = Number(
        (result as any).insertId ??
          (result as any).lastInsertRowid ??
          (result as any).id
      );
      if (Number.isNaN(id)) {
        throw new Error("Impossible de récupérer l'id de la série créée");
      }
      return { success: true, id };
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
      return {
        success: true,
        id: Number(
          (result as any).insertId ??
            (result as any).lastInsertRowid ??
            (result as any).id
        ),
      };
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
