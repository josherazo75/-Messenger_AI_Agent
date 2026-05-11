import { chooseCloserMove } from "../services/closer.service";
import { detectIntent } from "../services/intent.service";

const samples = [
  "cuanto vale el prezio",
  "qe trae el pakete",
  "como se ben de moche",
  "son inlambricas o alambricas",
  "solo la instalasion",
  "se me hse mui caro",
  "para mi casa",
  "puede venir el domingo",
  "buenas"
];

for (const sample of samples) {
  const intent = detectIntent(sample);
  const closer = chooseCloserMove(intent);

  console.log("======================================");
  console.log("Message:", sample);
  console.log("Intent:", intent);
  console.log("Closer move:", closer.move);
  console.log("Reason:", closer.reason);
}