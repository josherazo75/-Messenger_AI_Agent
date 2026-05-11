import "dotenv/config";
import { processDueFollowUps } from "../services/followup.service";

async function main(): Promise<void> {
  try {
    const sentCount = await processDueFollowUps();
    console.log(`Done. Follow-ups sent: ${sentCount}`);
  } catch (error) {
    console.error("Failed to process due follow-ups:", error);
    process.exit(1);
  }
}

void main();