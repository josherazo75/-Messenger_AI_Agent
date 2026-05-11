import { chooseSalesStrategy } from "../services/sales-strategy.service";

const samples = [
  "Ola que prexio tienen las camaras",
  "me puede dar mas info",
  "Como se ben de noche",
  "son inlambricas o alambricas",
  "si yo pongo las camaras cuanto me cobra",
  "se me hace mui caro",
  "para mi casa",
  "Buenas",
  "puede venir el domingo",
  "Tomo se ven de noche",
  "qe trae el pakete",
  "como se ben de moche",
  "cuanto vale el prezio",
  "solo la instalasion"
];

for (const sample of samples) {
  const result = chooseSalesStrategy(sample);

  console.log("======================================");
  console.log("Message:", sample);
  console.log("Language:", result.language);
  console.log("Style:", result.style);
  console.log("Intent:", result.intent);
  console.log("Action:", result.action);
  console.log("Reason:", result.reason);
}