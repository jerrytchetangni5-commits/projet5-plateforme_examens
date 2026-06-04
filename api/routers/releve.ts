import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { releve, notes, deliberation, candidat, matiere, serieMatiere, convocation, session, serie } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const releveRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(releve);
  }),

  getByCandidate: publicQuery
    .input(
      z.object({ idInscription: z.number(), idSession: z.number() })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select()
        .from(releve)
        .where(
          and(
            eq(releve.idInscription, input.idInscription),
            eq(releve.idSession, input.idSession)
          )
        )
        .limit(1);
      return results[0] || null;
    }),

  // Generate complete transcript data
  generateTranscript: publicQuery
    .input(
      z.object({
        idInscription: z.number(),
        idSession: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();

      // Get candidate
      const candidates = await db
        .select()
        .from(candidat)
        .where(eq(candidat.idInscription, input.idInscription))
        .limit(1);

      if (candidates.length === 0) {
        return { found: false };
      }

      const candidate = candidates[0];

      // Get session info
      const sessions = await db
        .select()
        .from(session)
        .where(eq(session.idSession, input.idSession))
        .limit(1);

      // Get serie info
      const series = candidate.idSerie
        ? await db
            .select()
            .from(serie)
            .where(eq(serie.idSerie, candidate.idSerie))
            .limit(1)
        : [];

      // Get convocation
      const convocations = await db
        .select()
        .from(convocation)
        .where(
          and(
            eq(convocation.idInscription, input.idInscription),
            eq(convocation.idSession, input.idSession)
          )
        )
        .limit(1);

      // Get notes with matiere details
      const candidateNotes = await db
        .select()
        .from(notes)
        .where(
          and(
            eq(notes.idInscription, input.idInscription),
            eq(notes.idSession, input.idSession)
          )
        );

      const notesWithDetails = [];
      for (const note of candidateNotes) {
        const matieres = await db
          .select()
          .from(matiere)
          .where(eq(matiere.idMatiere, note.idMatiere))
          .limit(1);

        const coefficients = candidate.idSerie
          ? await db
              .select()
              .from(serieMatiere)
              .where(
                and(
                  eq(serieMatiere.idSerie, candidate.idSerie),
                  eq(serieMatiere.idMatiere, note.idMatiere)
                )
              )
              .limit(1)
          : [];

        if (matieres.length > 0) {
          notesWithDetails.push({
            idMatiere: note.idMatiere,
            libelleMatiere: matieres[0].libelleMatiere,
            note: note.valeur,
            coefficient: coefficients[0]?.coefficient || 1,
            total: (note.valeur || 0) * (coefficients[0]?.coefficient || 1),
          });
        }
      }

      // Get deliberation
      const delibs = await db
        .select()
        .from(deliberation)
        .where(
          and(
            eq(deliberation.idInscription, input.idInscription),
            eq(deliberation.idSession, input.idSession)
          )
        )
        .limit(1);

      return {
        found: true,
        candidate,
        session: sessions[0] || null,
        serie: series[0] || null,
        convocation: convocations[0] || null,
        notes: notesWithDetails,
        deliberation: delibs[0] || null,
        totalPoints: notesWithDetails.reduce((s, n) => s + n.total, 0),
        totalCoefficients: notesWithDetails.reduce((s, n) => s + n.coefficient, 0),
      };
    }),

  create: publicQuery
    .input(
      z.object({
        idInscription: z.number(),
        idSession: z.number(),
        moyenne: z.number(),
        mention: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(releve).values(input);
      return { success: true, id: Number(result[0].insertId) };
    }),
});
