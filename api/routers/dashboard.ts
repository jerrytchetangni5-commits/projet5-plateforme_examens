import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import {
  session,
  ecole,
  candidat,
  notes,
  deliberation,
  matiere,
  serie,
  centreExamen,
  secretaire,
  convocation,
} from "@db/schema";
import { count, eq, avg } from "drizzle-orm";

export const dashboardRouter = createRouter({
  stats: publicQuery.query(async () => {
    const db = getDb();

    const totalSessions = await db.select({ count: count() }).from(session);
    const totalEcoles = await db.select({ count: count() }).from(ecole);
    const totalCandidats = await db.select({ count: count() }).from(candidat);
    const totalMatieres = await db.select({ count: count() }).from(matiere);
    const totalSeries = await db.select({ count: count() }).from(serie);
    const totalCentres = await db
      .select({ count: count() })
      .from(centreExamen);
    const totalSecretaires = await db
      .select({ count: count() })
      .from(secretaire);

    // Count by exam type
    const sessionsList = await db.select().from(session);
    const sessionOuverte = sessionsList.filter(
      (s) => s.statut === "ouverte"
    ).length;
    const sessionFermee = sessionsList.filter(
      (s) => s.statut === "fermee"
    ).length;

    // Candidates by gender
    const hommes = await db
      .select({ count: count() })
      .from(candidat)
      .where(eq(candidat.sexe, "M"));
    const femmes = await db
      .select({ count: count() })
      .from(candidat)
      .where(eq(candidat.sexe, "F"));

    // Deliberation stats for most recent session
    const delibs = await db.select().from(deliberation);
    const totalDeliberes = delibs.length;
    const admis = delibs.filter((d) => d.resultat === "Admis").length;
    const ajournes = delibs.filter((d) => d.resultat === "Ajourne").length;
    const refuses = delibs.filter((d) => d.resultat === "Refuse").length;

    // Average score
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
  recentActivity: publicQuery.query(async () => {
    const db = getDb();

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
