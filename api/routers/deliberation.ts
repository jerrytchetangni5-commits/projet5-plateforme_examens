import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { deliberation, notes, serieMatiere, candidat, session, serie, matiere } from "@db/schema";
import { eq, and, avg, count } from "drizzle-orm";

export const deliberationRouter = createRouter({
  listBySession: publicQuery
    .input(z.object({ idSession: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(deliberation)
        .where(eq(deliberation.idSession, input.idSession));
    }),

  getByCandidate: publicQuery
    .input(
      z.object({ idInscription: z.number(), idSession: z.number() })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select()
        .from(deliberation)
        .where(
          and(
            eq(deliberation.idInscription, input.idInscription),
            eq(deliberation.idSession, input.idSession)
          )
        )
        .limit(1);
      return results[0] || null;
    }),

  // Calculate weighted average and determine result
  calculate: publicQuery
    .input(
      z.object({
        idInscription: z.number(),
        idSession: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Get candidate's series
      const candidates = await db
        .select()
        .from(candidat)
        .where(eq(candidat.idInscription, input.idInscription))
        .limit(1);

      if (candidates.length === 0) {
        return { success: false, error: "Candidat non trouve" };
      }

      const candidate = candidates[0];
      const idSerie = candidate.idSerie;
      if (!idSerie) {
        return { success: false, error: "Serie non assignee" };
      }

      // Get all notes for this candidate
      const candidateNotes = await db
        .select()
        .from(notes)
        .where(
          and(
            eq(notes.idInscription, input.idInscription),
            eq(notes.idSession, input.idSession)
          )
        );

      if (candidateNotes.length === 0) {
        return { success: false, error: "Aucune note trouvee" };
      }

      // Get coefficients for this series
      const coefficients = await db
        .select()
        .from(serieMatiere)
        .where(eq(serieMatiere.idSerie, idSerie));

      // Calculate weighted average
      let totalPoints = 0;
      let totalCoefficients = 0;

      for (const note of candidateNotes) {
        const coef = coefficients.find(
          (c) => c.idMatiere === note.idMatiere
        );
        const coeffValue = coef?.coefficient || 1;
        totalPoints += (note.valeur || 0) * coeffValue;
        totalCoefficients += coeffValue;
      }

      const moyenne =
        totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;

      // Determine mention and result
      let mention = "";
      let resultat = "";

      if (moyenne >= 16) {
        mention = "Tres Bien";
        resultat = "Admis";
      } else if (moyenne >= 14) {
        mention = "Bien";
        resultat = "Admis";
      } else if (moyenne >= 12) {
        mention = "Assez Bien";
        resultat = "Admis";
      } else if (moyenne >= 10) {
        mention = "Passable";
        resultat = "Admis";
      } else if (moyenne >= 8) {
        mention = "Insuffisant";
        resultat = "Ajourne";
      } else {
        mention = "Faible";
        resultat = "Refuse";
      }

      // Save or update deliberation
      const existing = await db
        .select()
        .from(deliberation)
        .where(
          and(
            eq(deliberation.idInscription, input.idInscription),
            eq(deliberation.idSession, input.idSession)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(deliberation)
          .set({
            moyenneGenerale: moyenne,
            mention,
            resultat,
          })
          .where(
            and(
              eq(deliberation.idInscription, input.idInscription),
              eq(deliberation.idSession, input.idSession)
            )
          );
      } else {
        await db.insert(deliberation).values({
          idInscription: input.idInscription,
          idSession: input.idSession,
          moyenneGenerale: moyenne,
          mention,
          resultat,
        });
      }

      return {
        success: true,
        moyenne,
        mention,
        resultat,
      };
    }),

  // Run deliberation for all candidates in a session
  runSessionDeliberation: publicQuery
    .input(z.object({ idSession: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const allCandidates = await db
        .select()
        .from(candidat);

      let processed = 0;
      for (const candidate of allCandidates) {
        const candidateNotes = await db
          .select()
          .from(notes)
          .where(
            and(
              eq(notes.idInscription, candidate.idInscription),
              eq(notes.idSession, input.idSession)
            )
          );

        if (candidateNotes.length === 0) continue;

        const idSerie = candidate.idSerie;
        if (!idSerie) continue;

        const coefficients = await db
          .select()
          .from(serieMatiere)
          .where(eq(serieMatiere.idSerie, idSerie));

        let totalPoints = 0;
        let totalCoefficients = 0;

        for (const note of candidateNotes) {
          const coef = coefficients.find(
            (c) => c.idMatiere === note.idMatiere
          );
          const coeffValue = coef?.coefficient || 1;
          totalPoints += (note.valeur || 0) * coeffValue;
          totalCoefficients += coeffValue;
        }

        const moyenne =
          totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;

        let mention = "";
        let resultat = "";

        if (moyenne >= 16) {
          mention = "Tres Bien";
          resultat = "Admis";
        } else if (moyenne >= 14) {
          mention = "Bien";
          resultat = "Admis";
        } else if (moyenne >= 12) {
          mention = "Assez Bien";
          resultat = "Admis";
        } else if (moyenne >= 10) {
          mention = "Passable";
          resultat = "Admis";
        } else if (moyenne >= 8) {
          mention = "Insuffisant";
          resultat = "Ajourne";
        } else {
          mention = "Faible";
          resultat = "Refuse";
        }

        const existing = await db
          .select()
          .from(deliberation)
          .where(
            and(
              eq(deliberation.idInscription, candidate.idInscription),
              eq(deliberation.idSession, input.idSession)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(deliberation)
            .set({ moyenneGenerale: moyenne, mention, resultat })
            .where(
              and(
                eq(deliberation.idInscription, candidate.idInscription),
                eq(deliberation.idSession, input.idSession)
              )
            );
        } else {
          await db.insert(deliberation).values({
            idInscription: candidate.idInscription,
            idSession: input.idSession,
            moyenneGenerale: moyenne,
            mention,
            resultat,
          });
        }

        processed++;
      }

      return { success: true, processed };
    }),

  getStats: publicQuery
    .input(z.object({ idSession: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const all = await db
        .select()
        .from(deliberation)
        .where(eq(deliberation.idSession, input.idSession));

      const total = all.length;
      const admis = all.filter((d) => d.resultat === "Admis").length;
      const ajournes = all.filter((d) => d.resultat === "Ajourne").length;
      const refuses = all.filter((d) => d.resultat === "Refuse").length;

      const moyenneGenerale =
        total > 0
          ? all.reduce((sum, d) => sum + (d.moyenneGenerale || 0), 0) / total
          : 0;

      return { total, admis, ajournes, refuses, moyenneGenerale };
    }),

  // Consult results publicly
  consultResults: publicQuery
    .input(
      z.object({
        numeroTable: z.number(),
        idSession: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      // Find candidate by numero table in convocation
      const { convocation } = await import("@db/schema");
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

      if (convocations.length === 0) {
        return { found: false };
      }

      const idInscription = convocations[0].idInscription;

      // Get candidate info
      const candidates = await db
        .select()
        .from(candidat)
        .where(eq(candidat.idInscription, idInscription))
        .limit(1);

      if (candidates.length === 0) {
        return { found: false };
      }

      // Get serie
      const series = await db
        .select()
        .from(serie)
        .where(eq(serie.idSerie, candidates[0].idSerie!))
        .limit(1);

      // Get session
      const sessions = await db
        .select()
        .from(session)
        .where(eq(session.idSession, input.idSession))
        .limit(1);

      // Get deliberation
      const delibs = await db
        .select()
        .from(deliberation)
        .where(
          and(
            eq(deliberation.idInscription, idInscription),
            eq(deliberation.idSession, input.idSession)
          )
        )
        .limit(1);

      // Get notes with matiere names
      const candidateNotes = await db
        .select()
        .from(notes)
        .where(
          and(
            eq(notes.idInscription, idInscription),
            eq(notes.idSession, input.idSession)
          )
        );

      const notesWithMatiere = [];
      for (const note of candidateNotes) {
        const matieres = await db
          .select()
          .from(matiere)
          .where(eq(matiere.idMatiere, note.idMatiere))
          .limit(1);
        if (matieres.length > 0) {
          notesWithMatiere.push({
            ...note,
            libelleMatiere: matieres[0].libelleMatiere,
          });
        }
      }

      return {
        found: true,
        candidate: candidates[0],
        numeroTable: convocations[0].numeroTable,
        centre: convocations[0].centre,
        deliberation: delibs[0] || null,
        notes: notesWithMatiere,
        serie: series[0] || null,
        session: sessions[0] || null,
      };
    }),
});
