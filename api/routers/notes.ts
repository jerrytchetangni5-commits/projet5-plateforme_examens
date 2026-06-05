import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createRouter,
  protectedProcedure,
  secretaireOrAdminProcedure,
} from "../middleware";
import { getDb } from "../queries/connection";
import { notes, candidat, convocation } from "@db/schema";
import { eq, and, inArray } from "drizzle-orm";

export const notesRouter = createRouter({
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
          .from(notes)
          .where(
            and(
              eq(notes.idSession, input.idSession),
              inArray(notes.idInscription, ids)
            )
          );
      }
      return db
        .select()
        .from(notes)
        .where(eq(notes.idSession, input.idSession));
    }),

  listByCandidate: protectedProcedure
    .input(z.object({ idInscription: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      if (ctx.user.role === "ecole") {
        const candidate = await db
          .select()
          .from(candidat)
          .where(eq(candidat.idInscription, input.idInscription))
          .limit(1);
        if (candidate.length === 0 || candidate[0].idEcole !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }
      return db
        .select()
        .from(notes)
        .where(eq(notes.idInscription, input.idInscription));
    }),

  getByCentre: protectedProcedure
    .input(z.object({ centre: z.string(), idSession: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
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
        const candidate = await db
          .select()
          .from(candidat)
          .where(eq(candidat.idInscription, conv.idInscription))
          .limit(1);

        if (candidate.length === 0) continue;
        if (ctx.user.role === "ecole" && candidate[0].idEcole !== ctx.user.id) {
          continue;
        }

        const candidateNotes = await db
          .select()
          .from(notes)
          .where(
            and(
              eq(notes.idInscription, conv.idInscription),
              eq(notes.idSession, input.idSession)
            )
          );

        results.push({
          candidate: candidate[0],
          numeroTable: conv.numeroTable,
          notes: candidateNotes,
        });
      }
      return results;
    }),

  createOrUpdate: secretaireOrAdminProcedure
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

  delete: secretaireOrAdminProcedure
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
  bulkCreate: secretaireOrAdminProcedure
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
