import { LEAD_SCORING, LeadTemperature } from "../config/lead-scoring";
import { normalizeSpanishText } from "./spanish-normalizer.service";
import { detectLanguage } from "./intent.service";
import { LeadRecord } from "./lead.service";

export interface LeadScoreResult {
  temperature: LeadTemperature;
  score: number;
  reasons: string[];
}

function normalize(text?: string): string {
  return (text || "").toLowerCase().trim();
}

function includesAny(text: string, signals: readonly string[]): string[] {
  return signals.filter((signal) => text.includes(signal));
}

function hasPhoneNumber(text: string): boolean {
  return /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/.test(text);
}

function detectCameraCount(text: string): number | null {
  if (hasPhoneNumber(text)) {
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

export function scoreLead(
  messageText?: string,
  lead?: LeadRecord | null
): LeadScoreResult {
  const raw = normalize(messageText);
  const normalized = normalizeSpanishText(messageText);
  const merged = `${raw} ${normalized}`.trim();
  const reasons: string[] = [];
  let score = 0;

  const hotMatches = includesAny(merged, LEAD_SCORING.hotSignals);
  const warmMatches = includesAny(merged, LEAD_SCORING.warmSignals);
  const coldMatches = includesAny(merged, LEAD_SCORING.coldSignals);

  if (hotMatches.length > 0) {
    score += 4;
    reasons.push(`hot signals: ${hotMatches.join(", ")}`);
  }

  if (warmMatches.length > 0) {
    score += 2;
    reasons.push(`warm signals: ${warmMatches.join(", ")}`);
  }

  if (coldMatches.length > 0) {
    score += 1;
    reasons.push(`cold signals: ${coldMatches.join(", ")}`);
  }

  const cameraCount = detectCameraCount(merged);
  if (cameraCount !== null) {
    if (cameraCount >= 6) {
      score += 4;
      reasons.push(`large camera count: ${cameraCount}`);
    } else if (cameraCount >= 4) {
      score += 2;
      reasons.push(`standard buying count: ${cameraCount}`);
    } else if (cameraCount >= 2) {
      score += 1;
      reasons.push(`small but real install count: ${cameraCount}`);
    }
  }

  const hasCustomerPhoneNumber = hasPhoneNumber(merged);
  if (hasCustomerPhoneNumber) {
    score += 4;
    reasons.push("customer sent phone number");
  }

  const hasAddressLikeDetail =
    /\b\d{3,6}\s+[a-z0-9]+\s+(st|street|ave|avenue|rd|road|dr|drive|blvd|lane|ln|court|ct)\b/i.test(
      merged
    );
  if (hasAddressLikeDetail) {
    score += 4;
    reasons.push("customer sent address-like detail");
  }

  const language = detectLanguage(messageText);
  if (language !== "unknown") {
    reasons.push(`detected language: ${language}`);
  }

  if (lead) {
    if (lead.property_type) {
      score += 1;
      reasons.push("property type known");
    }

    if (lead.city_or_zip) {
      score += 1;
      reasons.push("city/zip known");
    }

    if (lead.camera_count) {
      score += 1;
      reasons.push("camera count known");
    }

    if (lead.timeline) {
      score += 2;
      reasons.push("timeline known");
    }

    if (
      lead.property_type &&
      lead.city_or_zip &&
      lead.camera_count &&
      lead.timeline
    ) {
      score += 3;
      reasons.push("fully qualified lead");
    }
  }

  let temperature: LeadTemperature = "cold";

  if (score >= 8) {
    temperature = "hot";
  } else if (score >= 4) {
    temperature = "warm";
  }

  return {
    temperature,
    score,
    reasons,
  };
}