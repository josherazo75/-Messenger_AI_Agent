import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const dataDir = path.resolve(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "messenger.db");

export const db = new Database(dbPath);

export function initializeDatabase(): void {
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id TEXT,
      recipient_id TEXT,
      message_id TEXT UNIQUE,
      message_text TEXT,
      direction TEXT NOT NULL,
      timestamp INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id TEXT NOT NULL UNIQUE,
      property_type TEXT,
      city_or_zip TEXT,
      camera_count TEXT,
      timeline TEXT,
      status TEXT DEFAULT 'new',
      lead_temperature TEXT,
      lead_score INTEGER DEFAULT 0,
      handoff_needed INTEGER DEFAULT 0,
      handoff_reason TEXT,
      handoff_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS follow_ups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id TEXT NOT NULL UNIQUE,
      lead_id INTEGER,
      last_question TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      follow_up_count INTEGER NOT NULL DEFAULT 0,
      next_follow_up_at DATETIME,
      last_customer_message_at INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id)
    );
  `);

  console.log("Database initialized at:", dbPath);
}