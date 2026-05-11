import { db } from "../config/database";

interface ConversationMessage {
  id: number;
  sender_id: string | null;
  recipient_id: string | null;
  message_id: string | null;
  message_text: string | null;
  direction: "incoming" | "outgoing";
  timestamp: number | null;
  created_at: string;
}

export function getConversationMessages(contactId: string): ConversationMessage[] {
  const stmt = db.prepare(`
    SELECT id, sender_id, recipient_id, message_id, message_text, direction, timestamp, created_at
    FROM messages
    WHERE sender_id = ? OR recipient_id = ?
    ORDER BY id ASC
  `);

  return stmt.all(contactId, contactId) as ConversationMessage[];
}