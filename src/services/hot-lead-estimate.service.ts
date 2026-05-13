import { LeadRecord } from "./lead.service";
import { detectLanguage } from "./intent.service";
import { normalizeSpanishText } from "./spanish-normalizer.service";

export interface HotLeadDecision {
  matched: boolean;
  shouldHandoff: boolean;
  reason: string;
  reply: string | null;
}

function normalize(text?: string | null): string {
  return (text || "").toLowerCase().trim();
}

function hasPhoneNumber(text: string): boolean {
  return /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/.test(text);
}

function hasAddress(text: string): boolean {
  return /\b\d{2,6}\s+[a-z0-9]+\s+[a-z0-9.\-#]+\b/i.test(text);
}

function getLanguage(
  messageText?: string,
  forcedLanguage: "spanish" | "english" | "unknown" = "unknown"
): "spanish" | "english" {
  const detected = detectLanguage(messageText);

  if (detected !== "unknown") {
    return detected;
  }

  if (forcedLanguage === "spanish") {
    return "spanish";
  }

  const text = normalizeSpanishText(messageText);
  const spanishSignals = [
    "estimado",
    "mañana",
    "manana",
    "atico",
    "ático",
    "direccion",
    "dirección",
    "camaras",
    "cámaras",
    "podrias",
    "podrías",
    "casa",
    "negocio",
  ];

  if (spanishSignals.some((item) => text.includes(item))) {
    return "spanish";
  }

  return "english";
}

function countSignals(text: string): number {
  let score = 0;

  const estimateSignals = [
    "estimate",
    "rough estimate",
    "quote",
    "estimado",
    "cotizacion",
    "cotización",
    "cuanto seria",
    "cuánto sería",
  ];

  const scheduleSignals = [
    "tomorrow",
    "today",
    "this week",
    "schedule",
    "appointment",
    "can you come",
    "mañana",
    "manana",
    "hoy",
    "podrias mañana",
    "podrías mañana",
    "a las",
    "puedes mañana",
    "puede venir",
    "agendar",
    "cita",
    "fin de semana",
    "weekend",
  ];

  const installDetailSignals = [
    "attic",
    "atico",
    "ático",
    "cables",
    "wires",
    "doorbell",
    "dvr",
    "nvr",
    "battery doorbell",
    "bateria",
    "batería",
    "post",
    "poste",
    "mailbox",
    "buzon",
    "buzón",
    "photos",
    "fotos",
  ];

  const scopeSignals = [
    "4 cameras",
    "5 cameras",
    "6 cameras",
    "4 camaras",
    "5 camaras",
    "6 camaras",
    "4 cámaras",
    "5 cámaras",
    "6 cámaras",
    "door bell",
    "doorbell",
    "timbre con camara",
    "timbre con cámara",
  ];

  if (hasAddress(text)) {
    score += 3;
  }

  if (estimateSignals.some((item) => text.includes(item))) {
    score += 2;
  }

  if (scheduleSignals.some((item) => text.includes(item))) {
    score += 2;
  }

  if (installDetailSignals.some((item) => text.includes(item))) {
    score += 1;
  }

  if (scopeSignals.some((item) => text.includes(item))) {
    score += 1;
  }

  return score;
}

function buildAskPhoneReply(language: "spanish" | "english"): string {
  if (language === "spanish") {
    return "Perfecto, gracias. Ya con esos detalles sí se puede revisar bien como instalación real. ¿Cuál es el mejor número para confirmarle horario y estimado?";
  }

  return "Perfect, thank you. With those details, this can be reviewed as a real installation now. What is the best phone number to confirm the time and estimate?";
}

function buildConfirmHandoffReply(language: "spanish" | "english"): string {
  if (language === "spanish") {
    return "Perfecto, gracias. Ya con la dirección y los detalles de la instalación, el instalador le puede dar seguimiento directo para confirmar horario, estimado y últimos detalles.";
  }

  return "Perfect, thank you. With the address and install details, the installer can follow up directly to confirm the time, estimate, and final details.";
}

export function buildHotLeadEstimateReply(
  messageText?: string,
  lead?: LeadRecord | null,
  forcedLanguage: "spanish" | "english" | "unknown" = "unknown"
): HotLeadDecision {
  const raw = normalize(messageText);
  const normalized = normalizeSpanishText(messageText);
  const merged = `${raw} ${normalized}`.trim();
  const language = getLanguage(messageText, forcedLanguage);

  const signalCount = countSignals(merged);
  const sentPhone = hasPhoneNumber(merged);
  const sentAddress = hasAddress(merged);

  const leadHasBasics = Boolean(
    lead?.property_type || lead?.city_or_zip || lead?.camera_count
  );

  const strongHotLead =
    signalCount >= 4 || (signalCount >= 3 && (sentAddress || leadHasBasics));

  if (!strongHotLead) {
    return {
      matched: false,
      shouldHandoff: false,
      reason: "not a hot estimate/scheduling message",
      reply: null,
    };
  }

  if (sentPhone || (sentAddress && leadHasBasics)) {
    return {
      matched: true,
      shouldHandoff: true,
      reason: "hot lead with enough detail for direct follow-up",
      reply: buildConfirmHandoffReply(language),
    };
  }

  return {
    matched: true,
    shouldHandoff: true,
    reason: "hot lead estimate/scheduling message needs phone number",
    reply: buildAskPhoneReply(language),
  };
}