import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { admin, ecole, secretaire } from "@db/schema";
import { eq } from "drizzle-orm";
import { signToken } from "../lib/jwt";

export const authRouter = createRouter({
  loginAdmin: publicQuery
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const admins = await db
        .select()
        .from(admin)
        .where(eq(admin.username, input.username))
        .limit(1);

      if (admins.length === 0) {
        return { success: false, error: "Identifiants incorrects" };
      }

      const found = admins[0];
      // Compare plain text for now (admin/admin)
      if (found.password !== input.password) {
        return { success: false, error: "Identifiants incorrects" };
      }

      const token = await signToken({
        userId: found.idAdmin,
        role: "admin",
        username: found.username,
      });

      return {
        success: true,
        token,
        user: {
          id: found.idAdmin,
          username: found.username,
          nom: found.nom,
          role: "admin",
        },
      };
    }),

  loginEcole: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const ecoles = await db
        .select()
        .from(ecole)
        .where(eq(ecole.email, input.email))
        .limit(1);

      if (ecoles.length === 0) {
        return { success: false, error: "Email ou mot de passe incorrect" };
      }

      const found = ecoles[0];
      if (found.password !== input.password) {
        return { success: false, error: "Email ou mot de passe incorrect" };
      }

      const token = await signToken({
        userId: found.idEcole,
        role: "ecole",
        email: found.email,
      });

      return {
        success: true,
        token,
        user: {
          id: found.idEcole,
          nom: found.nom,
          email: found.email,
          role: "ecole",
        },
      };
    }),

  loginSecretaire: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const secretaires = await db
        .select()
        .from(secretaire)
        .where(eq(secretaire.email, input.email))
        .limit(1);

      if (secretaires.length === 0) {
        return { success: false, error: "Email ou mot de passe incorrect" };
      }

      const found = secretaires[0];
      if (found.password !== input.password) {
        return { success: false, error: "Email ou mot de passe incorrect" };
      }

      const token = await signToken({
        userId: found.idSecretaire,
        role: "secretaire",
        email: found.email,
      });

      return {
        success: true,
        token,
        user: {
          id: found.idSecretaire,
          nom: found.nom,
          prenom: found.prenom,
          email: found.email,
          role: "secretaire",
        },
      };
    }),

  me: publicQuery.query(({ ctx }) => {
    return { user: ctx.user };
  }),

  registerEcole: publicQuery
    .input(
      z.object({
        nom: z.string().min(2),
        ifu: z.string().optional(),
        departement: z.string().min(1),
        type: z.string().min(1),
        contact: z.string().optional(),
        email: z.string().email(),
        password: z.string().min(6),
        adresse: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(ecole)
        .where(eq(ecole.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        return { success: false, error: "Cet email est déjà utilisé" };
      }

      await db.insert(ecole).values({
        nom: input.nom,
        ifu: input.ifu,
        departement: input.departement,
        type: input.type,
        contact: input.contact,
        email: input.email,
        password: input.password,
        adresse: input.adresse,
        status: "active",
      });

      return { success: true };
    }),
});
