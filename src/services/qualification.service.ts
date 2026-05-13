import { getConversationMessages } from "./conversation.service";
import { buildReply } from "./reply.service";
import { normalizeSpanishText } from "./spanish-normalizer.service";
import { chooseSalesStrategy } from "./sales-strategy.service";
import { chooseCloserMove } from "./closer.service";
import { detectLanguage } from "./intent.service";
import { buildPostQualificationClose } from "./post-qualification.service";
import { decideHandoff } from "./handoff.service";
import { scoreLead } from "./lead-scoring.service";
import {
  detectPropertyComplexity,
  buildComplexityReply,
} from "./property-complexity.service";
import { buildScenarioReasoningReply } from "./scenario-reasoning.service";
import { buildNegotiationReply } from "./negotiation-rules.service";
import { buildBookingClosingReply } from "./booking-closing.service";
import { buildKnowledgeAnswer } from "./knowledge-answer.service";
import { buildHotLeadEstimateReply } from "./hot-lead-estimate.service";
import { buildMessageFamilyAnswer } from "./message-family-answer.service";
import {
  ensureLead,
  getLeadByContactId,
  updateLeadPropertyType,
  updateLeadCityOrZip,
  updateLeadCameraCount,
  updateLeadTimeline,
  updateLeadScoring,
  updateLeadHandoffStatus,
} from "./lead.service";

function normalize(text?: string): string {
  return (text || "").trim().toLowerCase();
}

function isHomeAnswer(text: string): boolean {
  return ["home", "house", "casa", "hogar"].includes(text);
}

function isBusinessAnswer(text: string): boolean {
  return ["business", "commercial", "negocio", "empresa"].includes(text);
}

function looksLikeCameraCount(text: string): boolean {
  return /^\d+$/.test(text);
}

function looksLikeTimelineAnswer(text?: string): boolean {
  const value = normalizeSpanishText(text);

  return (
    value.includes("hoy") ||
    value.includes("mañana") ||
    value.includes("manana") ||
    value.includes("esta semana") ||
    value.includes("este fin de semana") ||
    value.includes("la proxima semana") ||
    value.includes("la próxima semana") ||
    value.includes("pronto") ||
    value.includes("asap") ||
    value.includes("this week") ||
    value.includes("tomorrow") ||
    value.includes("today") ||
    value.includes("next week") ||
    value.includes("weekend") ||
    value.includes("fin de semana")
  );
}

function getConversationLanguage(
  contactId: string,
  incomingText?: string
): "spanish" | "english" | "unknown" {
  const current = detectLanguage(incomingText);

  if (current !== "unknown") {
    return current;
  }

  const history = getConversationMessages(contactId);

  for (let i = history.length - 1; i >= 0; i -= 1) {
    const detected = detectLanguage(history[i].message_text || "");
    if (detected !== "unknown") {
      return detected;
    }
  }

  return "unknown";
}

function getLocalizedQuestion(
  key: "property_type" | "city" | "camera_count" | "timeline",
  language: "spanish" | "english" | "unknown"
): string {
  const isSpanish = language === "spanish";

  if (key === "property_type") {
    return isSpanish
      ? "¿Es para casa o negocio?"
      : "Is this for your home or business?";
  }

  if (key === "city") {
    return isSpanish
      ? "¿En qué ciudad está la propiedad?"
      : "What city is the property in?";
  }

  if (key === "camera_count") {
    return isSpanish
      ? "¿Cuántas cámaras ocupa?"
      : "About how many cameras do you need?";
  }

  return isSpanish
    ? "¿Qué tan pronto le gustaría instalar?"
    : "How soon are you looking to install?";
}

function getNextMissingQuestion(
  contactId: string,
  language: "spanish" | "english" | "unknown"
): string | null {
  const lead = getLeadByContactId(contactId);

  if (!lead) {
    return getLocalizedQuestion("property_type", language);
  }

  if (!lead.property_type) {
    return getLocalizedQuestion("property_type", language);
  }

  if (!lead.city_or_zip) {
    return getLocalizedQuestion("city", language);
  }

  if (!lead.camera_count) {
    return getLocalizedQuestion("camera_count", language);
  }

  if (!lead.timeline) {
    return getLocalizedQuestion("timeline", language);
  }

  return null;
}

function buildSoftCloseReply(contactId: string, incomingText?: string): string {
  const text = normalizeSpanishText(incomingText);
  const language = getConversationLanguage(contactId, incomingText);
  const nextMissing = getNextMissingQuestion(contactId, language);

  if (nextMissing) {
    return nextMissing;
  }

  if (
    text.includes("domingo") ||
    text.includes("sabado") ||
    text.includes("sábado") ||
    text.includes("fin de semana") ||
    text.includes("puede venir") ||
    text.includes("pueden venir")
  ) {
    return language === "spanish"
      ? "Puedo revisar disponibilidad. ¿Cuál es el mejor número para comunicarnos?"
      : "I can check availability. What is the best phone number to reach you?";
  }

  return buildReply(incomingText, contactId);
}

