import {
  sqliteTable,
  integer,
  text,
  real,
} from "drizzle-orm/sqlite-core";

export const session = sqliteTable("session", {
  idSession: integer("id_session", { mode: "number" }).primaryKey({ autoIncrement: true }),
  annee: integer("annee").notNull(),
  libelleSession: text("libelle_session").notNull(),
  dateOuverture: text("date_ouverture"),
  dateFermeture: text("date_fermeture"),
  statut: text("statut").notNull().default("ouverte"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Schools
export const ecole = sqliteTable("ecole", {
  idEcole: integer("id_ecole", { mode: "number" }).primaryKey({ autoIncrement: true }),
  nom: text("nom").notNull(),
  ifu: text("ifu"),
  departement: text("departement"),
  type: text("type"),
  contact: text("contact"),
  email: text("email"),
  password: text("password"),
  adresse: text("adresse"),
  status: text("status").notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Exam Series
export const serie = sqliteTable("serie", {
  idSerie: integer("id_serie", { mode: "number" }).primaryKey({ autoIncrement: true }),
  libelleSerie: text("libelle_serie").notNull(),
  typeExamen: text("type_examen").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Subjects
export const matiere = sqliteTable("matiere", {
  idMatiere: integer("id_matiere", { mode: "number" }).primaryKey({ autoIncrement: true }),
  libelleMatiere: text("libelle_matiere").notNull(),
  code: text("code"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Series-Subjects link
export const serieMatiere = sqliteTable("serie_matiere", {
  idSerie: integer("id_serie").notNull(),
  idMatiere: integer("id_matiere").notNull(),
  coefficient: integer("coefficient").notNull().default(1),
});

// Candidates
export const candidat = sqliteTable("candidat", {
  idInscription: integer("id_inscription", { mode: "number" }).primaryKey({ autoIncrement: true }),
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
  sexe: text("sexe"),
  dateNaissance: text("date_naissance"),
  idSerie: integer("id_serie"),
  idEcole: integer("id_ecole"),
  numeroTable: integer("numero_table"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// School Inscriptions
export const inscription = sqliteTable("inscription", {
  idEcole: integer("id_ecole").notNull(),
  idSession: integer("id_session").notNull(),
  dateInscription: text("date_inscription"),
});

// Convocations
export const convocation = sqliteTable("convocation", {
  idSession: integer("id_session").notNull(),
  idInscription: integer("id_inscription").notNull(),
  numeroTable: integer("numero_table"),
  centre: text("centre"),
  salle: text("salle"),
});

// Grades
export const notes = sqliteTable("notes", {
  idInscription: integer("id_inscription").notNull(),
  idSession: integer("id_session").notNull(),
  idMatiere: integer("id_matiere").notNull(),
  valeur: real("valeur"),
});

// Deliberation
export const deliberation = sqliteTable("deliberation", {
  idInscription: integer("id_inscription").notNull(),
  idSession: integer("id_session").notNull(),
  moyenneGenerale: real("moyenne_generale"),
  mention: text("mention"),
  resultat: text("resultat"),
});

// Transcripts
export const releve = sqliteTable("releve", {
  idReleve: integer("id_releve", { mode: "number" }).primaryKey({ autoIncrement: true }),
  idInscription: integer("id_inscription"),
  idSession: integer("id_session"),
  moyenne: real("moyenne"),
  mention: text("mention"),
  fichierUrl: text("fichier_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Admin Users
export const admin = sqliteTable("admin", {
  idAdmin: integer("id_admin", { mode: "number" }).primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  nom: text("nom"),
  email: text("email"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Secretaries
export const secretaire = sqliteTable("secretaire", {
  idSecretaire: integer("id_secretaire", { mode: "number" }).primaryKey({ autoIncrement: true }),
  nom: text("nom"),
  prenom: text("prenom"),
  contact: text("contact"),
  email: text("email").notNull(),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Exam Centers
export const centreExamen = sqliteTable("centre_examen", {
  idCentre: integer("id_centre", { mode: "number" }).primaryKey({ autoIncrement: true }),
  nom: text("nom").notNull(),
  ville: text("ville"),
  departement: text("departement"),
  capacite: integer("capacite"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
