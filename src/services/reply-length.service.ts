export type ReplyLength = "short" | "medium" | "long";

function normalize(text?: string): string {
  return (text || "").toLowerCase().trim();
}

function wordCount(text?: string): number {
  const value = normalize(text);
  if (!value) return 0;
  return value.split(/\s+/).filter(Boolean).length;
}

function isVeryShortMessage(text?: string): boolean {
  const value = normalize(text);

  return (
    value.length <= 12 ||
    value === "caro" ||
    value === "muy caro" ||
    value === "esta caro" ||
    value === "está caro" ||
    value === "too expensive" ||
    value === "expensive" ||
    value === "price" ||
    value === "precio" ||
    value === "cuanto" ||
    value === "cuánto"
  );
}

function soundsImpatient(text?: string): boolean {
  const value = normalize(text);

  return (
    value.includes("just tell me") ||
    value.includes("just answer") ||
    value.includes("only") ||
    value.includes("simple") ||
    value.includes("solo dime") ||
    value.includes("nomas dime") ||
    value.includes("nomas") ||
    value.includes("rápido") ||
    value.includes("rapido")
  );
}

function isStrongResistance(text?: string): boolean {
  const value = normalize(text);

  return (
    value.includes("too expensive") ||
    value.includes("found cheaper") ||
    value.includes("can you do less") ||
    value.includes("best price") ||
    value.includes("what is the lowest") ||
    value.includes("lowest price") ||
    value.includes("out of my budget") ||
    value.includes("se me hace muy caro") ||
    value.includes("no tengo mucho presupuesto") ||
    value.includes("encontre mas barato") ||
    value.includes("encontré más barato") ||
    value.includes("lo menos") ||
    value.includes("descuento")
  );
}

export function chooseReplyLength(options: {
  messageText?: string;
  scenario:
    | "price"
    | "budget"
    | "layout_access"
    | "distance"
    | "internet_phone_viewing"
    | "equipment_quality"
    | "urgency_booking"
    | "custom_risky_technical"
    | "general";
  hasLeadContext?: boolean;
}): ReplyLength {
  const text = normalize(options.messageText);
  const count = wordCount(text);

  if (options.scenario === "urgency_booking") {
    return "short";
  }

  if (options.scenario === "price") {
    return isVeryShortMessage(text) ? "short" : "medium";
  }

  if (options.scenario === "budget") {
    if (soundsImpatient(text)) {
      return "short";
    }

    if (isStrongResistance(text)) {
      return options.hasLeadContext ? "long" : "medium";
    }

    return isVeryShortMessage(text) ? "short" : "medium";
  }

  if (
    options.scenario === "layout_access" ||
    options.scenario === "distance" ||
    options.scenario === "custom_risky_technical"
  ) {
    if (isVeryShortMessage(text)) {
      return "short";
    }

    return count >= 8 ? "long" : "medium";
  }

  if (
    options.scenario === "internet_phone_viewing" ||
    options.scenario === "equipment_quality"
  ) {
    return count <= 4 ? "short" : "medium";
  }

  if (count <= 3) {
    return "short";
  }

  if (count >= 10) {
    return "long";
  }

  return "medium";
}