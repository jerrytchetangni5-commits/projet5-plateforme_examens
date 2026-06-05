import { createRouter, protectedProcedure } from "../middleware";
import { getDb } from "../queries/connection";
import {
  session,
  ecole,
  candidat,
  matiere,
  serie,
  centreExamen,
  secretaire,
  deliberation,
  convocation,
} from "@db/schema";
import { count, eq, inArray } from "drizzle-orm";

export const dashboardRouter = createRouter({
  stats: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();

    const user = ctx.user!;
    if (user.role === "ecole") {
      const candidates = await db
        .select()
        .from(candidat)
        .where(eq(candidat.idEcole, user.id));
      const candidateIds = candidates.map(c => c.idInscription);
      const sessionStatuses = await db.select().from(session);
      const delibs = await db
        .select()
        .from(deliberation)
        .where(inArray(deliberation.idInscription, candidateIds));

      const uniqueSeries = new Set(
        candidates.map(c => c.idSerie).filter(Boolean)
      );
      const totalMatieres = await db
        .select({ count: count() })
        .from(serie)
        .where(inArray(serie.idSerie, Array.from(uniqueSeries))); // approximate for assigned series

      const centres = await db
        .select({ centre: convocation.centre })
        .from(convocation)
        .where(inArray(convocation.idInscription, candidateIds));
      const uniqueCentres = new Set(centres.map(c => c.centre));

      const hommes = candidates.filter(c => c.sexe === "M").length;
      const femmes = candidates.filter(c => c.sexe === "F").length;
      const totalDeliberes = delibs.length;
      const admis = delibs.filter(d => d.resultat === "Admis").length;
      const ajournes = delibs.filter(d => d.resultat === "Ajourne").length;
      const refuses = delibs.filter(d => d.resultat === "Refuse").length;
      const avgMoyenne =
        totalDeliberes > 0
          ? delibs.reduce((s, d) => s + (d.moyenneGenerale || 0), 0) /
            totalDeliberes
          : 0;

      return {
        totalSessions: sessionStatuses.length,
        totalEcoles: 1,
        totalCandidats: candidates.length,
        totalMatieres: totalMatieres[0]?.count || 0,
        totalSeries: uniqueSeries.size,
        totalCentres: uniqueCentres.size,
        totalSecretaires: 0,
        sessionOuverte: sessionStatuses.filter(s => s.statut === "ouverte")
          .length,
        sessionFermee: sessionStatuses.filter(s => s.statut === "fermee")
          .length,
        hommes,
        femmes,
        totalDeliberes,
        admis,
        ajournes,
        refuses,
        avgMoyenne: Math.round(avgMoyenne * 100) / 100,
      };
    }

    const totalSessions = await db.select({ count: count() }).from(session);
    const totalEcoles = await db.select({ count: count() }).from(ecole);
    const totalCandidats = await db.select({ count: count() }).from(candidat);
    const totalMatieres = await db.select({ count: count() }).from(matiere);
    const totalSeries = await db.select({ count: count() }).from(serie);
    const totalCentres = await db.select({ count: count() }).from(centreExamen);
    const totalSecretaires = await db
      .select({ count: count() })
      .from(secretaire);

    const sessionsList = await db.select().from(session);
    const sessionOuverte = sessionsList.filter(
      s => s.statut === "ouverte"
    ).length;
    const sessionFermee = sessionsList.filter(
      s => s.statut === "fermee"
    ).length;

    const hommes = await db
      .select({ count: count() })
      .from(candidat)
      .where(eq(candidat.sexe, "M"));
    const femmes = await db
      .select({ count: count() })
      .from(candidat)
      .where(eq(candidat.sexe, "F"));

    const delibs = await db.select().from(deliberation);
    const totalDeliberes = delibs.length;
    const admis = delibs.filter(d => d.resultat === "Admis").length;
    const ajournes = delibs.filter(d => d.resultat === "Ajourne").length;
    const refuses = delibs.filter(d => d.resultat === "Refuse").length;
    const avgMoyenne =
      totalDeliberes > 0
        ? delibs.reduce((s, d) => s + (d.moyenneGenerale || 0), 0) /
          totalDeliberes
        : 0;

    return {
      totalSessions: totalSessions[0]?.count || 0,
      totalEcoles: totalEcoles[0]?.count || 0,
      totalCandidats: totalCandidats[0]?.count || 0,
      totalMatieres: totalMatieres[0]?.count || 0,
      totalSeries: totalSeries[0]?.count || 0,
      totalCentres: totalCentres[0]?.count || 0,
      totalSecretaires: totalSecretaires[0]?.count || 0,
      sessionOuverte,
      sessionFermee,
      hommes: hommes[0]?.count || 0,
      femmes: femmes[0]?.count || 0,
      totalDeliberes,
      admis,
      ajournes,
      refuses,
      avgMoyenne: Math.round(avgMoyenne * 100) / 100,
    };
  }),

  // Get recent activity
  recentActivity: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();

    const user = ctx.user!;
    if (user.role === "ecole") {
      const recentEcoles = await db
        .select()
        .from(ecole)
        .where(eq(ecole.idEcole, user.id))
        .orderBy(ecole.createdAt)
        .limit(5);

      const recentCandidats = await db
        .select()
        .from(candidat)
        .where(eq(candidat.idEcole, user.id))
        .orderBy(candidat.createdAt)
        .limit(5);

      const sessionsList = await db.select().from(session);

      return {
        recentEcoles,
        recentCandidats,
        sessions: sessionsList,
      };
    }

    const recentEcoles = await db
      .select()
      .from(ecole)
      .orderBy(ecole.createdAt)
      .limit(5);

    const recentCandidats = await db
      .select()
      .from(candidat)
      .orderBy(candidat.createdAt)
      .limit(5);

    const sessionsList = await db.select().from(session);

    return {
      recentEcoles,
      recentCandidats,
      sessions: sessionsList,
    };
  }),
});
