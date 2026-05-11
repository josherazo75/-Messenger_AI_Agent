import { db } from "../config/database";
import { getLeadByContactId } from "./lead.service";
import { detectLanguage } from "./intent.service";
import { sendTextMessage } from "./messenger.service";
import { saveMessage } from "./message.service";

interface DueFollowUpRecord {
  id: number;
  contact_id: string;
  lead_id: number | null;
  last_question: string | null;
  status: string;
  follow_up_count: number;
  next_follow_up_at: string | null;
  last_customer_message_at: number | null;
  created_at: string;
  updated_at: string;
}

const MESSENGER_WINDOW_HOURS = 24;
const MESSENGER_WINDOW_MS = MESSENGER_WINDOW_HOURS * 60 * 60 * 1000;

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatSqliteDate(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function isWithinMessengerWindow(lastCustomerMessageAt?: number | null): boolean {
  if (!lastCustomerMessageAt) {
    return false;
  }

  const now = Date.now();
  return now - lastCustomerMessageAt <= MESSENGER_WINDOW_MS;
}

function getNextMissingQuestion(
  contactId: string,
  language: "spanish" | "english" | "unknown"
): string {
  const lead = getLeadByContactId(contactId);

  if (!lead?.property_type) {
    return language === "spanish"
      ? "¿Es para casa o negocio?"
      : "Is it for a house or a business?";
  }

  if (!lead?.city_or_zip) {
    return language === "spanish"
      ? "¿En qué ciudad está la propiedad?"
      : "What city is the property in?";
  }

  if (!lead?.camera_count) {
    return language === "spanish"
      ? "¿Cuántas cámaras ocupa?"
      : "About how many cameras do you need?";
  }

  if (!lead?.timeline) {
    return language === "spanish"
      ? "¿Qué tan pronto le gustaría instalar?"
      : "How soon are you looking to install?";
  }

  return language === "spanish"
    ? "¿Cuál es el mejor número para comunicarnos y avanzar con la instalación?"
    : "What is the best phone number to reach you so we can move forward with the install?";
}

function getLanguageForFollowUp(
  contactId: string,
  lastQuestion?: string | null
): "spanish" | "english" | "unknown" {
  const direct = detectLanguage(lastQuestion || "");

  if (direct !== "unknown") {
    return direct;
  }

  const lead = getLeadByContactId(contactId);
  const city = (lead?.city_or_zip || "").toLowerCase();

  if (
    city.includes("bakersfield") ||
    city.includes("delano") ||
    city.includes("wasco") ||
    city.includes("shafter")
  ) {
    return "english";
  }

  return "unknown";
}

function buildFollowUpMessage(row: DueFollowUpRecord): string {
  const language = getLanguageForFollowUp(row.contact_id, row.last_question);
  const isSpanish = language === "spanish";
  const nextQuestion = getNextMissingQuestion(row.contact_id, language);

  if (row.follow_up_count === 0) {
    return isSpanish
      ? `Solo le doy seguimiento por si todavía quiere información sobre la instalación. Le puedo ayudar a dejarlo claro y sin complicarlo. ${nextQuestion}`
      : `Just following up in case you still wanted info on the install. I can help keep it simple and point you in the right direction. ${nextQuestion}`;
  }

  if (row.follow_up_count === 1) {
    return isSpanish
      ? `No quería dejarle la conversación en el aire. Si todavía le interesa, le puedo ayudar a ver la opción que mejor se acomoda a la propiedad. ${nextQuestion}`
      : `I did not want to leave the conversation hanging. If you are still interested, I can help narrow down what makes the most sense for the property. ${nextQuestion}`;
  }

  return isSpanish
    ? `Último seguimiento de mi parte. Si todavía quiere avanzar, aquí mismo le ayudo con el siguiente paso. ${nextQuestion}`
    : `Last quick follow-up from me. If you still want to move forward, I can help with the next step right here. ${nextQuestion}`;
}

function getNextDelayDaysAfterSend(newFollowUpCount: number): number | null {
  if (newFollowUpCount === 1) {
    return 1;
  }

  if (newFollowUpCount === 2) {
    return 2;
  }

  return null;
}

function markFollowUpStopped(id: number): void {
  db.prepare(`
    UPDATE follow_ups
    SET status = 'stopped',
        next_follow_up_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(id);
}

function markFollowUpSentAndReschedule(
  id: number,
  newFollowUpCount: number,
  nextFollowUpAt: string | null
): void {
  db.prepare(`
    UPDATE follow_ups
    SET follow_up_count = ?,
        next_follow_up_at = ?,
        status = CASE WHEN ? IS NULL THEN 'stopped' ELSE 'pending' END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(newFollowUpCount, nextFollowUpAt, nextFollowUpAt, id);
}

export function scheduleFollowUp(
  contactId: string,
  lastQuestion: string,
  lastCustomerMessageAt?: number
): void {
  const lead = getLeadByContactId(contactId);
  const nextFollowUpAt = formatSqliteDate(addDays(new Date(), 1));

  const stmt = db.prepare(`
    INSERT INTO follow_ups (
      contact_id,
      lead_id,
      last_question,
      status,
      follow_up_count,
      next_follow_up_at,
      last_customer_message_at
    )
    VALUES (?, ?, ?, 'pending', 0, ?, ?)
    ON CONFLICT(contact_id) DO UPDATE SET
      lead_id = excluded.lead_id,
      last_question = excluded.last_question,
      status = 'pending',
      follow_up_count = 0,
      next_follow_up_at = excluded.next_follow_up_at,
      last_customer_message_at = excluded.last_customer_message_at,
      updated_at = CURRENT_TIMESTAMP
  `);

  stmt.run(
    contactId,
    lead?.id ?? null,
    lastQuestion,
    nextFollowUpAt,
    lastCustomerMessageAt ?? null
  );
}

export function completeFollowUp(contactId: string): void {
  const stmt = db.prepare(`
    UPDATE follow_ups
    SET status = 'completed',
        next_follow_up_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE contact_id = ?
      AND status = 'pending'
  `);

  const result = stmt.run(contactId);

  if (result.changes > 0) {
    console.log("Pending follow-up marked as completed.");
  }
}

export function stopFollowUp(contactId: string): void {
  db.prepare(`
    UPDATE follow_ups
    SET status = 'stopped',
        next_follow_up_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE contact_id = ?
  `).run(contactId);
}

function getDueFollowUps(): DueFollowUpRecord[] {
  const now = formatSqliteDate(new Date());

  return db.prepare(`
    SELECT
      id,
      contact_id,
      lead_id,
      last_question,
      status,
      follow_up_count,
      next_follow_up_at,
      last_customer_message_at,
      created_at,
      updated_at
    FROM follow_ups
    WHERE status = 'pending'
      AND next_follow_up_at IS NOT NULL
      AND next_follow_up_at <= ?
    ORDER BY next_follow_up_at ASC
  `).all(now) as DueFollowUpRecord[];
}

export async function processDueFollowUps(): Promise<number> {
  const dueFollowUps = getDueFollowUps();

  console.log(`Due follow-ups found: ${dueFollowUps.length}`);

  let sentCount = 0;

  for (const row of dueFollowUps) {
    if (row.follow_up_count >= 3) {
      markFollowUpStopped(row.id);
      console.log(`Follow-up stopped for ${row.contact_id}: max attempts reached.`);
      continue;
    }

    if (!isWithinMessengerWindow(row.last_customer_message_at)) {
      markFollowUpStopped(row.id);
      console.log(
        `Follow-up stopped for ${row.contact_id}: outside Messenger ${MESSENGER_WINDOW_HOURS}-hour window.`
      );
      continue;
    }

    const message = buildFollowUpMessage(row);

    try {
      await sendTextMessage({
        recipientId: row.contact_id,
        text: message,
      });

      saveMessage({
        senderId: process.env.META_PAGE_ID ?? "page",
        recipientId: row.contact_id,
        messageId: `followup-${row.contact_id}-${Date.now()}`,
        messageText: message,
        direction: "outgoing",
        timestamp: Date.now(),
      });

      const newFollowUpCount = row.follow_up_count + 1;
      const nextDelayDays = getNextDelayDaysAfterSend(newFollowUpCount);
      const nextFollowUpAt =
        nextDelayDays === null
          ? null
          : formatSqliteDate(addDays(new Date(), nextDelayDays));

      markFollowUpSentAndReschedule(
        row.id,
        newFollowUpCount,
        nextFollowUpAt
      );

      console.log(
        `Follow-up sent to ${row.contact_id}. Attempt ${newFollowUpCount}.`
      );

      if (nextFollowUpAt === null) {
        console.log(`Follow-up sequence completed for ${row.contact_id}.`);
      }

      sentCount += 1;
    } catch (error) {
      console.error(`Failed to send follow-up to ${row.contact_id}:`, error);
    }
  }

  return sentCount;
}