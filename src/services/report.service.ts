import fs from "fs";
import path from "path";
import { db } from "../config/database";

export interface MessageRow {
  id: number;
  sender_id: string | null;
  recipient_id: string | null;
  message_id: string | null;
  message_text: string | null;
  direction: "incoming" | "outgoing";
  timestamp: number | null;
  created_at?: string | null;
}

export interface DailyMessagesSummary {
  date: string;
  totalMessages: number;
  incomingMessages: number;
  outgoingMessages: number;
  uniqueContacts: number;
  csvPath: string;
}

export interface DailySummaryReport {
  date: string;
  totalMessages: number;
  incomingMessages: number;
  outgoingMessages: number;
  uniqueContacts: number;
  leadsCreated: number;
  leadsUpdated: number;
  handoffsMarked: number;
  followUpsPending: number;
  followUpsCompleted: number;
  followUpsStopped: number;
  topContacts: Array<{
    contactId: string;
    messageCount: number;
    incomingCount: number;
    outgoingCount: number;
  }>;
  summaryPath: string;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function formatDateLocal(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseReportDate(input?: string): Date {
  if (!input) {
    return new Date();
  }

  const match = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    throw new Error("Invalid date format. Use YYYY-MM-DD.");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function getDayRangeMs(input?: string): {
  dateLabel: string;
  startMs: number;
  endMs: number;
} {
  const date = parseReportDate(input);
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);

  return {
    dateLabel: formatDateLocal(start),
    startMs: start.getTime(),
    endMs: end.getTime(),
  };
}

function getDayRangeSql(input?: string): {
  dateLabel: string;
  startSql: string;
  endSql: string;
} {
  const date = parseReportDate(input);
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);

  const toSql = (value: Date): string =>
    `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;

  return {
    dateLabel: formatDateLocal(start),
    startSql: toSql(start),
    endSql: toSql(end),
  };
}

function formatTimestamp(timestamp?: number | null): string {
  if (!timestamp) {
    return "";
  }

  const date = new Date(timestamp);
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const ss = pad(date.getSeconds());

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

function escapeCsv(value: unknown): string {
  const stringValue = value == null ? "" : String(value);
  const escaped = stringValue.replace(/"/g, '""');
  return `"${escaped}"`;
}

function ensureReportsDir(): string {
  const reportsDir = path.resolve(process.cwd(), "reports");
  fs.mkdirSync(reportsDir, { recursive: true });
  return reportsDir;
}

export function getDailyMessages(dateInput?: string): {
  date: string;
  rows: MessageRow[];
} {
  const { dateLabel, startMs, endMs } = getDayRangeMs(dateInput);

  const rows = db.prepare(`
    SELECT
      id,
      sender_id,
      recipient_id,
      message_id,
      message_text,
      direction,
      timestamp,
      created_at
    FROM messages
    WHERE timestamp IS NOT NULL
      AND timestamp >= ?
      AND timestamp < ?
    ORDER BY timestamp ASC, id ASC
  `).all(startMs, endMs) as MessageRow[];

  return {
    date: dateLabel,
    rows,
  };
}

export function exportDailyMessagesCsv(dateInput?: string): DailyMessagesSummary {
  const { date, rows } = getDailyMessages(dateInput);
  const reportsDir = ensureReportsDir();
  const filePath = path.join(reportsDir, `daily-messages-${date}.csv`);

  const header = [
    "id",
    "direction",
    "sender_id",
    "recipient_id",
    "message_id",
    "message_text",
    "timestamp_ms",
    "timestamp_local",
  ];

  const csvLines = [
    header.join(","),
    ...rows.map((row) =>
      [
        escapeCsv(row.id),
        escapeCsv(row.direction),
        escapeCsv(row.sender_id),
        escapeCsv(row.recipient_id),
        escapeCsv(row.message_id),
        escapeCsv(row.message_text),
        escapeCsv(row.timestamp),
        escapeCsv(formatTimestamp(row.timestamp)),
      ].join(",")
    ),
  ];

  fs.writeFileSync(filePath, csvLines.join("\n"), "utf8");

  const incomingMessages = rows.filter((row) => row.direction === "incoming").length;
  const outgoingMessages = rows.filter((row) => row.direction === "outgoing").length;

  const uniqueContacts = new Set(
    rows
      .flatMap((row) => [row.sender_id, row.recipient_id])
      .filter((value): value is string => Boolean(value))
      .filter((value) => value !== (process.env.META_PAGE_ID || "page"))
  ).size;

  return {
    date,
    totalMessages: rows.length,
    incomingMessages,
    outgoingMessages,
    uniqueContacts,
    csvPath: filePath,
  };
}

export function exportDailySummaryReport(dateInput?: string): DailySummaryReport {
  const { dateLabel, startSql, endSql } = getDayRangeSql(dateInput);
  const { rows } = getDailyMessages(dateInput);
  const reportsDir = ensureReportsDir();
  const summaryPath = path.join(reportsDir, `daily-summary-${dateLabel}.txt`);

  const incomingMessages = rows.filter((row) => row.direction === "incoming").length;
  const outgoingMessages = rows.filter((row) => row.direction === "outgoing").length;

  const pageId = process.env.META_PAGE_ID || "page";

  const contactStats = new Map<
    string,
    { messageCount: number; incomingCount: number; outgoingCount: number }
  >();

  for (const row of rows) {
    const contactId =
      row.direction === "incoming" ? row.sender_id : row.recipient_id;

    if (!contactId || contactId === pageId) {
      continue;
    }

    const current = contactStats.get(contactId) ?? {
      messageCount: 0,
      incomingCount: 0,
      outgoingCount: 0,
    };

    current.messageCount += 1;

    if (row.direction === "incoming") {
      current.incomingCount += 1;
    } else {
      current.outgoingCount += 1;
    }

    contactStats.set(contactId, current);
  }

  const topContacts = [...contactStats.entries()]
    .map(([contactId, stats]) => ({
      contactId,
      messageCount: stats.messageCount,
      incomingCount: stats.incomingCount,
      outgoingCount: stats.outgoingCount,
    }))
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, 10);

  const leadsCreatedRow = db.prepare(`
    SELECT COUNT(*) as count
    FROM leads
    WHERE created_at >= ?
      AND created_at < ?
  `).get(startSql, endSql) as { count: number };

  const leadsUpdatedRow = db.prepare(`
    SELECT COUNT(*) as count
    FROM leads
    WHERE updated_at >= ?
      AND updated_at < ?
  `).get(startSql, endSql) as { count: number };

  const handoffsMarkedRow = db.prepare(`
    SELECT COUNT(*) as count
    FROM leads
    WHERE handoff_needed = 1
      AND handoff_at IS NOT NULL
      AND handoff_at >= ?
      AND handoff_at < ?
  `).get(startSql, endSql) as { count: number };

  const followUpsPendingRow = db.prepare(`
    SELECT COUNT(*) as count
    FROM follow_ups
    WHERE status = 'pending'
  `).get() as { count: number };

  const followUpsCompletedRow = db.prepare(`
    SELECT COUNT(*) as count
    FROM follow_ups
    WHERE status = 'completed'
      AND updated_at >= ?
      AND updated_at < ?
  `).get(startSql, endSql) as { count: number };

  const followUpsStoppedRow = db.prepare(`
    SELECT COUNT(*) as count
    FROM follow_ups
    WHERE status = 'stopped'
      AND updated_at >= ?
      AND updated_at < ?
  `).get(startSql, endSql) as { count: number };

  const uniqueContacts = contactStats.size;

  const summaryLines = [
    `Daily Summary Report`,
    `Date: ${dateLabel}`,
    ``,
    `Messages`,
    `- Total: ${rows.length}`,
    `- Incoming: ${incomingMessages}`,
    `- Outgoing: ${outgoingMessages}`,
    `- Unique contacts: ${uniqueContacts}`,
    ``,
    `Leads`,
    `- Leads created: ${leadsCreatedRow.count}`,
    `- Leads updated: ${leadsUpdatedRow.count}`,
    `- Handoffs marked: ${handoffsMarkedRow.count}`,
    ``,
    `Follow-ups`,
    `- Pending now: ${followUpsPendingRow.count}`,
    `- Completed today: ${followUpsCompletedRow.count}`,
    `- Stopped today: ${followUpsStoppedRow.count}`,
    ``,
    `Top Contacts`,
    ...(topContacts.length === 0
      ? [`- None`]
      : topContacts.map(
          (item, index) =>
            `${index + 1}. ${item.contactId} — total: ${item.messageCount}, incoming: ${item.incomingCount}, outgoing: ${item.outgoingCount}`
        )),
    ``,
  ];

  fs.writeFileSync(summaryPath, summaryLines.join("\n"), "utf8");

  return {
    date: dateLabel,
    totalMessages: rows.length,
    incomingMessages,
    outgoingMessages,
    uniqueContacts,
    leadsCreated: leadsCreatedRow.count,
    leadsUpdated: leadsUpdatedRow.count,
    handoffsMarked: handoffsMarkedRow.count,
    followUpsPending: followUpsPendingRow.count,
    followUpsCompleted: followUpsCompletedRow.count,
    followUpsStopped: followUpsStoppedRow.count,
    topContacts,
    summaryPath,
  };
}