import { HANDOFF_RULES } from "../config/handoff-rules";
import { detectLanguage } from "./intent.service";
import { normalizeSpanishText } from "./spanish-normalizer.service";
import { LeadRecord } from "./lead.service";
import { scoreLead } from "./lead-scoring.service";

export interface HandoffDecision {
  shouldHandoff: boolean;
  reason: string;
  message: string;
}

function normalize(text?: string): string {
  return (text || "").toLowerCase().trim();
}

function inferLanguage(messageText?: string): "spanish" | "english" | "unknown" {
  const detected = detectLanguage(messageText);

  if (detected !== "unknown") {
    return detected;
  }

  const text = normalizeSpanishText(messageText);

  const spanishHints = [
    "se puede",
    "instalar",
    "hoy",
    "mañana",
    "manana",
    "precio",
    "negocio",
    "casa",
    "tarjeta",
    "pagos",
    "mensualidad",
    "celular",
    "yarda",
    "bodega",
  ];

  if (spanishHints.some((item) => text.includes(item))) {
    return "spanish";
  }

  return "unknown";
}

function hasPhoneNumber(text: string): boolean {
  return /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/.test(text);
}

function buildHandoffMessage(
  language: "spanish" | "english" | "unknown",
  alreadyHasPhone: boolean
): string {
  if (alreadyHasPhone) {
    if (language === "spanish") {
      return "Perfecto, gracias. Yo le puedo ayudar con la información básica aquí, y el instalador le puede dar seguimiento directo para confirmar precio exacto y horario.";
    }

    return "Perfect, thank you. I can help with the basic info here, and the installer can follow up directly to confirm the exact price and schedule.";
  }

  if (language === "spanish") {
    return HANDOFF_RULES.spanishHandoffMessage;
  }

  return HANDOFF_RULES.englishHandoffMessage;
}

function detectCameraCount(text: string): number | null {
  const phoneInText = hasPhoneNumber(text);

  if (phoneInText) {
    return null;
  }

  const match = text.match(/\b(\d{1,2})\b/);
  if (!match) {
    return null;
  }

  const value = Number(match[1]);

  if (value < 1 || value > 32) {
    return null;
  }

  return value;
}

function hasAddress(text: string): boolean {
  return /\b\d{3,6}\s+[a-z0-9]+\s+(st|street|ave|avenue|rd|road|dr|drive|blvd|lane|ln|court|ct)\b/i.test(
    text
  );
}

export function decideHandoff(
  messageText?: string,
  lead?: LeadRecord | null
): HandoffDecision {
  const raw = normalize(messageText);
  const normalized = normalizeSpanishText(messageText);
  const merged = `${raw} ${normalized}`.trim();
  const language = inferLanguage(messageText);
  const customerSentPhone = hasPhoneNumber(merged);
  const handoffMessage = buildHandoffMessage(language, customerSentPhone);
  const leadScore = scoreLead(messageText, lead);

  const cameraCount = detectCameraCount(merged);

  if (HANDOFF_RULES.triggerWhenCustomerSendsPhoneNumber && customerSentPhone) {
    return {
      shouldHandoff: true,
      reason: "customer sent phone number",
      message: handoffMessage,
    };
  }

  if (HANDOFF_RULES.triggerWhenCustomerSendsAddress && hasAddress(merged)) {
    return {
      shouldHandoff: true,
      reason: "customer sent address",
      message: handoffMessage,
    };
  }

  if (
    HANDOFF_RULES.triggerWhenCustomerWantsToSchedule &&
    (
      merged.includes("schedule") ||
      merged.includes("appointment") ||
      merged.includes("can you come") ||
      merged.includes("what time can you come") ||
      merged.includes("same day") ||
      merged.includes("today") ||
      merged.includes("tomorrow") ||
      merged.includes("agendar") ||
      merged.includes("cita") ||
      merged.includes("puede venir") ||
      merged.includes("pueden venir") ||
      merged.includes("cuando puede venir") ||
      merged.includes("cuando pueden venir") ||
      merged.includes("instalar hoy") ||
      merged.includes("se puede instalar hoy") ||
      merged.includes("hoy") ||
      merged.includes("mañana") ||
      merged.includes("manana")
    )
  ) {
    return {
      shouldHandoff: true,
      reason: "customer wants scheduling",
      message: handoffMessage,
    };
  }

  if (
    HANDOFF_RULES.triggerWhenCustomerAsksForExactFinalQuote &&
    (
      merged.includes("exact quote") ||
      merged.includes("exact price") ||
      merged.includes("final price") ||
      merged.includes("precio exacto") ||
      merged.includes("precio final") ||
      merged.includes("cotizacion exacta") ||
      merged.includes("cotización exacta")
    )
  ) {
    return {
      shouldHandoff: true,
      reason: "customer wants exact final quote",
      message: handoffMessage,
    };
  }

  if (
    HANDOFF_RULES.triggerForSixPlusCameras &&
    cameraCount !== null &&
    cameraCount >= 6
  ) {
    return {
      shouldHandoff: true,
      reason: "6+ camera job",
      message: handoffMessage,
    };
  }

  if (
    HANDOFF_RULES.triggerForCommercialJobs &&
    (
      merged.includes("commercial") ||
      merged.includes("business") ||
      merged.includes("negocio") ||
      merged.includes("empresa")
    )
  ) {
    return {
      shouldHandoff: true,
      reason: "commercial/business job",
      message: handoffMessage,
    };
  }

  if (
    HANDOFF_RULES.triggerForWarehouseOrYard &&
    (
      merged.includes("warehouse") ||
      merged.includes("yard") ||
      merged.includes("truck yard") ||
      merged.includes("multiple entry points") ||
      merged.includes("yarda") ||
      merged.includes("troques") ||
      merged.includes("bodega") ||
      merged.includes("portones")
    )
  ) {
    return {
      shouldHandoff: true,
      reason: "yard/warehouse style job",
      message: handoffMessage,
    };
  }

  if (
    HANDOFF_RULES.triggerForTrenchingOrMultipleBuildings &&
    (
      merged.includes("trenching") ||
      merged.includes("pole") ||
      merged.includes("poles") ||
      merged.includes("multiple buildings") ||
      merged.includes("long cable run") ||
      merged.includes("long cable runs") ||
      merged.includes("zanja") ||
      merged.includes("postes") ||
      merged.includes("varios edificios")
    )
  ) {
    return {
      shouldHandoff: true,
      reason: "special wiring / multi-building job",
      message: handoffMessage,
    };
  }

  if (
    HANDOFF_RULES.triggerForAngryOrConfusedCustomer &&
    (
      merged.includes("this makes no sense") ||
      merged.includes("you are confusing me") ||
      merged.includes("angry") ||
      merged.includes("frustrated") ||
      merged.includes("no entiendo") ||
      merged.includes("me esta confundiendo") ||
      merged.includes("me está confundiendo") ||
      merged.includes("esto no tiene sentido")
    )
  ) {
    return {
      shouldHandoff: true,
      reason: "customer seems angry or confused",
      message: handoffMessage,
    };
  }

  return {
    shouldHandoff: false,
    reason:
      leadScore.temperature === "hot"
        ? `hot lead (${leadScore.score}) but no direct handoff trigger`
        : "no handoff needed yet",
    message: handoffMessage,
  };
}