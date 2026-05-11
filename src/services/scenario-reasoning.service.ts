import { normalizeSpanishText } from "./spanish-normalizer.service";

export type ScenarioFamily =
  | "price"
  | "budget"
  | "layout_access"
  | "distance"
  | "internet_phone_viewing"
  | "equipment_quality"
  | "urgency_booking"
  | "custom_risky_technical"
  | "unknown";

export type ScenarioConfidence = "high" | "medium" | "low";

export interface ScenarioReasoningResult {
  family: ScenarioFamily;
  confidence: ScenarioConfidence;
  reasons: string[];
  reply: string | null;
  shouldHandoff: boolean;
}

function normalize(text?: string): string {
  return normalizeSpanishText(text).toLowerCase().trim();
}

function includesAny(text: string, values: string[]): string[] {
  return values.filter((value) => text.includes(value));
}

function mentionsNoAtticAccess(text: string): boolean {
  return (
    text.includes("no attic access") ||
    text.includes("no access above") ||
    text.includes("no attic above") ||
    text.includes("without attic access") ||
    text.includes("sin acceso al atico") ||
    text.includes("sin acceso al ático") ||
    text.includes("la mitad de la casa no tiene acceso al atico") ||
    text.includes("la mitad de la casa no tiene acceso al ático") ||
    text.includes("media casa no tiene acceso al atico") ||
    text.includes("media casa no tiene acceso al ático") ||
    text.includes("attic")
  );
}

function mentionsRecorderLocation(text: string): boolean {
  return (
    text.includes("recorder") ||
    text.includes("dvr") ||
    text.includes("nvr") ||
    text.includes("living room") ||
    text.includes("sala") ||
    text.includes("closet") ||
    text.includes("master closet") ||
    text.includes("closet principal")
  );
}

function mentionsSeparateStructure(text: string): boolean {
  return (
    text.includes("same structure") ||
    text.includes("misma estructura") ||
    text.includes("separate structure") ||
    text.includes("estructura separada") ||
    text.includes("separate area") ||
    text.includes("areas separadas") ||
    text.includes("partes separadas") ||
    text.includes("multiple buildings") ||
    text.includes("varios edificios") ||
    text.includes("detached building") ||
    text.includes("shop") ||
    text.includes("barn") ||
    text.includes("garage separado")
  );
}

function mentionsFarDistance(text: string): boolean {
  return (
    text.includes("far from the main house") ||
    text.includes("gate is far") ||
    text.includes("gate far") ||
    text.includes("far gate") ||
    text.includes("cameras far from the house") ||
    text.includes("cameras far away") ||
    text.includes("long driveway") ||
    text.includes("entrada larga") ||
    text.includes("porton lejos") ||
    text.includes("portón lejos") ||
    text.includes("camaras lejos") ||
    text.includes("farther away")
  );
}

