import { buildFollowUpMessage } from "../services/followup-message.service";

const samples = [
  "Is this for your home or business?",
  "What city or zip code is the property in?",
  "About how many cameras do you need?",
  "How soon are you looking to get this done?"
];

for (const question of samples) {
  console.log("==================================================");
  console.log("Last question:", question);
  console.log("Day 1:", buildFollowUpMessage(question, 0));
  console.log("Day 2:", buildFollowUpMessage(question, 1));
  console.log("Day 4:", buildFollowUpMessage(question, 2));
}