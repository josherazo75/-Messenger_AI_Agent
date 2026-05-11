import { db } from "../config/database";

export interface LeadRecord {
  id: number;
  contact_id: string;
  property_type: string | null;
  city_or_zip: string | null;
  camera_count: string | null;
  timeline: string | null;
  status: string | null;
  lead_temperature: string | null;
  lead_score: number | null;
  handoff_needed: number | null;
  handoff_reason: string | null;
  handoff_at: string | null;
  created_at: string;
  updated_at: string;
}

export function ensureLead(contactId: string): void {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO leads (contact_id, status, lead_score, handoff_needed)
    VALUES (?, 'new', 0, 0)
  `);

  stmt.run(contactId);
}

export function getLeadByContactId(contactId: string): LeadRecord | undefined {
  const stmt = db.prepare(`
    SELECT
      id,
      contact_id,
      property_type,
      city_or_zip,
      camera_count,
      timeline,
      status,
      lead_temperature,
      lead_score,
      handoff_needed,
      handoff_reason,
      handoff_at,
      created_at,
      updated_at
    FROM leads
    WHERE contact_id = ?
  `);

  return stmt.get(contactId) as LeadRecord | undefined;
}

export function updateLeadPropertyType(contactId: string, propertyType: string): void {
  const stmt = db.prepare(`
    UPDATE leads
    SET property_type = ?, updated_at = CURRENT_TIMESTAMP
    WHERE contact_id = ?
  `);

  stmt.run(propertyType, contactId);
}

export function updateLeadCityOrZip(contactId: string, cityOrZip: string): void {
  const stmt = db.prepare(`
    UPDATE leads
    SET city_or_zip = ?, updated_at = CURRENT_TIMESTAMP
    WHERE contact_id = ?
  `);

  stmt.run(cityOrZip, contactId);
}

export function updateLeadCameraCount(contactId: string, cameraCount: string): void {
  const stmt = db.prepare(`
    UPDATE leads
    SET camera_count = ?, updated_at = CURRENT_TIMESTAMP
    WHERE contact_id = ?
  `);

  stmt.run(cameraCount, contactId);
}

export function updateLeadTimeline(contactId: string, timeline: string): void {
  const stmt = db.prepare(`
    UPDATE leads
    SET timeline = ?, status = 'qualified', updated_at = CURRENT_TIMESTAMP
    WHERE contact_id = ?
  `);

  stmt.run(timeline, contactId);
}

export function updateLeadScoring(
  contactId: string,
  temperature: string,
  score: number
): void {
  const stmt = db.prepare(`
    UPDATE leads
    SET lead_temperature = ?,
        lead_score = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE contact_id = ?
  `);

  stmt.run(temperature, score, contactId);
}

export function updateLeadHandoffStatus(
  contactId: string,
  handoffNeeded: boolean,
  handoffReason?: string
): void {
  const stmt = db.prepare(`
    UPDATE leads
    SET handoff_needed = ?,
        handoff_reason = ?,
        handoff_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END,
        status = CASE
          WHEN ? = 1 THEN 'handoff_needed'
          ELSE status
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE contact_id = ?
  `);

  const handoffValue = handoffNeeded ? 1 : 0;

  stmt.run(
    handoffValue,
    handoffReason ?? null,
    handoffValue,
    handoffValue,
    contactId
  );
}