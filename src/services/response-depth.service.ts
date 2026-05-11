export type ResponseDepthLevel =
  | "level_1_very_light"
  | "level_2_light_sales_framing"
  | "level_3_problem_solution"
  | "level_4_closing_handoff";

export type ResponseDepthReason =
  | "vague_message"
  | "basic_context"
  | "emotional_signal"
  | "confusion_signal"
  | "buying_signal"
  | "resistance_signal"
  | "comeback_signal"
  | "default_light";

export interface ResponseDepthResult {
  level: ResponseDepthLevel;
  reason: ResponseDepthReason;
  confidence: "low" | "medium" | "high";
  signals: string[];
}

function normalize(text?: string): string {
  return (text || "").toLowerCase().trim();
}

function includesAny(text: string, values: string[]): string[] {
  return values.filter((value) => text.includes(value));
}

export function detectResponseDepth(messageText?: string): ResponseDepthResult {
  const text = normalize(messageText);

  if (!text) {
    return {
      level: "level_1_very_light",
      reason: "vague_message",
      confidence: "high",
      signals: [],
    };
  }

  const vagueSignals = includesAny(text, [
    "info",
    "precio",
    "price",
    "cuanto",
    "cuánto",
    "still available",
    "is this available",
    "available",
    "me interesa",
    "interested",
    "quote",
    "qoute",
    "mas info",
    "más info",
  ]);

  const basicContextSignals = includesAny(text, [
    "house",
    "home",
    "casa",
    "business",
    "negocio",
    "bakersfield",
    "4 cameras",
    "5 cameras",
    "6 cameras",
    "4 camaras",
    "5 camaras",
    "6 camaras",
    "para mi casa",
    "para casa",
    "para negocio",
    "front",
    "backyard",
    "yarda",
    "yarda",
    "patio",
    "frente",
  ]);

  const emotionalSignals = includesAny(text, [
    "me robaron",
    "robaron",
    "theft",
    "stolen",
    "broke into",
    "broke in",
    "catalytic converter",
    "neighbor was robbed",
    "neighbor dispute",
    "disputa",
    "evidence",
    "evidencia",
    "protect my family",
    "suspicious",
    "activity",
    "safety",
    "seguridad",
    "se metieron",
    "me preocupa",
    "quiero proteger",
  ]);

  const confusionSignals = includesAny(text, [
    "no se cuantas necesito",
    "no se cuántas necesito",
    "no se como funciona",
    "no sé cómo funciona",
    "no entiendo",
    "que me recomienda",
    "qué me recomienda",
    "how does this work",
    "how it works",
    "what do you recommend",
    "what do i need",
    "how does it look",
    "what does it look like",
    "que incluye",
    "qué incluye",
  ]);

  const buyingSignals = includesAny(text, [
    "cuando puede",
    "cuando pueden",
    "cuándo puede",
    "cuándo pueden",
    "can you come",
    "when can you come",
    "when can you install",
    "you still coming today",
    "today",
    "tomorrow",
    "mañana",
    "manana",
    "esta semana",
    "this week",
    "accept card",
    "take card",
    "aceptan tarjeta",
    "address",
    "direccion",
    "dirección",
    "my phone number",
    "mi numero",
    "mi número",
    "quiero instalar",
    "ready",
    "book",
    "schedule",
    "agendar",
  ]);

  const resistanceSignals = includesAny(text, [
    "too expensive",
    "expensive",
    "esta caro",
    "está caro",
    "caro",
    "found cheaper",
    "encontre mas barato",
    "encontré más barato",
    "best price",
    "lo menos",
    "discount",
    "descuento",
    "i'll think about it",
    "lo voy a pensar",
    "thanks",
    "got it",
    "out of my budget",
    "over my budget",
    "my budget is",
    "i wish it around",
    "wish it was around",
  ]);

  const comebackSignals = includesAny(text, [
    "i'm interested now",
    "im interested now",
    "still interested now",
    "ready now",
    "quiero hacerlo ya",
    "ya me interese",
    "ya me interesé",
    "ya estoy listo",
    "ya estoy lista",
    "cuando puede venir",
    "quiero seguir",
  ]);

  if (buyingSignals.length > 0) {
    return {
      level: "level_4_closing_handoff",
      reason: "buying_signal",
      confidence: "high",
      signals: buyingSignals,
    };
  }

  if (comebackSignals.length > 0) {
    return {
      level: "level_4_closing_handoff",
      reason: "comeback_signal",
      confidence: "medium",
      signals: comebackSignals,
    };
  }

  if (emotionalSignals.length > 0) {
    return {
      level: "level_3_problem_solution",
      reason: "emotional_signal",
      confidence: "high",
      signals: emotionalSignals,
    };
  }

  if (confusionSignals.length > 0) {
    return {
      level: "level_3_problem_solution",
      reason: "confusion_signal",
      confidence: "high",
      signals: confusionSignals,
    };
  }

  if (resistanceSignals.length > 0) {
    return {
      level: "level_3_problem_solution",
      reason: "resistance_signal",
      confidence: "high",
      signals: resistanceSignals,
    };
  }

  if (basicContextSignals.length > 0) {
    return {
      level: "level_2_light_sales_framing",
      reason: "basic_context",
      confidence: "medium",
      signals: basicContextSignals,
    };
  }

  if (vagueSignals.length > 0 || text.split(/\s+/).length <= 2) {
    return {
      level: "level_1_very_light",
      reason: "vague_message",
      confidence: "medium",
      signals: vagueSignals,
    };
  }

  return {
    level: "level_2_light_sales_framing",
    reason: "default_light",
    confidence: "low",
    signals: [],
  };
}