export function detectScenarioFamily(messageText?: string): {
  family: ScenarioFamily;
  confidence: ScenarioConfidence;
  reasons: string[];
} {
  const text = normalize(messageText);

  if (!text) {
    return {
      family: "unknown",
      confidence: "low",
      reasons: [],
    };
  }

  const priceSignals = includesAny(text, [
    "precio",
    "cuanto",
    "cuánto",
    "price",
    "how much",
    "cost",
    "cheapest",
    "better price",
    "lowest",
  ]);

  const budgetSignals = includesAny(text, [
    "too expensive",
    "expensive",
    "caro",
    "esta caro",
    "está caro",
    "can you do less",
    "best price",
    "discount",
    "descuento",
    "found cheaper",
    "what is the lowest",
    "lowest price",
    "no tengo mucho presupuesto",
    "no tengo mucho dinero",
    "little budget",
    "budget",
  ]);

  const layoutSignals = includesAny(text, [
    "attic",
    "atico",
    "ático",
    "no attic access",
    "sin acceso al atico",
    "sin acceso al ático",
    "half attic access",
    "media casa no tiene acceso",
    "la mitad de la casa no tiene acceso",
    "recorder location",
    "dvr location",
    "nvr location",
    "nvr",
    "dvr",
    "recorder",
    "closet",
    "closet principal",
    "master closet",
    "living room",
    "sala",
    "wires showing",
    "visible cable",
    "hidden wires",
    "difficult cable path",
    "difficult wiring",
    "no access above room",
    "no access above",
    "no attic above",
    "two story",
    "dos pisos",
  ]);

  const distanceSignals = includesAny(text, [
    "far gate",
    "gate far",
    "gate is far",
    "porton lejos",
    "portón lejos",
    "detached garage",
    "garage separado",
    "separate shop",
    "shop",
    "taller",
    "barn",
    "ranch",
    "acres",
    "acre",
    "long driveway",
    "entrada larga",
    "back building",
    "building in the back",
    "multiple buildings",
    "varios edificios",
    "cameras far from the house",
    "camera far from the house",
    "cameras far away",
    "camera far away",
    "camaras lejos",
    "camaras lejos de la casa",
    "yard far",
    "same structure",
    "misma estructura",
    "separate structure",
    "estructura separada",
    "detached building",
    "commercial yard",
    "truck yard",
    "warehouse",
    "bodega",
    "office",
    "oficina",
  ]);

  const internetSignals = includesAny(text, [
    "internet",
    "wifi",
    "wi-fi",
    "phone",
    "cell phone",
    "celular",
    "telefono",
    "teléfono",
    "remote viewing",
    "see from my phone",
    "see on my phone",
    "without internet",
    "wifi goes out",
    "wi-fi goes out",
    "record without internet",
  ]);

  const equipmentSignals = includesAny(text, [
    "brand",
    "marca",
    "reolink",
    "4k",
    "8mp",
    "12mp",
    "night vision",
    "vision nocturna",
    "visión nocturna",
    "license plates",
    "placas",
    "person detection",
    "vehicle detection",
    "audio",
    "hardwired",
    "wired",
    "wireless",
    "quality",
    "better quality",
    "resolution",
    "resolucion",
    "resolución",
  ]);

  const urgencySignals = includesAny(text, [
    "when can you come",
    "can you come today",
    "today",
    "tomorrow",
    "same day",
    "schedule",
    "appointment",
    "i am ready",
    "i'm ready",
    "ready",
    "agendar",
    "cita",
    "hoy",
    "mañana",
    "manana",
    "puede venir",
    "pueden venir",
    "deposit",
    "tarjeta",
    "card",
    "phone number",
    "numero",
    "número",
    "address",
    "direccion",
    "dirección",
  ]);

  const customSignals = includesAny(text, [
    "wireless bridge",
    "wireless bridges",
    "bridge",
    "bridges",
    "poe switch",
    "switch poe",
    "trenching",
    "zanja",
    "long cable run",
    "long cable runs",
    "metal building",
    "network setup",
    "complicated wiring",
    "special mounting",
    "point to point",
    "point-to-point",
    "antenna",
    "antena",
    "antenas",
    "ap",
    "omada",
    "client bridge",
    "router in house",
    "router in the house",
    "additional router",
    "main router",
    "nvr in shop",
    "nvr in the shop",
    "nvr va en la sala",
    "nvr en la sala",
    "disperse within the property",
    "spread around the property",
  ]);

  if (urgencySignals.length > 0) {
    return {
      family: "urgency_booking",
      confidence: urgencySignals.length >= 2 ? "high" : "medium",
      reasons: urgencySignals,
    };
  }

  if (customSignals.length > 0) {
    return {
      family: "custom_risky_technical",
      confidence: customSignals.length >= 2 ? "high" : "medium",
      reasons: customSignals,
    };
  }

  if (distanceSignals.length > 0) {
    return {
      family: "distance",
      confidence: distanceSignals.length >= 2 ? "high" : "medium",
      reasons: distanceSignals,
    };
  }

  if (layoutSignals.length > 0) {
    return {
      family: "layout_access",
      confidence: layoutSignals.length >= 2 ? "high" : "medium",
      reasons: layoutSignals,
    };
  }

  if (internetSignals.length > 0) {
    return {
      family: "internet_phone_viewing",
      confidence: internetSignals.length >= 2 ? "high" : "medium",
      reasons: internetSignals,
    };
  }

  if (equipmentSignals.length > 0) {
    return {
      family: "equipment_quality",
      confidence: equipmentSignals.length >= 2 ? "high" : "medium",
      reasons: equipmentSignals,
    };
  }

  if (budgetSignals.length > 0) {
    return {
      family: "budget",
      confidence: budgetSignals.length >= 2 ? "high" : "medium",
      reasons: budgetSignals,
    };
  }

  if (priceSignals.length > 0) {
    return {
      family: "price",
      confidence: priceSignals.length >= 2 ? "high" : "medium",
      reasons: priceSignals,
    };
  }

  return {
    family: "unknown",
    confidence: "low",
    reasons: [],
  };
}

function buildUnknownFallback(
  language: "spanish" | "english" | "unknown"
): string {
  if (language === "spanish") {
    return "Sí se puede revisar, pero en ese tipo de caso la mejor solución depende mucho de la distribución de la propiedad. A veces se puede resolver con una ruta diferente, moviendo el grabador, o usando equipo adicional. Para darle una respuesta correcta, ¿la zona que quiere cubrir está en la misma estructura o está retirada?";
  }

  return "That can usually be reviewed, but in that type of situation the best solution depends a lot on the property layout. Sometimes it can be solved with a different cable path, moving the recorder, or using additional equipment. To give you the right answer, is the area you want to cover in the same structure or farther away?";
}