function applyCloserMove(
  contactId: string,
  baseReply: string,
  move:
    | "ask_property_type"
    | "ask_city"
    | "ask_camera_count"
    | "offer_schedule"
    | "offer_budget_option"
    | "none",
  language: "spanish" | "english" | "unknown"
): string {
  const reply = normalize(baseReply);
  const nextMissing = getNextMissingQuestion(contactId, language);

  if (move === "none") {
    return baseReply;
  }

  if (move === "offer_budget_option") {
    if (language === "spanish") {
      return "Entiendo. También le puedo dar una opción más económica si quiere. ¿Cuántas cámaras ocupa y es para casa o negocio?";
    }

    return "I understand. I can also give you a more budget-friendly option if you want. About how many cameras do you need, and is this for your home or business?";
  }

  if (move === "offer_schedule") {
    if (language === "spanish") {
      return "Puedo revisar disponibilidad. ¿Cuál es el mejor número para comunicarnos?";
    }

    return "I can check availability. What is the best phone number to reach you?";
  }

  if (!nextMissing) {
    return baseReply;
  }

  const normalizedNext = normalize(nextMissing);

  if (reply.includes(normalizedNext)) {
    return baseReply;
  }

  const alreadyAsksPropertyType =
    reply.includes("casa o negocio") ||
    reply.includes("es para casa o negocio") ||
    reply.includes("home or business") ||
    reply.includes("house or a business") ||
    reply.includes("house or business") ||
    reply.includes("is it for a house or a business") ||
    reply.includes("is this for your home or business");

  const alreadyAsksCity =
    reply.includes("ciudad") ||
    reply.includes("codigo postal") ||
    reply.includes("código postal") ||
    reply.includes("city") ||
    reply.includes("zip") ||
    reply.includes("what city is the property in");

  const alreadyAsksCameraCount =
    reply.includes("cuantas camaras") ||
    reply.includes("cuántas cámaras") ||
    reply.includes("cuantas serian") ||
    reply.includes("cuántas serían") ||
    reply.includes("how many cameras") ||
    reply.includes("about how many cameras do you need");

  const alreadyAsksTimeline =
    reply.includes("que tan pronto") ||
    reply.includes("qué tan pronto") ||
    reply.includes("how soon") ||
    reply.includes("when are you looking to install");

  if (
    ((normalizedNext.includes("casa o negocio") ||
      normalizedNext.includes("home or business") ||
      normalizedNext.includes("house or business")) &&
      alreadyAsksPropertyType) ||
    ((normalizedNext.includes("ciudad") ||
      normalizedNext.includes("codigo postal") ||
      normalizedNext.includes("código postal") ||
      normalizedNext.includes("city") ||
      normalizedNext.includes("zip")) &&
      alreadyAsksCity) ||
    ((normalizedNext.includes("cuantas camaras") ||
      normalizedNext.includes("cuántas cámaras") ||
      normalizedNext.includes("how many cameras")) &&
      alreadyAsksCameraCount) ||
    ((normalizedNext.includes("que tan pronto") ||
      normalizedNext.includes("qué tan pronto") ||
      normalizedNext.includes("how soon")) &&
      alreadyAsksTimeline)
  ) {
    return baseReply;
  }

  return `${baseReply} ${nextMissing}`;
}

