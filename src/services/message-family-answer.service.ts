import { classifyMessageFamily } from "./message-family.service";
import { detectLanguage } from "./intent.service";
import { normalizeSpanishText } from "./spanish-normalizer.service";

export interface MessageFamilyAnswerDecision {
  matched: boolean;
  familyId: string | null;
  reply: string | null;
}

function inferLanguageFromCurrentMessage(
  messageText?: string
): "spanish" | "english" | "unknown" {
  const detected = detectLanguage(messageText);

  if (detected !== "unknown") {
    return detected;
  }

  const text = normalizeSpanishText(messageText).toLowerCase();

  const spanishSignals = [
    "cuanto",
    "cuánto",
    "me interesa",
    "estoy interesado",
    "me puede",
    "me puedes",
    "camaras",
    "cámaras",
    "negocio",
    "casa",
    "fines de semana",
    "como funciona",
    "cómo funciona",
    "se ven los cables",
  ];

  const englishSignals = [
    "how much",
    "i'm interested",
    "im interested",
    "interested",
    "how does it work",
    "weekends",
    "home",
    "business",
    "visible wires",
    "small business",
  ];

  let spanishScore = 0;
  let englishScore = 0;

  for (const signal of spanishSignals) {
    if (text.includes(signal)) {
      spanishScore += 1;
    }
  }

  for (const signal of englishSignals) {
    if (text.includes(signal)) {
      englishScore += 1;
    }
  }

  if (spanishScore > englishScore) {
    return "spanish";
  }

  if (englishScore > spanishScore) {
    return "english";
  }

  return "unknown";
}

function getReplyLanguage(
  messageText?: string,
  forcedLanguage: "spanish" | "english" | "unknown" = "unknown"
): "spanish" | "english" {
  const current = inferLanguageFromCurrentMessage(messageText);

  if (current !== "unknown") {
    return current;
  }

  if (forcedLanguage === "spanish") {
    return "spanish";
  }

  return "english";
}

export function buildMessageFamilyAnswer(
  messageText?: string,
  forcedLanguage: "spanish" | "english" | "unknown" = "unknown"
): MessageFamilyAnswerDecision {
  const match = classifyMessageFamily(messageText);

  if (!match.matched || !match.family) {
    return {
      matched: false,
      familyId: null,
      reply: null,
    };
  }

  const language = getReplyLanguage(messageText, forcedLanguage);
  const isSpanish = language === "spanish";

  const baseReply = isSpanish
    ? match.family.spanishReply
    : match.family.englishReply;

  const question =
    match.family.shouldAskQuestion
      ? isSpanish
        ? match.family.spanishQuestion ?? null
        : match.family.englishQuestion ?? null
      : null;

  return {
    matched: true,
    familyId: match.family.id,
    reply: question ? `${baseReply} ${question}` : baseReply,
  };
}