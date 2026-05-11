import { db } from "../config/database";

const rows = db.prepare(`
  SELECT id, contact_id, lead_id, last_question, status, follow_up_count, next_follow_up_at, last_customer_message_at, created_at, updated_at
  FROM follow_ups
  ORDER BY id DESC
`).all();

console.log("Saved follow-ups:");
console.table(rows);