import { LeadRecord } from "./lead.service";
import { chooseReplyLength } from "./reply-length.service";

export interface NegotiationDecision {
  mode:
    | "none"
    | "value_defense"
    | "value_defense_with_qualification"
    | "special_adjustment_review";
  shouldHandoff: boolean;
  reason: string;
  reply: string | null;
}

function normalize(text?: string | null): string {
  return (text || "").toLowerCase().trim();
}

function isResistanceMessage(text: string): boolean {
  return (
    text.includes("too expensive") ||
    text.includes("expensive") ||
    text.includes("can you do less") ||
    text.includes("best price") ||
    text.includes("discount") ||
    text.includes("found cheaper") ||
    text.includes("what is the lowest") ||
    text.includes("lowest price") ||
    text.includes("thats high") ||
    text.includes("that's high") ||
    text.includes("out of my budget") ||
    text.includes("caro") ||
    text.includes("esta caro") ||
    text.includes("está caro") ||
    text.includes("muy caro") ||
    text.includes("se me hace caro") ||
    text.includes("se me hace muy caro") ||
    text.includes("no tengo mucho presupuesto") ||
    text.includes("no tengo mucho dinero") ||
    text.includes("lo menos") ||
    text.includes("menos precio") ||
    text.includes("descuento") ||
    text.includes("encontre mas barato") ||
    text.includes("encontré más barato") ||
    text.includes("esta alto") ||
    text.includes("está alto")
  );
}

function isSpanishMessage(text: string): boolean {
  return (
    text.includes("caro") ||
    text.includes("precio") ||
    text.includes("descuento") ||
    text.includes("presupuesto") ||
    text.includes("casa") ||
    text.includes("negocio") ||
    text.includes("camaras") ||
    text.includes("cámaras")
  );
}

function getLanguage(
  messageText?: string,
  forcedLanguage: "spanish" | "english" | "unknown" = "unknown"
): "spanish" | "english" {
  if (forcedLanguage === "spanish") {
    return "spanish";
  }

  if (forcedLanguage === "english") {
    return "english";
  }

  return isSpanishMessage(normalize(messageText)) ? "spanish" : "english";
}

function isLocalBakersfield(cityOrZip?: string | null): boolean {
  const city = normalize(cityOrZip);
  return city.includes("bakersfield");
}

function isStandardResidential4CameraLead(lead?: LeadRecord | null): boolean {
  if (!lead) {
    return false;
  }

  const propertyType = normalize(lead.property_type);
  const city = normalize(lead.city_or_zip);
  const cameraCount = normalize(lead.camera_count);

  const looksHome = propertyType === "home";
  const looksLocal = city.includes("bakersfield");
  const looksStandardCameraCount =
    cameraCount === "4" || cameraCount === "4 cameras" || cameraCount === "4 camaras";

  return looksHome && looksLocal && looksStandardCameraCount;
}

function hasEnoughSeriousContext(lead?: LeadRecord | null): boolean {
  if (!lead) {
    return false;
  }

  return Boolean(lead.property_type && lead.city_or_zip);
}

function getNextQualificationQuestion(
  lead: LeadRecord | null | undefined,
  language: "spanish" | "english"
): string {
  if (!lead?.property_type) {
    return language === "spanish"
      ? "¿Es para casa o negocio?"
      : "Is it for a house or a business?";
  }

  if (!lead?.city_or_zip) {
    return language === "spanish"
      ? "¿En qué ciudad está la propiedad?"
      : "What city is the property in?";
  }

  if (!lead?.camera_count) {
    return language === "spanish"
      ? "¿Cuántas cámaras ocupa?"
      : "About how many cameras do you need?";
  }

  if (!lead?.timeline) {
    return language === "spanish"
      ? "¿Qué tan pronto le gustaría instalar?"
      : "How soon are you looking to install?";
  }

  return language === "spanish"
    ? "¿Qué áreas quiere cubrir principalmente?"
    : "What areas are you mainly trying to cover?";
}

