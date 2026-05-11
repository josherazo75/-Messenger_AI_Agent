import { detectResponseDepth } from "../services/response-depth.service";

const samples = [
  "Precio?",
  "Still available?",
  "Para mi casa",
  "Cuánto por 4 cámaras?",
  "Me robaron y quiero cubrir toda la casa",
  "No sé cuántas necesito",
  "Qué me recomienda?",
  "Está caro",
  "Found cheaper",
  "¿Cuándo pueden venir?",
  "Do you take card?",
  "My phone number is 661-742-9563",
  "Ya estoy listo para instalar",
  "How does this work?",
  "How does it look?",
];

for (const sample of samples) {
  const result = detectResponseDepth(sample);

  console.log("======================================");
  console.log("Message:", sample);
  console.log("Level:", result.level);
  console.log("Reason:", result.reason);
  console.log("Confidence:", result.confidence);
  console.log("Signals:", result.signals.join(", "));
}