export function buildQualifiedReply(contactId: string, incomingText?: string): string {
  ensureLead(contactId);

  const rawText = normalize(incomingText);
  const normalizedSpanishText = normalizeSpanishText(incomingText);
  const strategy = chooseSalesStrategy(incomingText);
  const conversationLanguage = getConversationLanguage(contactId, incomingText);
  const closer = chooseCloserMove(strategy.intent);
  const lead = getLeadByContactId(contactId);
  const history = getConversationMessages(contactId);

  const leadScore = scoreLead(incomingText, lead);
  updateLeadScoring(contactId, leadScore.temperature, leadScore.score);

  const bookingDecision = buildBookingClosingReply(
    incomingText,
    lead,
    conversationLanguage
  );

  if (bookingDecision.reply) {
    if (bookingDecision.shouldHandoff) {
      updateLeadHandoffStatus(contactId, true, bookingDecision.reason);
    } else {
      updateLeadHandoffStatus(contactId, false);
    }

    return bookingDecision.reply;
  }

  const hotLeadDecision = buildHotLeadEstimateReply(
    incomingText,
    lead,
    conversationLanguage
  );

  if (hotLeadDecision.reply) {
    if (hotLeadDecision.shouldHandoff) {
      updateLeadHandoffStatus(contactId, true, hotLeadDecision.reason);
    }

    return hotLeadDecision.reply;
  }

  const knowledgeDecision = buildKnowledgeAnswer(
    contactId,
    incomingText,
    conversationLanguage
  );

  if (knowledgeDecision.reply) {
    return knowledgeDecision.reply;
  }

  const familyDecision = buildMessageFamilyAnswer(
    incomingText,
    conversationLanguage
  );

  if (familyDecision.reply) {
    return familyDecision.reply;
  }

  const handoffDecision = decideHandoff(incomingText, lead);
  if (handoffDecision.shouldHandoff) {
    updateLeadHandoffStatus(contactId, true, handoffDecision.reason);
    return handoffDecision.message;
  }

  updateLeadHandoffStatus(contactId, false);

  const complexity = detectPropertyComplexity(incomingText);
  if (complexity.level !== "standard") {
    const complexityReply = buildComplexityReply(
      incomingText,
      conversationLanguage
    );

    if (complexityReply) {
      return complexityReply;
    }
  }

  const scenarioReasoning = buildScenarioReasoningReply(
    incomingText,
    conversationLanguage
  );

  if (
    scenarioReasoning.reply &&
    (scenarioReasoning.family === "layout_access" ||
      scenarioReasoning.family === "distance" ||
      scenarioReasoning.family === "custom_risky_technical")
  ) {
    return scenarioReasoning.reply;
  }

  const negotiation = buildNegotiationReply(
    incomingText,
    lead,
    conversationLanguage
  );

  if (negotiation.reply) {
    if (negotiation.shouldHandoff) {
      updateLeadHandoffStatus(contactId, true, negotiation.reason);
    }

    return negotiation.reply;
  }

  if (lead) {
    if (!lead.property_type) {
      if (isHomeAnswer(rawText) || isHomeAnswer(normalizedSpanishText)) {
        updateLeadPropertyType(contactId, "home");
        return conversationLanguage === "spanish"
          ? "Perfecto. ¿En qué ciudad o código postal está la casa?"
          : getLocalizedQuestion("city", conversationLanguage);
      }

      if (isBusinessAnswer(rawText) || isBusinessAnswer(normalizedSpanishText)) {
        updateLeadPropertyType(contactId, "business");
        return conversationLanguage === "spanish"
          ? "Perfecto. ¿En qué ciudad o código postal está el negocio?"
          : getLocalizedQuestion("city", conversationLanguage);
      }
    } else if (!lead.city_or_zip) {
      if (rawText) {
        updateLeadCityOrZip(contactId, incomingText?.trim() || "");
        return getLocalizedQuestion("camera_count", conversationLanguage);
      }
    } else if (!lead.camera_count) {
      if (looksLikeCameraCount(rawText) || looksLikeCameraCount(normalizedSpanishText)) {
        updateLeadCameraCount(contactId, incomingText?.trim() || "");
        return getLocalizedQuestion("timeline", conversationLanguage);
      }
    } else if (!lead.timeline) {
      if (rawText && (looksLikeTimelineAnswer(rawText) || !looksLikeCameraCount(rawText))) {
        updateLeadTimeline(contactId, incomingText?.trim() || "");

        const updatedLead = getLeadByContactId(contactId);
        const finalHandoff = decideHandoff(incomingText, updatedLead);

        if (finalHandoff.shouldHandoff) {
          updateLeadHandoffStatus(contactId, true, finalHandoff.reason);
          return finalHandoff.message;
        }

        return buildPostQualificationClose({
          propertyType: updatedLead?.property_type ?? null,
          cityOrZip: updatedLead?.city_or_zip ?? null,
          cameraCount: updatedLead?.camera_count ?? null,
          timeline: updatedLead?.timeline ?? incomingText ?? null,
          language: conversationLanguage,
        });
      }
    }
  }

  const lastOutgoing = [...history].reverse().find((msg) => msg.direction === "outgoing");

  if (!lastOutgoing) {
    if (strategy.action === "soft_close") {
      return buildSoftCloseReply(contactId, incomingText);
    }

    if (strategy.action === "answer_and_qualify") {
      const baseReply = buildReply(incomingText, contactId);
      return applyCloserMove(contactId, baseReply, closer.move, conversationLanguage);
    }

    return buildReply(incomingText, contactId);
  }

  if (strategy.action === "clarify") {
    return buildReply(incomingText, contactId);
  }

  if (strategy.action === "answer_and_qualify") {
    const baseReply = buildReply(incomingText, contactId);
    return applyCloserMove(contactId, baseReply, closer.move, conversationLanguage);
  }

  if (strategy.action === "soft_close") {
    return buildSoftCloseReply(contactId, incomingText);
  }

  return buildReply(incomingText, contactId);
}