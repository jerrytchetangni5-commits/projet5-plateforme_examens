import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { convocation, candidat, centreExamen } from "@db/schema";
import { eq, and, count } from "drizzle-orm";

export const convocationRouter = createRouter({
  listBySession: publicQuery
    .input(z.object({ idSession: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(convocation)
        .where(eq(convocation.idSession, input.idSession));
    }),

  getByCandidate: publicQuery
    .input(
      z.object({ idInscription: z.number(), idSession: z.number() })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select()
        .from(convocation)
        .where(
          and(
            eq(convocation.idInscription, input.idInscription),
            eq(convocation.idSession, input.idSession)
          )
        )
        .limit(1);
      return results[0] || null;
    }),

  create: publicQuery
    .input(
      z.object({
        idSession: z.number(),
        idInscription: z.number(),
        numeroTable: z.number(),
        centre: z.string().min(1),
        salle: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(convocation).values(input);
      return { success: true };
    }),

  update: publicQuery
    .input(
      z.object({
        idSession: z.number(),
        idInscription: z.number(),
        numeroTable: z.number().optional(),
        centre: z.string().optional(),
        salle: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { idSession, idInscription, ...data } = input;
      await db
        .update(convocation)
        .set(data)
        .where(
          and(
            eq(convocation.idSession, idSession),
            eq(convocation.idInscription, idInscription)
          )
        );
      return { success: true };
    }),

  delete: publicQuery
    .input(
      z.object({
        idSession: z.number(),
        idInscription: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .delete(convocation)
        .where(
          and(
            eq(convocation.idSession, input.idSession),
            eq(convocation.idInscription, input.idInscription)
          )
        );
      return { success: true };
    }),

  // Generate table numbers for all candidates in a session
  generateTableNumbers: publicQuery
    .input(
      z.object({
        idSession: z.number(),
        centre: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const candidates = await db.select().from(candidat);

      let tableNum = 1;
      for (const candidate of candidates) {
        const existing = await db
          .select()
          .from(convocation)
          .where(
            and(
              eq(convocation.idInscription, candidate.idInscription),
              eq(convocation.idSession, input.idSession)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          // Update existing
          await db
            .update(convocation)
            .set({
              numeroTable: tableNum,
              centre: input.centre,
            })
            .where(
              and(
                eq(convocation.idInscription, candidate.idInscription),
                eq(convocation.idSession, input.idSession)
              )
            );
        } else {
          // Create new
          await db.insert(convocation).values({
            idSession: input.idSession,
            idInscription: candidate.idInscription,
            numeroTable: tableNum,
            centre: input.centre,
          });
        }

        tableNum++;
      }
      const convs = await db.select().from(convocation);
      console.log("CONVOCATION :", convs);
      return { success: true, count: candidates.length };
    }),

  // List exam centers
  listCentres: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(centreExamen);
  }),

  createCentre: publicQuery
    .input(
      z.object({
        nom: z.string().min(1),
        ville: z.string().optional(),
        departement: z.string().optional(),
        capacite: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(centreExamen).values(input);
      return { success: true, id: Number(result[0].insertId) };
    }),
});
