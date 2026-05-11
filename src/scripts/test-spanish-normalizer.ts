import { normalizeSpanishText } from "../services/spanish-normalizer.service";

const samples = [
  "ola k precio tienen las camaras",
  "Buenas, me puede dar mas información?",
  "ocupo camaras pa casa",
  "son inlambricas o alambricas?",
  "komo se ben de noche",
  "qe precio tienen",
  "q precio tienen las camaras"
];

for (const sample of samples) {
  console.log("======================================");
  console.log("Original:", sample);
  console.log("Normalized:", normalizeSpanishText(sample));
}