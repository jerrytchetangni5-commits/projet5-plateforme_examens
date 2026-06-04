import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL || "file:./data/uniresults.db";

async function seed() {
  console.log("Seeding database...");

  // Ensure directory exists
  const fs = await import("fs");
  const path = await import("path");
  const dbDir = path.dirname(DATABASE_URL.replace("file:", ""));
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const client = createClient({ url: DATABASE_URL });
  const db = drizzle(client, { schema });

  // Clear existing data (SQLite doesn't support TRUNCATE with FK checks the same way)
  const tables = [
    "convocation", "notes", "deliberation", "releve", "inscription",
    "candidat", "serie_matiere", "matiere", "serie", "ecole",
    "session", "secretaire", "centre_examen", "admin"
  ];
  for (const table of tables) {
    try {
      await client.execute(`DELETE FROM ${table}`);
    } catch {
      // Table might not exist yet
    }
  }

  // 1. Admin
  await db.insert(schema.admin).values({
    username: "admin",
    password: "admin",
    nom: "Administrateur",
    email: "admin@uniresults.com",
  });
  console.log("Admin created (admin/admin)");

  // 2. Sessions
  await db.insert(schema.session).values([
    { annee: 2025, libelleSession: "Session Principale 2025", dateOuverture: "2025-01-15", dateFermeture: "2025-07-31", statut: "ouverte" },
    { annee: 2024, libelleSession: "Session Principale 2024", dateOuverture: "2024-01-15", dateFermeture: "2024-07-31", statut: "fermee" },
  ]);

  // 3. Ecoles
  await db.insert(schema.ecole).values([
    { nom: "College Saint Jean Bosco", ifu: "123456789", departement: "Littoral", type: "College", contact: "22997000001", email: "csjb@cotonou.bj", password: "ecole123", adresse: "Cotonou, Cadjehoun", status: "active" },
    { nom: "Lycee Technique de Porto-Novo", ifu: "987654321", departement: "Oueme", type: "Lycee", contact: "22997000002", email: "ltp@portonovo.bj", password: "ecole123", adresse: "Porto-Novo, Akpakpa", status: "active" },
    { nom: "CEG Sainte Therese", ifu: "456789123", departement: "Atlantique", type: "CEG", contact: "22997000003", email: "cegst@ouidah.bj", password: "ecole123", adresse: "Ouidah, centre ville", status: "active" },
  ]);

  // 4. Secretaires
  await db.insert(schema.secretaire).values([
    { nom: "Kouassi", prenom: "Marie", contact: "22996000001", email: "marie.kouassi@uniresults.com", password: "sec123" },
    { nom: "Agossou", prenom: "Paul", contact: "22996000002", email: "paul.agossou@uniresults.com", password: "sec123" },
  ]);

  // 5. Centres
  await db.insert(schema.centreExamen).values([
    { nom: "Centre Cotonou A", ville: "Cotonou", departement: "Littoral", capacite: 500 },
    { nom: "Centre Porto-Novo B", ville: "Porto-Novo", departement: "Oueme", capacite: 400 },
    { nom: "Centre Ouidah C", ville: "Ouidah", departement: "Atlantique", capacite: 300 },
    { nom: "Centre Parakou D", ville: "Parakou", departement: "Borgou", capacite: 350 },
  ]);

  // 6. Series
  await db.insert(schema.serie).values([
    { libelleSerie: "CEP", typeExamen: "CEP", description: "Certificat d'Etudes Primaires" },
    { libelleSerie: "BEPC", typeExamen: "BEPC", description: "Brevet d'Etudes du Premier Cycle" },
    { libelleSerie: "CAP", typeExamen: "CAP", description: "Certificat d'Aptitude Professionnelle" },
    { libelleSerie: "BAC A", typeExamen: "BAC", description: "Baccalaureat - Serie A (Litteraire)" },
    { libelleSerie: "BAC C", typeExamen: "BAC", description: "Baccalaureat - Serie C (Scientifique)" },
    { libelleSerie: "BAC D", typeExamen: "BAC", description: "Baccalaureat - Serie D (Scientifique)" },
  ]);

  // 7. Matieres
  await db.insert(schema.matiere).values([
    { libelleMatiere: "Mathematiques", code: "MATH" },
    { libelleMatiere: "Physique-Chimie", code: "PC" },
    { libelleMatiere: "Sciences de la Vie et de la Terre", code: "SVT" },
    { libelleMatiere: "Francais", code: "FR" },
    { libelleMatiere: "Anglais", code: "ANG" },
    { libelleMatiere: "Histoire-Geographie", code: "HG" },
    { libelleMatiere: "Philosophie", code: "PHILO" },
    { libelleMatiere: "Education Civique", code: "EC" },
    { libelleMatiere: "Espagnol", code: "ESP" },
    { libelleMatiere: "Allemand", code: "ALL" },
    { libelleMatiere: "Arabe", code: "AR" },
    { libelleMatiere: "Musique", code: "MUS" },
    { libelleMatiere: "Arts Plastiques", code: "AP" },
    { libelleMatiere: "Informatique", code: "INFO" },
    { libelleMatiere: "Economie", code: "ECO" },
  ]);

  // 8. Serie-Matiere coefficients
  await db.insert(schema.serieMatiere).values([
    // BAC C
    { idSerie: 5, idMatiere: 1, coefficient: 6 },
    { idSerie: 5, idMatiere: 2, coefficient: 6 },
    { idSerie: 5, idMatiere: 3, coefficient: 4 },
    { idSerie: 5, idMatiere: 4, coefficient: 4 },
    { idSerie: 5, idMatiere: 5, coefficient: 2 },
    { idSerie: 5, idMatiere: 6, coefficient: 2 },
    { idSerie: 5, idMatiere: 7, coefficient: 2 },
    { idSerie: 5, idMatiere: 8, coefficient: 1 },
    // BAC D
    { idSerie: 6, idMatiere: 1, coefficient: 4 },
    { idSerie: 6, idMatiere: 2, coefficient: 4 },
    { idSerie: 6, idMatiere: 3, coefficient: 6 },
    { idSerie: 6, idMatiere: 4, coefficient: 4 },
    { idSerie: 6, idMatiere: 5, coefficient: 2 },
    { idSerie: 6, idMatiere: 6, coefficient: 2 },
    { idSerie: 6, idMatiere: 7, coefficient: 2 },
    { idSerie: 6, idMatiere: 8, coefficient: 1 },
    // BAC A
    { idSerie: 4, idMatiere: 4, coefficient: 5 },
    { idSerie: 4, idMatiere: 5, coefficient: 4 },
    { idSerie: 4, idMatiere: 6, coefficient: 4 },
    { idSerie: 4, idMatiere: 7, coefficient: 4 },
    { idSerie: 4, idMatiere: 1, coefficient: 2 },
    { idSerie: 4, idMatiere: 9, coefficient: 2 },
    // BEPC
    { idSerie: 2, idMatiere: 1, coefficient: 4 },
    { idSerie: 2, idMatiere: 2, coefficient: 2 },
    { idSerie: 2, idMatiere: 3, coefficient: 2 },
    { idSerie: 2, idMatiere: 4, coefficient: 4 },
    { idSerie: 2, idMatiere: 5, coefficient: 2 },
    { idSerie: 2, idMatiere: 6, coefficient: 2 },
    { idSerie: 2, idMatiere: 8, coefficient: 1 },
  ]);

  // 9. Candidats
  await db.insert(schema.candidat).values([
    { nom: "KOFFI", prenom: "Jean-Marc", sexe: "M", dateNaissance: "2007-03-15", idSerie: 5, idEcole: 1 },
    { nom: "TOSSOU", prenom: "Aline", sexe: "F", dateNaissance: "2008-06-22", idSerie: 5, idEcole: 1 },
    { nom: "AGOSSOU", prenom: "Paulin", sexe: "M", dateNaissance: "2007-11-08", idSerie: 6, idEcole: 2 },
    { nom: "HOUNKPATIN", prenom: "Grace", sexe: "F", dateNaissance: "2008-01-30", idSerie: 6, idEcole: 2 },
    { nom: "SOSSOU", prenom: "Evrard", sexe: "M", dateNaissance: "2006-09-12", idSerie: 4, idEcole: 1 },
    { nom: "DOSSOU", prenom: "Marie-Claire", sexe: "F", dateNaissance: "2009-04-05", idSerie: 2, idEcole: 3 },
    { nom: "BOKO", prenom: "Serge", sexe: "M", dateNaissance: "2009-07-18", idSerie: 2, idEcole: 3 },
    { nom: "AHOUANSOU", prenom: "Rosine", sexe: "F", dateNaissance: "2008-12-03", idSerie: 2, idEcole: 1 },
    { nom: "HOUNGAN", prenom: "Firmin", sexe: "M", dateNaissance: "2012-02-20", idSerie: 1, idEcole: 3 },
    { nom: "KPATENON", prenom: "Esther", sexe: "F", dateNaissance: "2012-08-14", idSerie: 1, idEcole: 3 },
    { nom: "TCHIBOZO", prenom: "Romuald", sexe: "M", dateNaissance: "2007-05-25", idSerie: 5, idEcole: 2 },
    { nom: "OKONKWO", prenom: "Patricia", sexe: "F", dateNaissance: "2007-10-10", idSerie: 6, idEcole: 1 },
  ]);

  // 10. Convocations
  await db.insert(schema.convocation).values([
    { idSession: 1, idInscription: 1, numeroTable: 1001, centre: "Centre Cotonou A", salle: "Salle 101" },
    { idSession: 1, idInscription: 2, numeroTable: 1002, centre: "Centre Cotonou A", salle: "Salle 101" },
    { idSession: 1, idInscription: 3, numeroTable: 1003, centre: "Centre Porto-Novo B", salle: "Salle 201" },
    { idSession: 1, idInscription: 4, numeroTable: 1004, centre: "Centre Porto-Novo B", salle: "Salle 201" },
    { idSession: 1, idInscription: 5, numeroTable: 1005, centre: "Centre Cotonou A", salle: "Salle 102" },
    { idSession: 1, idInscription: 6, numeroTable: 1006, centre: "Centre Ouidah C", salle: "Salle 301" },
    { idSession: 1, idInscription: 7, numeroTable: 1007, centre: "Centre Ouidah C", salle: "Salle 301" },
    { idSession: 1, idInscription: 8, numeroTable: 1008, centre: "Centre Cotonou A", salle: "Salle 102" },
    { idSession: 1, idInscription: 9, numeroTable: 1009, centre: "Centre Ouidah C", salle: "Salle 302" },
    { idSession: 1, idInscription: 10, numeroTable: 1010, centre: "Centre Ouidah C", salle: "Salle 302" },
    { idSession: 1, idInscription: 11, numeroTable: 1011, centre: "Centre Porto-Novo B", salle: "Salle 202" },
    { idSession: 1, idInscription: 12, numeroTable: 1012, centre: "Centre Cotonou A", salle: "Salle 103" },
  ]);

  // 11. Notes
  const allNotes = [
    // Jean-Marc KOFFI - BAC C
    { idInscription: 1, idSession: 1, idMatiere: 1, valeur: 14.5 },
    { idInscription: 1, idSession: 1, idMatiere: 2, valeur: 13.0 },
    { idInscription: 1, idSession: 1, idMatiere: 3, valeur: 15.0 },
    { idInscription: 1, idSession: 1, idMatiere: 4, valeur: 12.0 },
    { idInscription: 1, idSession: 1, idMatiere: 5, valeur: 11.5 },
    { idInscription: 1, idSession: 1, idMatiere: 6, valeur: 13.5 },
    { idInscription: 1, idSession: 1, idMatiere: 7, valeur: 10.0 },
    { idInscription: 1, idSession: 1, idMatiere: 8, valeur: 14.0 },
    // Aline TOSSOU - BAC C
    { idInscription: 2, idSession: 1, idMatiere: 1, valeur: 16.0 },
    { idInscription: 2, idSession: 1, idMatiere: 2, valeur: 15.5 },
    { idInscription: 2, idSession: 1, idMatiere: 3, valeur: 14.0 },
    { idInscription: 2, idSession: 1, idMatiere: 4, valeur: 13.5 },
    { idInscription: 2, idSession: 1, idMatiere: 5, valeur: 12.0 },
    { idInscription: 2, idSession: 1, idMatiere: 6, valeur: 14.5 },
    { idInscription: 2, idSession: 1, idMatiere: 7, valeur: 11.0 },
    { idInscription: 2, idSession: 1, idMatiere: 8, valeur: 15.0 },
    // Paulin AGOSSOU - BAC D
    { idInscription: 3, idSession: 1, idMatiere: 1, valeur: 12.0 },
    { idInscription: 3, idSession: 1, idMatiere: 2, valeur: 11.5 },
    { idInscription: 3, idSession: 1, idMatiere: 3, valeur: 13.5 },
    { idInscription: 3, idSession: 1, idMatiere: 4, valeur: 10.5 },
    { idInscription: 3, idSession: 1, idMatiere: 5, valeur: 9.0 },
    { idInscription: 3, idSession: 1, idMatiere: 6, valeur: 11.0 },
    { idInscription: 3, idSession: 1, idMatiere: 7, valeur: 10.0 },
    { idInscription: 3, idSession: 1, idMatiere: 8, valeur: 12.5 },
    // Grace HOUNKPATIN - BAC D
    { idInscription: 4, idSession: 1, idMatiere: 1, valeur: 17.0 },
    { idInscription: 4, idSession: 1, idMatiere: 2, valeur: 16.5 },
    { idInscription: 4, idSession: 1, idMatiere: 3, valeur: 18.0 },
    { idInscription: 4, idSession: 1, idMatiere: 4, valeur: 14.0 },
    { idInscription: 4, idSession: 1, idMatiere: 5, valeur: 13.5 },
    { idInscription: 4, idSession: 1, idMatiere: 6, valeur: 15.0 },
    { idInscription: 4, idSession: 1, idMatiere: 7, valeur: 12.5 },
    { idInscription: 4, idSession: 1, idMatiere: 8, valeur: 16.0 },
    // Evrard SOSSOU - BAC A
    { idInscription: 5, idSession: 1, idMatiere: 4, valeur: 13.0 },
    { idInscription: 5, idSession: 1, idMatiere: 5, valeur: 11.0 },
    { idInscription: 5, idSession: 1, idMatiere: 6, valeur: 12.5 },
    { idInscription: 5, idSession: 1, idMatiere: 7, valeur: 10.5 },
    { idInscription: 5, idSession: 1, idMatiere: 1, valeur: 8.5 },
    { idInscription: 5, idSession: 1, idMatiere: 9, valeur: 9.0 },
    // BEPC candidates
    { idInscription: 6, idSession: 1, idMatiere: 1, valeur: 15.0 },
    { idInscription: 6, idSession: 1, idMatiere: 2, valeur: 13.5 },
    { idInscription: 6, idSession: 1, idMatiere: 3, valeur: 14.0 },
    { idInscription: 6, idSession: 1, idMatiere: 4, valeur: 12.5 },
    { idInscription: 6, idSession: 1, idMatiere: 5, valeur: 11.0 },
    { idInscription: 6, idSession: 1, idMatiere: 6, valeur: 13.0 },
    { idInscription: 6, idSession: 1, idMatiere: 8, valeur: 14.5 },
    { idInscription: 7, idSession: 1, idMatiere: 1, valeur: 8.5 },
    { idInscription: 7, idSession: 1, idMatiere: 2, valeur: 7.0 },
    { idInscription: 7, idSession: 1, idMatiere: 3, valeur: 9.0 },
    { idInscription: 7, idSession: 1, idMatiere: 4, valeur: 8.0 },
    { idInscription: 7, idSession: 1, idMatiere: 5, valeur: 7.5 },
    { idInscription: 7, idSession: 1, idMatiere: 6, valeur: 8.5 },
    { idInscription: 7, idSession: 1, idMatiere: 8, valeur: 9.5 },
    { idInscription: 8, idSession: 1, idMatiere: 1, valeur: 16.5 },
    { idInscription: 8, idSession: 1, idMatiere: 2, valeur: 15.0 },
    { idInscription: 8, idSession: 1, idMatiere: 3, valeur: 14.5 },
    { idInscription: 8, idSession: 1, idMatiere: 4, valeur: 13.0 },
    { idInscription: 8, idSession: 1, idMatiere: 5, valeur: 12.5 },
    { idInscription: 8, idSession: 1, idMatiere: 6, valeur: 14.0 },
    { idInscription: 8, idSession: 1, idMatiere: 8, valeur: 15.5 },
    // CEP
    { idInscription: 9, idSession: 1, idMatiere: 1, valeur: 12.0 },
    { idInscription: 9, idSession: 1, idMatiere: 4, valeur: 11.0 },
    { idInscription: 9, idSession: 1, idMatiere: 6, valeur: 10.5 },
    { idInscription: 9, idSession: 1, idMatiere: 8, valeur: 13.0 },
    { idInscription: 10, idSession: 1, idMatiere: 1, valeur: 15.5 },
    { idInscription: 10, idSession: 1, idMatiere: 4, valeur: 14.0 },
    { idInscription: 10, idSession: 1, idMatiere: 6, valeur: 13.5 },
    { idInscription: 10, idSession: 1, idMatiere: 8, valeur: 15.0 },
    // Romuald - BAC C
    { idInscription: 11, idSession: 1, idMatiere: 1, valeur: 9.5 },
    { idInscription: 11, idSession: 1, idMatiere: 2, valeur: 8.0 },
    { idInscription: 11, idSession: 1, idMatiere: 3, valeur: 10.0 },
    { idInscription: 11, idSession: 1, idMatiere: 4, valeur: 9.0 },
    { idInscription: 11, idSession: 1, idMatiere: 5, valeur: 8.5 },
    { idInscription: 11, idSession: 1, idMatiere: 6, valeur: 10.5 },
    { idInscription: 11, idSession: 1, idMatiere: 7, valeur: 7.5 },
    { idInscription: 11, idSession: 1, idMatiere: 8, valeur: 11.0 },
    // Patricia - BAC D
    { idInscription: 12, idSession: 1, idMatiere: 1, valeur: 13.5 },
    { idInscription: 12, idSession: 1, idMatiere: 2, valeur: 12.0 },
    { idInscription: 12, idSession: 1, idMatiere: 3, valeur: 14.5 },
    { idInscription: 12, idSession: 1, idMatiere: 4, valeur: 11.5 },
    { idInscription: 12, idSession: 1, idMatiere: 5, valeur: 10.0 },
    { idInscription: 12, idSession: 1, idMatiere: 6, valeur: 12.5 },
    { idInscription: 12, idSession: 1, idMatiere: 7, valeur: 11.0 },
    { idInscription: 12, idSession: 1, idMatiere: 8, valeur: 13.0 },
  ];

  for (const note of allNotes) {
    await db.insert(schema.notes).values(note);
  }

  // 12. Deliberations
  await db.insert(schema.deliberation).values([
    { idInscription: 1, idSession: 1, moyenneGenerale: 13.48, mention: "Assez Bien", resultat: "Admis" },
    { idInscription: 2, idSession: 1, moyenneGenerale: 14.63, mention: "Bien", resultat: "Admis" },
    { idInscription: 3, idSession: 1, moyenneGenerale: 11.34, mention: "Passable", resultat: "Admis" },
    { idInscription: 4, idSession: 1, moyenneGenerale: 15.93, mention: "Bien", resultat: "Admis" },
    { idInscription: 5, idSession: 1, moyenneGenerale: 11.13, mention: "Passable", resultat: "Admis" },
    { idInscription: 6, idSession: 1, moyenneGenerale: 13.36, mention: "Assez Bien", resultat: "Admis" },
    { idInscription: 7, idSession: 1, moyenneGenerale: 8.21, mention: "Insuffisant", resultat: "Ajourne" },
    { idInscription: 8, idSession: 1, moyenneGenerale: 14.36, mention: "Bien", resultat: "Admis" },
    { idInscription: 9, idSession: 1, moyenneGenerale: 11.63, mention: "Passable", resultat: "Admis" },
    { idInscription: 10, idSession: 1, moyenneGenerale: 14.50, mention: "Bien", resultat: "Admis" },
    { idInscription: 11, idSession: 1, moyenneGenerale: 8.96, mention: "Insuffisant", resultat: "Ajourne" },
    { idInscription: 12, idSession: 1, moyenneGenerale: 12.55, mention: "Assez Bien", resultat: "Admis" },
  ]);

  // 13. Releves
  await db.insert(schema.releve).values([
    { idInscription: 1, idSession: 1, moyenne: 13.48, mention: "Assez Bien" },
    { idInscription: 4, idSession: 1, moyenne: 15.93, mention: "Bien" },
    { idInscription: 8, idSession: 1, moyenne: 14.36, mention: "Bien" },
  ]);

  console.log("\nSeed completed successfully!");
  console.log("Login credentials:");
  console.log("  Admin: admin / admin");
  console.log("  Ecole: csjb@cotonou.bj / ecole123");
  console.log("  Secretaire: marie.kouassi@uniresults.com / sec123");

  await client.close();
}

seed().catch(console.error);
