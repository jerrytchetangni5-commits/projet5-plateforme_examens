import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { notes, deliberation, candidat, serieMatiere, convocation } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const notesRouter = createRouter({
  listBySession: publicQuery
    .input(z.object({ idSession: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(notes)
        .where(eq(notes.idSession, input.idSession));
    }),

  listByCandidate: publicQuery
    .input(z.object({ idInscription: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(notes)
        .where(eq(notes.idInscription, input.idInscription));
    }),

  getByCentre: publicQuery
    .input(z.object({ centre: z.string(), idSession: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      // Get all candidates in this centre and session
      const convocations = await db
        .select()
        .from(convocation)
        .where(
          and(
            eq(convocation.centre, input.centre),
            eq(convocation.idSession, input.idSession)
          )
        );

      const results = [];
      for (const conv of convocations) {
        const candidateNotes = await db
          .select()
          .from(notes)
          .where(
            and(
              eq(notes.idInscription, conv.idInscription),
              eq(notes.idSession, input.idSession)
            )
          );

        const candidates = await db
          .select()
          .from(candidat)
          .where(eq(candidat.idInscription, conv.idInscription))
          .limit(1);

        if (candidates.length > 0) {
          results.push({
            candidate: candidates[0],
            numeroTable: conv.numeroTable,
            notes: candidateNotes,
          });
        }
      }
      return results;
    }),

  createOrUpdate: publicQuery
    .input(
      z.object({
        idInscription: z.number(),
        idSession: z.number(),
        idMatiere: z.number(),
        valeur: z.number().min(0).max(20),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(notes)
        .where(
          and(
            eq(notes.idInscription, input.idInscription),
            eq(notes.idSession, input.idSession),
            eq(notes.idMatiere, input.idMatiere)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(notes)
          .set({ valeur: input.valeur })
          .where(
            and(
              eq(notes.idInscription, input.idInscription),
              eq(notes.idSession, input.idSession),
              eq(notes.idMatiere, input.idMatiere)
            )
          );
      } else {
        await db.insert(notes).values(input);
      }
      return { success: true };
    }),

  delete: publicQuery
    .input(
      z.object({
        idInscription: z.number(),
        idSession: z.number(),
        idMatiere: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .delete(notes)
        .where(
          and(
            eq(notes.idInscription, input.idInscription),
            eq(notes.idSession, input.idSession),
            eq(notes.idMatiere, input.idMatiere)
          )
        );
      return { success: true };
    }),

  // Bulk grade entry
  bulkCreate: publicQuery
    .input(
      z.array(
        z.object({
          idInscription: z.number(),
          idSession: z.number(),
          idMatiere: z.number(),
          valeur: z.number().min(0).max(20),
        })
      )
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      for (const note of input) {
        const existing = await db
          .select()
          .from(notes)
          .where(
            and(
              eq(notes.idInscription, note.idInscription),
              eq(notes.idSession, note.idSession),
              eq(notes.idMatiere, note.idMatiere)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(notes)
            .set({ valeur: note.valeur })
            .where(
              and(
                eq(notes.idInscription, note.idInscription),
                eq(notes.idSession, note.idSession),
                eq(notes.idMatiere, note.idMatiere)
              )
            );
        } else {
          await db.insert(notes).values(note);
        }
      }
      return { success: true };
    }),
});