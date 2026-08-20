import Database from "@tauri-apps/plugin-sql";

let db: Database;

export async function initDatabase() {
  if (db) return db;

  db = await Database.load("sqlite:shinrin.db");

  return db;
}