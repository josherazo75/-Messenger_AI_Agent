import { normalizeSpanishText } from "./spanish-normalizer.service";
import { getLeadByContactId } from "./lead.service";

export type PriceInquiryType =
  | "not_price"
  | "weak_price_opener"
  | "specific_price_request"
  | "contextual_price_request";

export interface PriceInquiryResult {
  type: PriceInquiryType;
  reasons: string[];
}

function normalize(text?: string): string {
  return normalizeSpanishText(text).toLowerCase().trim();
}

export function detectPriceInquiryType(
  contactId: string,
  messageText?: string
): PriceInquiryResult {
  const text = normalize(messageText);
  const reasons: string[] = [];

  if (!text) {
    return { type: "not_price", reasons };
  }

  const lead = getLeadByContactId(contactId);

  const weakOpeners = [
    "precio",
    "price",
    "cuanto",
    "cuánto",
    "how much",
    "cost",
  ];

  const specificSignals = [
    "por 2 camaras",
    "por 3 camaras",
    "por 4 camaras",
    "por 5 camaras",
    "por 6 camaras",
    "for 2 cameras",
    "for 3 cameras",
    "for 4 cameras",
    "for 5 cameras",
    "for 6 cameras",
    "installed",
    "con instalacion",
    "con instalación",
    "installation included",
    "with installation",
  ];

  if (weakOpeners.includes(text)) {
    reasons.push("short standalone price opener");
    if (lead?.property_type || lead?.city_or_zip || lead?.camera_count) {
      reasons.push("lead already has context");
      return {
        type: "contextual_price_request",
        reasons,
      };
    }

    return {
      type: "weak_price_opener",
      reasons,
    };
  }

  const asksPrice =
    text.includes("precio") ||
    text.includes("cuanto") ||
    text.includes("cuánto") ||
    text.includes("how much") ||
    text.includes("price") ||
    text.includes("cost") ||
    text.includes("vale");

  const hasSpecificSignal = specificSignals.some((signal) => text.includes(signal));

  if (asksPrice && hasSpecificSignal) {
    reasons.push("specific price request with package/install detail");
    return {
      type: "specific_price_request",
      reasons,
    };
  }

  if (asksPrice && (lead?.property_type || lead?.city_or_zip || lead?.camera_count)) {
    reasons.push("price question with existing lead context");
    return {
      type: "contextual_price_request",
      reasons,
    };
  }

  if (asksPrice) {
    reasons.push("general price question");
    return {
      type: "specific_price_request",
      reasons,
    };
  }

  return {
    type: "not_price",
    reasons,
  };
}