import { containsFuzzyWord, isFuzzyMatch } from "../services/fuzzy-text.service";

const wordPairs = [
  ["moche", "noche"],
  ["pakete", "paquete"],
  ["prezio", "precio"],
  ["instalasion", "instalacion"],
  ["caro", "caro"],
  ["casa", "cosa"]
];

for (const [a, b] of wordPairs) {
  console.log("======================================");
  console.log("A:", a);
  console.log("B:", b);
  console.log("Fuzzy match:", isFuzzyMatch(a, b, 2));
}

const samples = [
  { text: "como se ven de moche", targets: ["noche"] },
  { text: "qe trae el pakete", targets: ["paquete"] },
  { text: "cuanto vale el prezio", targets: ["precio"] },
  { text: "solo la instalasion", targets: ["instalacion"] }
];

for (const sample of samples) {
  console.log("======================================");
  console.log("Text:", sample.text);
  console.log("Targets:", sample.targets.join(", "));
  console.log("Contains fuzzy word:", containsFuzzyWord(sample.text, sample.targets, 2));
}