import { detectLanguage, detectIntent, Intent } from "./intent.service";
import { detectSpanishStyle, SpanishStyle } from "./spanish-style.service";
import { normalizeSpanishText } from "./spanish-normalizer.service";

export type SalesAction =
  | "clarify"
  | "qualify"
  | "answer_and_qualify"
  | "soft_close";

export interface SalesStrategyResult {
  language: "spanish" | "english" | "unknown";
  style: SpanishStyle | "n/a";
  intent: Intent;
  action: SalesAction;
  reason: string;
}

function looksReadyToSchedule(text: string): boolean {
  const signals = [
    "can you come",
    "when can you come",
    "schedule",
    "install this",
    "can you install",
    "puede venir",
    "pueden venir",
    "cuando puede venir",
    "cuando pueden venir",
    "instalar",
    "agendar",
    "programar",
    "fin de semana",
    "domingo",
    "sabado",
    "sábado",
  ];

  return signals.some((item) => text.includes(item));
}

function isSalesQuestionIntent(intent: Intent): boolean {
  return [
    "price",
    "info",
    "night_vision",
    "wired",
    "install_only",
    "expensive",
    "recording",
  ].includes(intent);
}

export function chooseSalesStrategy(messageText?: string): SalesStrategyResult {
  const raw = (messageText || "").toLowerCase().trim();
  const normalized = normalizeSpanishText(messageText);
  const language = detectLanguage(messageText);
  const intent = detectIntent(messageText);
  const style = language === "spanish" ? detectSpanishStyle(messageText) : "n/a";

  if (looksReadyToSchedule(raw) || looksReadyToSchedule(normalized)) {
    return {
      language,
      style,
      intent,
      action: "soft_close",
      reason: "customer looks close to scheduling",
    };
  }

  if (intent === "unknown") {
    return {
      language,
      style,
      intent,
      action: "clarify",
      reason: "intent is unclear",
    };
  }

  if (intent === "home" || intent === "business") {
    return {
      language,
      style,
      intent,
      action: "qualify",
      reason: "customer gave a qualification answer",
    };
  }

  if (isSalesQuestionIntent(intent)) {
    return {
      language,
      style,
      intent,
      action: "answer_and_qualify",
      reason: "customer asked a sales question",
    };
  }

  if (intent === "greeting") {
    return {
      language,
      style,
      intent,
      action: "qualify",
      reason: "greeting should move into qualification",
    };
  }

  if (intent === "weekend") {
    return {
      language,
      style,
      intent,
      action: "soft_close",
      reason: "customer is talking about timing and availability",
    };
  }

  return {
    language,
    style,
    intent,
    action: "qualify",
    reason: "default to qualification",
  };
}