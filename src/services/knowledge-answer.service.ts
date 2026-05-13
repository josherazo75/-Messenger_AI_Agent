import { classifyKnowledgeTopic } from "./topic-classifier.service";
import { detectLanguage } from "./intent.service";
import { getLeadByContactId } from "./lead.service";
import { normalizeSpanishText } from "./spanish-normalizer.service";
import { getConversationMessages } from "./conversation.service";

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
): string | null {
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

  return null;
}

function lastBotMessageAlreadyAskedQuestion(contactId: string): boolean {
  const history = getConversationMessages(contactId);
  const lastOutgoing = [...history]
    .reverse()
    .find((msg) => msg.direction === "outgoing");

  if (!lastOutgoing?.message_text) {
    return false;
  }

  const text = normalizeSpanishText(lastOutgoing.message_text).toLowerCase();

  return (
    text.includes("?") ||
    text.includes("is this for") ||
    text.includes("home or business") ||
    text.includes("what city") ||
    text.includes("how many cameras") ||
    text.includes("how soon") ||
    text.includes("es para casa o negocio") ||
    text.includes("en que ciudad") ||
    text.includes("en qué ciudad") ||
    text.includes("cuantas camaras") ||
    text.includes("cuántas cámaras") ||
    text.includes("que tan pronto") ||
    text.includes("qué tan pronto")
  );
}

function currentMessageLooksLikeFollowUp(messageText?: string): boolean {
  const text = normalizeSpanishText(messageText).toLowerCase().trim();

  const followUpStyleSignals = [
    "also",
    "and",
    "what about",
    "another question",
    "ok",
    "okay",
    "otra pregunta",
    "y",
    "tambien",
    "también",
    "otra cosa",
    "y otra",
    "mas informacion",
    "más información",
    "me puedes dar mas informacion",
    "me puedes dar más información",
    "que incluye",
    "qué incluye",
    "hay que pagar",
    "la aplicacion",
    "la aplicación",
    "monthly fee",
    "warranty",
    "night vision",
    "package",
  ];

  return followUpStyleSignals.some((item) => text.includes(item));
}

function shouldAppendQualificationQuestion(
  contactId: string,
  messageText: string | undefined,
  nextQuestion: string | null
): boolean {
  if (!nextQuestion) {
    return false;
  }

  const history = getConversationMessages(contactId);

  if (history.length <= 2) {
    return true;
  }

  if (lastBotMessageAlreadyAskedQuestion(contactId)) {
    return false;
  }

  if (currentMessageLooksLikeFollowUp(messageText)) {
    return false;
  }

  return true;
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

  const nextQuestion = getNextQualificationQuestion(contactId, replyLanguage);

  const reply =
    match.topic.shouldQualifyAfterAnswer &&
    shouldAppendQualificationQuestion(contactId, messageText, nextQuestion)
      ? `${baseAnswer} ${nextQuestion}`
      : baseAnswer;

  return {
    matched: true,
    topicId: match.topic.id,
    reply,
  };
}