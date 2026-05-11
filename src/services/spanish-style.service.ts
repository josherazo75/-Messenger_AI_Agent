import { normalizeSpanishText } from "./spanish-normalizer.service";

export type SpanishStyle = "formal" | "neutral" | "simple" | "casual";

export function detectSpanishStyle(messageText?: string): SpanishStyle {
  const text = normalizeSpanishText(messageText);

  if (!text) {
    return "neutral";
  }

  const formalSignals = [
    "disculpe",
    "buenos dias",
    "buenas tardes",
    "me podria",
    "quisiera",
    "seria tan amable",
    "acerca de"
  ];

  const casualSignals = [
    "oiga jefe",
    "oiga primo",
    "compa",
    "mande",
    "nimodo",
    "alrato",
    "ahorita"
  ];

  const simpleSignals = [
    "hola que precio",
    "cuanto salen",
    "tiene camaras",
    "ocupo camaras",
    "para casa",
    "para negocio"
  ];

  const shortWords = text.split(/\s+/).filter(Boolean);
  const isVeryShort = shortWords.length <= 4;

  const hasFormalSignal = formalSignals.some((item) => text.includes(item));
  if (hasFormalSignal) {
    return "formal";
  }

  const hasCasualSignal = casualSignals.some((item) => text.includes(item));
  if (hasCasualSignal) {
    return "casual";
  }

  const hasSimpleSignal = simpleSignals.some((item) => text.includes(item));
  if (hasSimpleSignal) {
    return "simple";
  }

  const hasBasicSpanishWords =
    text.includes("cuanto") ||
    text.includes("camaras") ||
    text.includes("informacion") ||
    text.includes("alambricas") ||
    text.includes("instalacion");

  if (isVeryShort && hasBasicSpanishWords) {
    return "simple";
  }

  return "neutral";
}