import { classifyKnowledgeTopic } from "./topic-classifier.service";
import { detectLanguage } from "./intent.service";
import { getLeadByContactId } from "./lead.service";

export interface KnowledgeAnswerDecision {
  matched: boolean;
  topicId: string | null;
  reply: string | null;
}

function getNextQualificationQuestion(
  contactId: string,
  language: "spanish" | "english" | "unknown"
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

  const currentLanguage =
    forcedLanguage !== "unknown"
      ? forcedLanguage
      : detectLanguage(messageText);

  const isSpanish = currentLanguage === "spanish";
  const baseAnswer = isSpanish
    ? match.topic.spanishAnswer
    : match.topic.englishAnswer;

  const reply = match.topic.shouldQualifyAfterAnswer
    ? `${baseAnswer} ${getNextQualificationQuestion(contactId, currentLanguage)}`
    : baseAnswer;

  return {
    matched: true,
    topicId: match.topic.id,
    reply,
  };
}