import "dotenv/config";
import { exportDailySummaryReport } from "../services/report.service";

function getDateArg(): string | undefined {
  const rawArg = process.argv[2];
  return rawArg ? rawArg.trim() : undefined;
}

function main(): void {
  try {
    const dateArg = getDateArg();
    const result = exportDailySummaryReport(dateArg);

    console.log("Daily summary report exported successfully.");
    console.log(`Date: ${result.date}`);
    console.log(`Total messages: ${result.totalMessages}`);
    console.log(`Incoming messages: ${result.incomingMessages}`);
    console.log(`Outgoing messages: ${result.outgoingMessages}`);
    console.log(`Unique contacts: ${result.uniqueContacts}`);
    console.log(`Leads created: ${result.leadsCreated}`);
    console.log(`Leads updated: ${result.leadsUpdated}`);
    console.log(`Handoffs marked: ${result.handoffsMarked}`);
    console.log(`Follow-ups pending now: ${result.followUpsPending}`);
    console.log(`Follow-ups completed today: ${result.followUpsCompleted}`);
    console.log(`Follow-ups stopped today: ${result.followUpsStopped}`);
    console.log(`Summary path: ${result.summaryPath}`);
  } catch (error) {
    console.error("Failed to export daily summary report:", error);
    process.exit(1);
  }
}

main();