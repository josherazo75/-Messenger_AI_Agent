import { db } from "../config/database";

const rows = db.prepare(`
  SELECT id, contact_id, property_type, city_or_zip, camera_count, timeline, status, created_at, updated_at
  FROM leads
  ORDER BY id DESC
`).all();

console.log("Saved leads:");
console.table(rows);