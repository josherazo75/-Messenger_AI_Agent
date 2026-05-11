import { db } from "../config/database";

const rows = db.prepare(`
  SELECT id, sender_id, recipient_id, message_id, message_text, direction, timestamp, created_at
  FROM messages
  ORDER BY id DESC
`).all();

console.log("Saved messages:");
console.table(rows);