import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createRouter,
  protectedProcedure,
  secretaireOrAdminProcedure,
} from "../middleware";
import { getDb } from "../queries/connection";
import {
  deliberation,
  notes,
  serieMatiere,
  candidat,
  session,
  serie,
  matiere,
} from "@db/schema";
import { eq, and, inArray } from "drizzle-orm";

export const deliberationRouter = createRouter({
  listBySession: protectedProcedure
    .input(z.object({ idSession: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      if (ctx.user.role === "ecole") {
        const candidates = await db
          .select({ idInscription: candidat.idInscription })
          .from(candidat)
          .where(eq(candidat.idEcole, ctx.user.id));
        const ids = candidates.map(c => c.idInscription);
        if (ids.length === 0) return [];
        return db
          .select()
          .from(deliberation)
          .where(
            and(
              eq(deliberation.idSession, input.idSession),
              inArray(deliberation.idInscription, ids)
            )
          );
      }
      return db
        .select()
        .from(deliberation)
        .where(eq(deliberation.idSession, input.idSession));
    }),

  getByCandidate: protectedProcedure
    .input(z.object({ idInscription: z.number(), idSession: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      if (ctx.user.role === "ecole") {
        const candidates = await db
          .select()
          .from(candidat)
          .where(eq(candidat.idInscription, input.idInscription))
          .limit(1);
        if (candidates.length === 0 || candidates[0].idEcole !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }
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
  calculate: secretaireOrAdminProcedure
    .input(
      z.object({
        idInscription: z.number(),
        idSession: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

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

      const coefficients = await db
        .select()
        .from(serieMatiere)
        .where(eq(serieMatiere.idSerie, idSerie));

      let totalPoints = 0;
      let totalCoefficients = 0;

      for (const note of candidateNotes) {
        const coef = coefficients.find(c => c.idMatiere === note.idMatiere);
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
            eq(deliberation.idInscription, input.idInscription),
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
  runSessionDeliberation: secretaireOrAdminProcedure
    .input(z.object({ idSession: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const allCandidates = await db.select().from(candidat);

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
          const coef = coefficients.find(c => c.idMatiere === note.idMatiere);
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

  getStats: protectedProcedure
    .input(z.object({ idSession: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      if (ctx.user.role === "ecole") {
        const candidates = await db
          .select({ idInscription: candidat.idInscription })
          .from(candidat)
          .where(eq(candidat.idEcole, ctx.user.id));
        const ids = candidates.map(c => c.idInscription);
        if (ids.length === 0) {
          return {
            total: 0,
            admis: 0,
            ajournes: 0,
            refuses: 0,
            moyenneGenerale: 0,
          };
        }
        const all = await db
          .select()
          .from(deliberation)
          .where(
            and(
              eq(deliberation.idSession, input.idSession),
              inArray(deliberation.idInscription, ids)
            )
          );
        const total = all.length;
        const admis = all.filter(d => d.resultat === "Admis").length;
        const ajournes = all.filter(d => d.resultat === "Ajourne").length;
        const refuses = all.filter(d => d.resultat === "Refuse").length;
        const moyenneGenerale =
          total > 0
            ? all.reduce((sum, d) => sum + (d.moyenneGenerale || 0), 0) / total
            : 0;
        return { total, admis, ajournes, refuses, moyenneGenerale };
      }

      const all = await db
        .select()
        .from(deliberation)
        .where(eq(deliberation.idSession, input.idSession));
      const total = all.length;
      const admis = all.filter(d => d.resultat === "Admis").length;
      const ajournes = all.filter(d => d.resultat === "Ajourne").length;
      const refuses = all.filter(d => d.resultat === "Refuse").length;
      const moyenneGenerale =
        total > 0
          ? all.reduce((sum, d) => sum + (d.moyenneGenerale || 0), 0) / total
          : 0;
      return { total, admis, ajournes, refuses, moyenneGenerale };
    }),

  // Consult results publicly
  consultResults: protectedProcedure
    .input(
      z.object({
        numeroTable: z.number(),
        idSession: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
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

      const candidates = await db
        .select()
        .from(candidat)
        .where(eq(candidat.idInscription, idInscription))
        .limit(1);

      if (candidates.length === 0) {
        return { found: false };
      }

      const series = await db
        .select()
        .from(serie)
        .where(eq(serie.idSerie, candidates[0].idSerie!))
        .limit(1);

      const sessions = await db
        .select()
        .from(session)
        .where(eq(session.idSession, input.idSession))
        .limit(1);

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

        let coefficient = 1;
        if (candidates[0].idSerie) {
          const serieCoefficients = await db
            .select()
            .from(serieMatiere)
            .where(
              and(
                eq(serieMatiere.idSerie, candidates[0].idSerie),
                eq(serieMatiere.idMatiere, note.idMatiere)
              )
            )
            .limit(1);
          if (serieCoefficients.length > 0) {
            coefficient = serieCoefficients[0].coefficient ?? 1;
          }
        }

        if (matieres.length > 0) {
          notesWithMatiere.push({
            ...note,
            libelleMatiere: matieres[0].libelleMatiere,
            coefficient,
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