function buildValueDefenseReply(
  language: "spanish" | "english",
  lead: LeadRecord | null | undefined,
  length: "short" | "medium" | "long"
): string {
  const nextQuestion = getNextQualificationQuestion(lead, language);

  if (language === "spanish") {
    if (length === "short") {
      return `Lo entiendo. Aquí ya van incluidas las cámaras, la instalación, la configuración y la garantía. ${nextQuestion}`;
    }

    if (length === "medium") {
      return `Lo entiendo. A veces al principio suena alto, pero aquí ya van incluidas las cámaras, la instalación, la configuración en el celular y la garantía. La idea es que quede funcionando bien desde el primer día, no solo poner cámaras. ${nextQuestion}`;
    }

    return `Lo entiendo. A veces al principio suena alto, pero hay 3 cosas importantes que considerar: la calidad del equipo, la calidad de la instalación y la garantía que recibe con el paquete completo. Incluso en las opciones más económicas, el equipo sigue siendo de buena calidad — económico no significa corriente ni mal hecho. La instalación la hace un técnico profesional, para que no quede con cables colgando o visibles, y cuando la casa lo permite, el cableado se corre bien por el ático. Además, recibe 1 año de garantía por escrito, no solo de palabra. ${nextQuestion}`;
  }

  if (length === "short") {
    return `I understand. Here the cameras, installation, setup, and warranty are already included. ${nextQuestion}`;
  }

  if (length === "medium") {
    return `I understand. It can sound high at first, but here the cameras, installation, phone setup, and warranty are already included. The goal is to leave everything working properly from day one, not just put cameras up. ${nextQuestion}`;
  }

  return `I understand. It can sound high at first, but there are 3 important things to consider: the quality of the equipment, the quality of the installation, and the warranty that comes with the full package. Even the more affordable systems we use are still solid equipment — affordable does not mean cheaply built. The installation is done professionally, so you do not end up with loose, hanging, or visible wires, and when the house allows it, the wiring is run properly through the attic. Plus, you get a full 1-year written warranty, not just a verbal promise. ${nextQuestion}`;
}

function buildSpecialAdjustmentReviewReply(
  language: "spanish" | "english",
  length: "short" | "medium" | "long"
): string {
  if (language === "spanish") {
    if (length === "short") {
      return "Lo entiendo. El paquete normal empieza en $700 ya instalado. Si la instalación es local en Bakersfield y sencilla, puede haber forma de ayudarle un poco, pero eso se tendría que confirmar directamente. ¿En qué área de Bakersfield está?";
    }

    if (length === "medium") {
      return "Lo entiendo. El paquete normal empieza en $700 porque ya incluye cámaras, instalación, configuración y garantía. Si la instalación es local en Bakersfield y sencilla, puede haber alguna forma de ayudarle un poco, pero eso se tendría que confirmar directamente. ¿En qué área de Bakersfield está?";
    }

    return "Lo entiendo. El paquete normal empieza en $700 porque ya incluye cámaras, instalación, configuración en el celular y garantía. Si la instalación es local en Bakersfield y sencilla, puede haber alguna forma de ayudarle un poco, pero para no prometerle algo incorrecto, eso se tendría que confirmar directamente según la propiedad y la instalación. ¿En qué área de Bakersfield está?";
  }

  if (length === "short") {
    return "I understand. The normal package starts at $700 installed. If the install is local in Bakersfield and simple, there may be a way to help a little, but that would need to be confirmed directly. What area of Bakersfield are you in?";
  }

  if (length === "medium") {
    return "I understand. The normal package starts at $700 because it already includes the cameras, installation, setup, and warranty. If the install is local in Bakersfield and simple, there may be a way to help a little, but that would need to be confirmed directly. What area of Bakersfield are you in?";
  }

  return "I understand. The normal package starts at $700 because it already includes the cameras, installation, phone setup, and warranty. If the install is local in Bakersfield and simple, there may be a way to help a little, but to avoid promising something incorrect, that would need to be confirmed directly based on the property and the install. What area of Bakersfield are you in?";
}

export function buildNegotiationReply(
  messageText?: string,
  lead?: LeadRecord | null,
  forcedLanguage: "spanish" | "english" | "unknown" = "unknown"
): NegotiationDecision {
  const text = normalize(messageText);
  const language = getLanguage(messageText, forcedLanguage);

  if (!isResistanceMessage(text)) {
    return {
      mode: "none",
      shouldHandoff: false,
      reason: "no resistance detected",
      reply: null,
    };
  }

  const hasSeriousContext = hasEnoughSeriousContext(lead);
  const looksStandardLocal4Camera = isStandardResidential4CameraLead(lead);
  const localBakersfield = isLocalBakersfield(lead?.city_or_zip);

  const length = chooseReplyLength({
    messageText,
    scenario: "budget",
    hasLeadContext: hasSeriousContext,
  });

  if (looksStandardLocal4Camera && hasSeriousContext && localBakersfield) {
    return {
      mode: "special_adjustment_review",
      shouldHandoff: true,
      reason: "serious local standard residential lead with price resistance",
      reply: buildSpecialAdjustmentReviewReply(language, length),
    };
  }

  if (hasSeriousContext) {
    return {
      mode: "value_defense",
      shouldHandoff: false,
      reason: "price resistance with partial qualification context",
      reply: buildValueDefenseReply(language, lead, length),
    };
  }

  return {
    mode: "value_defense_with_qualification",
    shouldHandoff: false,
    reason: "early price resistance with limited context",
    reply: buildValueDefenseReply(language, lead, length),
  };
}