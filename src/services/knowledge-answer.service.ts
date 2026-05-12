import { classifyKnowledgeTopic } from "./topic-classifier.service";
import { detectLanguage } from "./intent.service";
import { getLeadByContactId } from "./lead.service";
import { normalizeSpanishText } from "./spanish-normalizer.service";

export interface KnowledgeAnswerDecision {
  matched: boolean;
  topicId: string | null;
  reply: string | null;
}

function inferLanguageFromCurrentMessage(
  messageText?: string
): "spanish" | "english" | "unknown" {
  const detected = detectLanguage(messageText);

  if (detected !== "unknown") {
    return detected;
  }

  const text = normalizeSpanishText(messageText);

  const spanishSignals = [
    "que",
    "qué",
    "hay que",
    "de un solo",
    "en partes",
    "pagar",
    "tarjeta",
    "celular",
    "camaras",
    "cámaras",
    "graba",
    "paquete",
    "incluye",
    "negocio",
    "casa",
    "vision nocturna",
    "visión nocturna",
    "mensualidad",
    "aplicacion",
    "aplicación",
  ];

  const englishSignals = [
    "what",
    "how",
    "night",
    "recording",
    "package",
    "included",
    "monthly",
    "phone",
    "home",
    "business",
    "credit card",
    "warranty",
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
  const currentMessageLanguage = inferLanguageFromCurrentMessage(messageText);

  if (currentMessageLanguage !== "unknown") {
    return currentMessageLanguage;
  }

  if (forcedLanguage === "spanish") {
    return "spanish";
  }

  return "english";
}

function getNextQualificationQuestion(
  contactId: string,
  language: "spanish" | "english"
): string {
  const lead = getLeadByContactId(contactId);
  const isSpanish = language === "spanish";

  if (!lead?.property_type) {
    return isSpanish
      ? "¿Es para casa o negocio?"
      : "Is this for a home or a business?";
  }

  if (!lead?.city_or_zip) {
    return isSpanish
      ? "¿En qué ciudad está la propiedad?"
      : "What city is the property in?";
  }

  if (!lead?.camera_count) {
    return isSpanish
      ? "¿Cuántas cámaras ocupa?"
      : "About how many cameras do you need?";
  }

  if (!lead?.timeline) {
    return isSpanish
      ? "¿Qué tan pronto le gustaría instalar?"
      : "How soon are you looking to install?";
  }

  return isSpanish
    ? "¿Qué áreas quiere cubrir principalmente?"
    : "What areas are you mainly trying to cover?";
}

export function buildKnowledgeAnswer(
  contactId: string,
  messageText?: string,
  forcedLanguage: "spanish" | "english" | "unknown" = "unknown"
): KnowledgeAnswerDecision {
  const match = classifyKnowledgeTopic(messageText);

  if (!match.matched || !match.topic) {
    return {
      matched: false,
      topicId: null,
      reply: null,
    };
  }

  const replyLanguage = getReplyLanguage(messageText, forcedLanguage);
  const isSpanish = replyLanguage === "spanish";

  const baseAnswer = isSpanish
    ? match.topic.spanishAnswer
    : match.topic.englishAnswer;

  const reply = match.topic.shouldQualifyAfterAnswer
    ? `${baseAnswer} ${getNextQualificationQuestion(contactId, replyLanguage)}`
    : baseAnswer;

  return {
    matched: true,
    topicId: match.topic.id,
    reply,
  };
}