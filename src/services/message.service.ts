import { db } from "../config/database";

interface SaveMessageInput {
  senderId?: string;
  recipientId?: string;
  messageId?: string;
  messageText?: string;
  direction: "incoming" | "outgoing";
  timestamp?: number;
}

export function saveMessage(input: SaveMessageInput): boolean {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO messages (
      sender_id,
      recipient_id,
      message_id,
      message_text,
      direction,
      timestamp
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    input.senderId ?? null,
    input.recipientId ?? null,
    input.messageId ?? null,
    input.messageText ?? null,
    input.direction,
    input.timestamp ?? null
  );

  if (result.changes === 0) {
    console.log("Duplicate message ignored.");
    return false;
  }

  console.log("Message saved to database.");
  return true;
}

export function getLatestIncomingTimestamp(contactId: string): number | null {
  const stmt = db.prepare(`
    SELECT timestamp
    FROM messages
    WHERE sender_id = ?
      AND direction = 'incoming'
      AND timestamp IS NOT NULL
    ORDER BY timestamp DESC
    LIMIT 1
  `);

  const row = stmt.get(contactId) as { timestamp?: number } | undefined;

  if (!row || row.timestamp === undefined || row.timestamp === null) {
    return null;
  }

  return Number(row.timestamp);
}

export function isOutOfOrderIncomingMessage(
  contactId: string,
  incomingTimestamp?: number
): boolean {
  if (!contactId || !incomingTimestamp) {
    return false;
  }

  const latestIncomingTimestamp = getLatestIncomingTimestamp(contactId);

  if (!latestIncomingTimestamp) {
    return false;
  }

  return incomingTimestamp < latestIncomingTimestamp;
}