export function buildScenarioReasoningReply(
  messageText?: string,
  language: "spanish" | "english" | "unknown" = "unknown"
): ScenarioReasoningResult {
  const detected = detectScenarioFamily(messageText);
  const text = normalize(messageText);

  if (detected.family === "layout_access") {
    let question: string;

    if (mentionsNoAtticAccess(text) && mentionsRecorderLocation(text)) {
      question =
        language === "spanish"
          ? "¿Ese punto donde quiere dejar el grabador se puede mover a otra área de la casa, o tendría que quedarse ahí?"
          : "Is that recorder location fixed, or could it be moved to another area of the house with better access?";
    } else if (mentionsNoAtticAccess(text)) {
      question =
        language === "spanish"
          ? "¿Hay acceso al ático en otra parte de la casa?"
          : "Is there attic access somewhere else in the house?";
    } else {
      question =
        language === "spanish"
          ? "¿Ese punto donde quiere dejar el grabador se puede mover a otra área de la casa, o tendría que quedarse ahí?"
          : "Is that recorder location fixed, or could it be moved to another area of the house with better access?";
    }

    return {
      family: detected.family,
      confidence: detected.confidence,
      reasons: detected.reasons,
      shouldHandoff: detected.confidence === "low",
      reply:
        language === "spanish"
          ? `Sí se puede revisar, pero en ese tipo de caso la mejor solución depende mucho de la distribución de la propiedad. A veces se resuelve con una ruta diferente, moviendo el grabador, o usando equipo adicional. ${question}`
          : `That can usually be worked out, but in that type of case the best solution depends a lot on the property layout. Sometimes it is solved with a different cable path, moving the recorder, or using additional equipment. ${question}`,
    };
  }

  if (detected.family === "distance") {
    let question: string;

    if (mentionsSeparateStructure(text)) {
      question =
        language === "spanish"
          ? "Aproximadamente, ¿qué tan retiradas están esas áreas entre sí?"
          : "About how far apart are those areas from each other?";
    } else if (mentionsFarDistance(text)) {
      question =
        language === "spanish"
          ? "Aproximadamente, ¿qué tan lejos está esa área de la estructura principal?"
          : "About how far is that area from the main structure?";
    } else {
      question =
        language === "spanish"
          ? "Aproximadamente, ¿todo está en la misma estructura o hay partes separadas?"
          : "Is it all in the same structure, or are there separate areas to cover?";
    }

    return {
      family: detected.family,
      confidence: detected.confidence,
      reasons: detected.reasons,
      shouldHandoff: detected.confidence === "high",
      reply:
        language === "spanish"
          ? `Sí, en ese tipo de propiedad la distancia ya puede cambiar bastante la instalación. A veces se resuelve con una ruta diferente, cable más largo, o incluso enlaces inalámbricos entre áreas, pero depende de qué tan retiradas estén las zonas. ${question}`
          : `Yes, on that type of property the distance can change the install quite a bit. Sometimes it is solved with a different cable route, longer runs, or even wireless links between areas, but it depends on how separated everything is. ${question}`,
    };
  }

  if (detected.family === "custom_risky_technical") {
    const question =
      mentionsSeparateStructure(text)
        ? language === "spanish"
          ? "Aproximadamente, ¿qué tan retiradas están esas estructuras entre sí?"
          : "About how far apart are those structures from each other?"
        : language === "spanish"
          ? "¿La propiedad tiene varias estructuras o todo está en una sola?"
          : "Does the property have multiple structures, or is everything in one main structure?";

    return {
      family: detected.family,
      confidence: detected.confidence,
      reasons: detected.reasons,
      shouldHandoff: true,
      reply:
        language === "spanish"
          ? `Eso ya suena como una instalación más personalizada, porque puede requerir equipo adicional o una distribución distinta según la propiedad. Para no prometerle algo incorrecto en precio o método, lo mejor es revisar primero cómo están separadas las áreas. ${question}`
          : `That already sounds more like a custom install, because it may require additional equipment or a different setup depending on the property. To avoid giving you the wrong price or method, it is better to review how the areas are laid out first. ${question}`,
    };
  }

  if (detected.family === "unknown") {
    return {
      family: detected.family,
      confidence: "low",
      reasons: detected.reasons,
      shouldHandoff: false,
      reply: buildUnknownFallback(language),
    };
  }

  return {
    family: detected.family,
    confidence: detected.confidence,
    reasons: detected.reasons,
    shouldHandoff: false,
    reply: null,
  };
}