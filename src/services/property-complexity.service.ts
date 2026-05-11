import { normalizeSpanishText } from "./spanish-normalizer.service";

export type PropertyComplexityLevel =
  | "standard"
  | "medium_complexity"
  | "high_complexity";

export interface PropertyComplexityResult {
  level: PropertyComplexityLevel;
  score: number;
  reasons: string[];
  shouldHandoff: boolean;
}

function normalize(text?: string): string {
  return normalizeSpanishText(text).toLowerCase().trim();
}

function includesAny(text: string, values: string[]): string[] {
  return values.filter((value) => text.includes(value));
}

export function detectPropertyComplexity(
  messageText?: string
): PropertyComplexityResult {
  const text = normalize(messageText);

  if (!text) {
    return {
      level: "standard",
      score: 0,
      reasons: [],
      shouldHandoff: false,
    };
  }

  let score = 0;
  const reasons: string[] = [];

  const highComplexitySignals = includesAny(text, [
    "wireless bridge",
    "wireless bridges",
    "poe switch",
    "switch poe",
    "no attic access",
    "sin acceso al atico",
    "sin acceso al ático",
    "half attic access",
    "solo media casa tiene acceso al atico",
    "solo media casa tiene acceso al ático",
    "la mitad de la casa no tiene acceso al atico",
    "la mitad de la casa no tiene acceso al ático",
    "media casa no tiene acceso al atico",
    "media casa no tiene acceso al ático",
    "multiple buildings",
    "varios edificios",
    "detached building",
    "separate building",
    "estructura separada",
    "custom nvr location",
    "nvr en la sala",
    "nvr va en la sala",
    "nvr in the living room",
    "master closet",
    "closet principal",
    "closet master",
    "long cable run",
    "long cable runs",
    "larga distancia",
  ]);

  const mediumComplexitySignals = includesAny(text, [
    "big property",
    "large property",
    "propiedad grande",
    "big house",
    "casa grande",
    "router far",
    "router is in the back",
    "router atras",
    "router atrás",
    "weak wifi",
    "wifi signal weak",
    "wifi debil",
    "wifi débil",
    "detached garage",
    "garage separado",
    "shop",
    "taller",
    "back building",
    "building in the back",
    "estructura atras",
    "estructura atrás",
    "two story",
    "dos pisos",
    "camera far from the house",
    "cameras far from the house",
    "camera far away",
    "cameras far away",
    "camara lejos de la casa",
    "camaras lejos de la casa",
    "camara retirada",
    "camara retirada de la casa",
    "camaras lejos",
    "camaras retiradas",
    "driveway far",
    "long driveway",
    "entrada larga",
    "yard far",
    "yarda grande",
    "gate far",
    "gate is far",
    "porton lejos",
    "portón lejos",
    "areas separadas",
    "separate areas",
    "separate area",
  ]);

  const mildSignals = includesAny(text, [
    "6 cameras",
    "7 cameras",
    "8 cameras",
    "9 cameras",
    "10 cameras",
    "6 camaras",
    "7 camaras",
    "8 camaras",
    "9 camaras",
    "10 camaras",
    "yard",
    "yarda",
    "warehouse",
    "bodega",
    "truck yard",
    "troques",
    "far area",
    "area separada",
    "área separada",
    "gate",
    "porton",
    "portón",
  ]);

  if (highComplexitySignals.length > 0) {
    score += highComplexitySignals.length * 3;
    reasons.push(`high complexity signals: ${highComplexitySignals.join(", ")}`);
  }

  if (mediumComplexitySignals.length > 0) {
    score += mediumComplexitySignals.length * 2;
    reasons.push(
      `medium complexity signals: ${mediumComplexitySignals.join(", ")}`
    );
  }

  if (mildSignals.length > 0) {
    score += mildSignals.length;
    reasons.push(`mild complexity signals: ${mildSignals.join(", ")}`);
  }

  if (score >= 6) {
    return {
      level: "high_complexity",
      score,
      reasons,
      shouldHandoff: true,
    };
  }

  if (score >= 2) {
    return {
      level: "medium_complexity",
      score,
      reasons,
      shouldHandoff: false,
    };
  }

  return {
    level: "standard",
    score,
    reasons,
    shouldHandoff: false,
  };
}

export function buildComplexityReply(
  messageText?: string,
  language: "spanish" | "english" | "unknown" = "unknown"
): string | null {
  const result = detectPropertyComplexity(messageText);

  if (result.level === "standard") {
    return null;
  }

  if (language === "spanish") {
    if (result.level === "high_complexity") {
      return "Claro. Ese tipo de propiedad ya suena como una instalación más especial, porque la distancia, el acceso y la distribución cambian mucho el trabajo. En esos casos a veces se ocupa mejor equipo, switch PoE o hasta enlaces inalámbricos. Para no darle un precio incorrecto, lo mejor es revisar bien la distribución. ¿La propiedad tiene áreas separadas o todo está en una sola estructura?";
    }

    return "Claro. Cuando la propiedad es grande o hay áreas retiradas, a veces ya no conviene tratarlo como una instalación normal porque la distribución cambia mucho el trabajo. Primero conviene revisar bien las áreas que quiere cubrir. ¿La propiedad está toda en una sola estructura o hay partes separadas?";
  }

  if (result.level === "high_complexity") {
    return "Absolutely. That sounds more like a custom install, because the distance, access, and layout can change the job quite a bit. In cases like that, it may need better equipment, a PoE switch, or even wireless bridges. To avoid giving you the wrong price, it is better to review the layout first. Is it all one structure, or are there separate areas to cover?";
  }

  return "Absolutely. When the property is larger or the cameras need to cover areas farther away, the layout can change the job quite a bit. It is better to review the areas first instead of treating it like a standard install. Is it all one structure, or are there separate areas to cover?";
}