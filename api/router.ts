import { createRouter, publicQuery } from "./middleware";
import { authRouter } from "./routers/auth";
import { sessionRouter } from "./routers/session";
import { ecoleRouter } from "./routers/ecole";
import { candidatRouter } from "./routers/candidat";
import { serieRouter, matiereRouter, serieMatiereRouter } from "./routers/serie";
import { notesRouter } from "./routers/notes";
import { deliberationRouter } from "./routers/deliberation";
import { convocationRouter } from "./routers/convocation";
import { releveRouter } from "./routers/releve";
import { dashboardRouter } from "./routers/dashboard";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  auth: authRouter,
  session: sessionRouter,
  ecole: ecoleRouter,
  candidat: candidatRouter,
  serie: serieRouter,
  matiere: matiereRouter,
  serieMatiere: serieMatiereRouter,
  notes: notesRouter,
  deliberation: deliberationRouter,
  convocation: convocationRouter,
  releve: releveRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
