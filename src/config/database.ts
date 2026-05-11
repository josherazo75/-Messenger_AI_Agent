import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "messenger.db");

export const db = new Database(dbPath);

function columnExists(tableName: string, columnName: string): boolean {
  const rows = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{
    name: string;
  }>;

  return rows.some((row) => row.name === columnName);
}

function addColumnIfMissing(
  tableName: string,
  columnName: string,
  columnDefinition: string
): void {
  if (!columnExists(tableName, columnName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
  }
}

export function initializeDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id TEXT,
      recipient_id TEXT,
      message_id TEXT UNIQUE,
      message_text TEXT,
      direction TEXT,
      timestamp INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id TEXT UNIQUE,
      property_type TEXT,
      city_or_zip TEXT,
      camera_count TEXT,
      timeline TEXT,
      status TEXT DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  addColumnIfMissing("leads", "lead_temperature", "TEXT");
  addColumnIfMissing("leads", "lead_score", "INTEGER DEFAULT 0");
  addColumnIfMissing("leads", "handoff_needed", "INTEGER DEFAULT 0");
  addColumnIfMissing("leads", "handoff_reason", "TEXT");
  addColumnIfMissing("leads", "handoff_at", "DATETIME");

  db.exec(`
    CREATE TABLE IF NOT EXISTS follow_ups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id TEXT NOT NULL UNIQUE,
      lead_id INTEGER,
      last_question TEXT,
      status TEXT DEFAULT 'pending',
      follow_up_count INTEGER DEFAULT 0,
      next_follow_up_at DATETIME,
      last_customer_message_at INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("Database initialized.");
}