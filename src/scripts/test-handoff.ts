import { decideHandoff } from "../services/handoff.service";
import { scoreLead } from "../services/lead-scoring.service";

const samples = [
  "how much",
  "do you take card",
  "can you come today",
  "I need 6 cameras for a warehouse",
  "Ocupo camaras para una yarda grande donde guardo troques",
  "¿Me puede dar precio exacto?",
  "My phone number is 661-742-9563",
  "Se puede instalar hoy",
];

for (const sample of samples) {
  const score = scoreLead(sample, null);
  const handoff = decideHandoff(sample, null);

  console.log("======================================");
  console.log("Message:", sample);
  console.log("Temperature:", score.temperature);
  console.log("Score:", score.score);
  console.log("Reasons:", score.reasons.join(" | "));
  console.log("Should handoff:", handoff.shouldHandoff);
  console.log("Handoff reason:", handoff.reason);
  console.log("Handoff message:", handoff.message);
}