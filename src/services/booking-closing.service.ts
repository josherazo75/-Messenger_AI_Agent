import { LeadRecord } from "./lead.service";

export interface BookingClosingDecision {
  mode:
    | "none"
    | "ask_phone"
    | "ask_address"
    | "ready_for_handoff";
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
  return /\b\d{3,6}\s+[a-z0-9]+\s+(st|street|ave|avenue|rd|road|dr|drive|blvd|lane|ln|court|ct)\b/i.test(
    text
  );
}

function hasReadyIntent(text: string): boolean {
  return (
    text.includes("i'm ready") ||
    text.includes("im ready") ||
    text.includes("ready") ||
    text.includes("let's do it") ||
    text.includes("lets do it") ||
    text.includes("want to install") ||
    text.includes("i want to install") ||
    text.includes("when can you come") ||
    text.includes("can you come") ||
    text.includes("can you come today") ||
    text.includes("today works") ||
    text.includes("tomorrow works") ||
    text.includes("available this week") ||
    text.includes("schedule") ||
    text.includes("appointment") ||
    text.includes("book it") ||
    text.includes("book") ||
    text.includes("estoy listo") ||
    text.includes("ya estoy listo") ||
    text.includes("quiero instalar") ||
    text.includes("quiero la instalacion") ||
    text.includes("quiero la instalación") ||
    text.includes("cuando puede venir") ||
    text.includes("cuando pueden venir") ||
    text.includes("puede venir") ||
    text.includes("pueden venir") ||
    text.includes("agendar") ||
    text.includes("cita") ||
    text.includes("hoy puede") ||
    text.includes("mañana puede") ||
    text.includes("manana puede")
  );
}

function hasEnoughInstallContext(lead?: LeadRecord | null): boolean {
  if (!lead) {
    return false;
  }

  return Boolean(lead.property_type && lead.city_or_zip && lead.camera_count);
}

function getLanguage(
  forcedLanguage: "spanish" | "english" | "unknown" = "unknown",
  messageText?: string
): "spanish" | "english" {
  const text = normalize(messageText);

  const spanishSignals = [
    "este es mi numero",
    "este es mi número",
    "mi numero",
    "mi número",
    "mi telefono",
    "mi teléfono",
    "mi direccion",
    "mi dirección",
    "direccion",
    "dirección",
    "quiero",
    "instalar",
    "puede venir",
    "agendar",
    "cita",
    "numero",
    "número",
    "esta bien",
    "está bien",
    "listo",
    "casa",
    "negocio",
  ];

  const englishSignals = [
    "this is my number",
    "my number",
    "my phone",
    "my address",
    "ready",
    "schedule",
    "appointment",
    "can you come",
    "address",
    "house",
    "business",
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

  // Strong current-message override
  if (spanishScore >= 1 && spanishScore > englishScore) {
    return "spanish";
  }

  if (englishScore >= 1 && englishScore > spanishScore) {
    return "english";
  }

  // Fallback to conversation language only when current message is ambiguous
  if (forcedLanguage === "spanish") {
    return "spanish";
  }

  if (forcedLanguage === "english") {
    return "english";
  }

  return "english";
}

function buildAskPhoneReply(language: "spanish" | "english"): string {
  if (language === "spanish") {
    return "Perfecto. Para avanzar y confirmar bien la instalación, ¿cuál es el mejor número para comunicarse con usted?";
  }

  return "Perfect. To move forward and confirm the install properly, what is the best phone number to reach you?";
}

function buildAskAddressReply(language: "spanish" | "english"): string {
  if (language === "spanish") {
    return "Está bien, para agendar la instalación, ¿me puede pasar la dirección?";
  }

  return "Alright, to schedule the installation, can you send me the address?";
}

function buildReadyForHandoffReply(language: "spanish" | "english"): string {
  if (language === "spanish") {
    return "Perfecto, gracias. Ya con eso le pueden dar seguimiento directo para confirmar horario, dirección y los últimos detalles de la instalación.";
  }

  return "Perfect, thank you. With that, someone can follow up directly to confirm the time, address, and final install details.";
}

export function buildBookingClosingReply(
  messageText?: string,
  lead?: LeadRecord | null,
  forcedLanguage: "spanish" | "english" | "unknown" = "unknown"
): BookingClosingDecision {
  const text = normalize(messageText);
  const language = getLanguage(forcedLanguage, messageText);

  const sentPhone = hasPhoneNumber(text);
  const sentAddress = hasAddress(text);
  const readyIntent = hasReadyIntent(text);
  const enoughInstallContext = hasEnoughInstallContext(lead);

  if (!readyIntent && !sentPhone && !sentAddress) {
    return {
      mode: "none",
      shouldHandoff: false,
      reason: "no booking or closing signal detected",
      reply: null,
    };
  }

  if (sentPhone && sentAddress) {
    return {
      mode: "ready_for_handoff",
      shouldHandoff: true,
      reason: "customer sent phone and address",
      reply: buildReadyForHandoffReply(language),
    };
  }

  if (sentPhone) {
    return {
      mode: "ask_address",
      shouldHandoff: true,
      reason: "customer sent phone number",
      reply: buildAskAddressReply(language),
    };
  }

  if (sentAddress) {
    return {
      mode: "ask_phone",
      shouldHandoff: true,
      reason: "customer sent address",
      reply: buildAskPhoneReply(language),
    };
  }

  if (readyIntent && enoughInstallContext) {
    return {
      mode: "ask_phone",
      shouldHandoff: true,
      reason: "ready lead with enough install context",
      reply: buildAskPhoneReply(language),
    };
  }

  if (readyIntent) {
    return {
      mode: "ask_phone",
      shouldHandoff: false,
      reason: "ready intent detected but lead still needs closing contact",
      reply: buildAskPhoneReply(language),
    };
  }

  return {
    mode: "none",
    shouldHandoff: false,
    reason: "no booking action needed",
    reply: null,
  };
}