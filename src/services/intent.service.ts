import { normalizeSpanishText } from "./spanish-normalizer.service";
import { containsFuzzyWord } from "./fuzzy-text.service";

export type DetectedLanguage = "spanish" | "english" | "unknown";

export type Intent =
  | "price"
  | "info"
  | "night_vision"
  | "wired"
  | "install_only"
  | "expensive"
  | "recording"
  | "weekend"
  | "greeting"
  | "home"
  | "business"
  | "unknown";

export function detectLanguage(messageText?: string): DetectedLanguage {
  const raw = (messageText || "").toLowerCase().trim();
  const text = normalizeSpanishText(messageText);

  if (!raw && !text) {
    return "unknown";
  }

  let spanishScore = 0;
  let englishScore = 0;

  const spanishSignals = [
    "hola",
    "buenas",
    "disculpe",
    "precio",
    "cuanto",
    "camaras",
    "casa",
    "negocio",
    "informacion",
    "instalacion",
    "alambricas",
    "inalambricas",
    "noche",
    "cobra",
    "caro",
    "jefe",
    "para casa",
    "para negocio",
    "puede venir",
    "pueden venir",
    "domingo",
    "sabado",
    "fin de semana",
    "tarjeta",
    "pagos",
    "pago",
    "internet",
    "mensualidad",
    "mensual",
    "celular",
    "telefono",
    "camaras incluidas",
    "incluye",
    "instaladas",
    "atico",
    "ático",
    "sala",
    "porton",
    "portón",
    "estructura",
    "propiedad",
    "bodega",
    "yarda",
    "app",
  ];

  const englishSignals = [
    "price",
    "cost",
    "hello",
    "hi",
    "business",
    "home",
    "house",
    "wireless",
    "wired",
    "night vision",
    "how much",
    "available",
    "installation",
    "card",
    "credit card",
    "payment",
    "payments",
    "internet",
    "monthly",
    "phone",
    "attic",
    "living room",
    "recorder",
    "gate",
    "property",
    "structure",
    "shop",
    "ranch",
    "warehouse",
    "garage",
    "driveway",
    "same structure",
    "separate area",
    "separate structure",
    "app",
  ];

  for (const signal of spanishSignals) {
    if (raw.includes(signal) || text.includes(signal)) {
      spanishScore += 1;
    }
  }

  if (containsFuzzyWord(raw, ["precio", "noche", "paquete", "instalacion"], 2)) {
    spanishScore += 1;
  }

  for (const signal of englishSignals) {
    if (raw.includes(signal)) {
      englishScore += 1;
    }
  }

  if (spanishScore >= 1 && spanishScore > englishScore) {
    return "spanish";
  }

  if (englishScore >= 1 && englishScore > spanishScore) {
    return "english";
  }

  if (englishScore >= 1) {
    return "english";
  }

  if (spanishScore >= 1) {
    return "spanish";
  }

  return "unknown";
}

export function detectIntent(messageText?: string): Intent {
  const text = normalizeSpanishText(messageText);
  const raw = (messageText || "").toLowerCase().trim();

  if (!text) {
    return "unknown";
  }

  if (
    text === "cuanto" ||
    text === "cuánto" ||
    text === "price" ||
    text === "precio" ||
    text === "cost" ||
    text === "how much" ||
    text.includes("que precio") ||
    text.includes("cuanto cuesta") ||
    text.includes("cuanto cuestan") ||
    text.includes("cuanto sale") ||
    text.includes("cuanto salen") ||
    text.includes("en cuanto salen") ||
    text.includes("precio tienen") ||
    text.includes("how much") ||
    text.includes("what is the price") ||
    text.includes("what's the price") ||
    text.includes("price?") ||
    text.includes("cost?") ||
    ((text.includes("cuanto") || text.includes("vale")) &&
      containsFuzzyWord(raw, ["precio"], 2))
  ) {
    return "price";
  }

  if (
    text.includes("me puede dar mas informacion") ||
    text.includes("me puede dar mas info") ||
    text.includes("es la primer vez que pongo camaras") ||
    text.includes("es la primera vez que pongo camaras") ||
    text === "info" ||
    text === "informacion" ||
    text === "información" ||
    text.includes("more info") ||
    text.includes("information") ||
    containsFuzzyWord(raw, ["paquete"], 2)
  ) {
    return "info";
  }

  if (
    text.includes("como se ven de noche") ||
    text.includes("como se ven las camaras de noche") ||
    text.includes("how does it look") ||
    text.includes("how do they look") ||
    (text.includes("como se ven") && containsFuzzyWord(raw, ["noche"], 2))
  ) {
    return "night_vision";
  }

  if (
    text.includes("son alambricas o sin cable") ||
    text.includes("son inalambricas o con cables") ||
    text.includes("son inalambricas o con alambres") ||
    text.includes("son alambricas") ||
    text.includes("son inalambricas") ||
    text.includes("wired") ||
    text.includes("wireless")
  ) {
    return "wired";
  }

  if (
    text.includes("si yo pongo las camaras") ||
    text.includes("cuanto me cobra por la instalacion") ||
    text.includes("installation only") ||
    (text.includes("solo") && containsFuzzyWord(raw, ["instalacion"], 2))
  ) {
    return "install_only";
  }

  if (
    text.includes("se me hace muy caro") ||
    text.includes("se me hacen muy caras") ||
    text.includes("es lo menos que cuestan") ||
    text.includes("no tengo el dinero") ||
    text.includes("es mas caro de lo que pense") ||
    text.includes("too expensive") ||
    text.includes("expensive") ||
    text.includes("found cheaper")
  ) {
    return "expensive";
  }

  if (
    text.includes("cuanto tiempo graban") ||
    text.includes("how long do they record")
  ) {
    return "recording";
  }

  if (
    text.includes("solamente tengo tiempo el fin de semana") ||
    text.includes("solo tengo tiempo el fin de semana") ||
    text.includes("this weekend") ||
    text.includes("weekend")
  ) {
    return "weekend";
  }

  if (
    text.includes("para mi casa") ||
    text.includes("para casa") ||
    text === "casa" ||
    text === "hogar" ||
    text === "house" ||
    text === "home"
  ) {
    return "home";
  }

  if (
    text.includes("para negocio") ||
    text.includes("para mi negocio") ||
    text.includes("las quiero para negocio") ||
    text === "negocio" ||
    text === "empresa" ||
    text === "business" ||
    text === "commercial"
  ) {
    return "business";
  }

  if (
    text.includes("hola") ||
    text.includes("buenas") ||
    text === "buenas" ||
    text === "hola" ||
    text === "hi" ||
    text === "hello"
  ) {
    return "greeting";
  }

  return "unknown";
}