import {
  MESSAGE_FAMILY_MAP,
  MessageFamilyDefinition,
} from "../config/message-family-map";
import { normalizeSpanishText } from "./spanish-normalizer.service";

export interface MessageFamilyMatch {
  matched: boolean;
  family: MessageFamilyDefinition | null;
  score: number;
}

function normalize(text?: string): string {
  return (text || "").toLowerCase().trim();
}

export function classifyMessageFamily(messageText?: string): MessageFamilyMatch {
  const raw = normalize(messageText);
  const normalizedSpanish = normalizeSpanishText(messageText);
  const merged = `${raw} ${normalizedSpanish}`.trim();

  let bestFamily: MessageFamilyDefinition | null = null;
  let bestScore = 0;

  for (const family of MESSAGE_FAMILY_MAP) {
    let score = 0;

    for (const pattern of family.patterns) {
      const normalizedPattern = normalize(pattern);

      if (merged.includes(normalizedPattern)) {
        score += normalizedPattern.split(" ").length >= 2 ? 3 : 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestFamily = family;
    }
  }

  if (!bestFamily || bestScore <= 0) {
    return {
      matched: false,
      family: null,
      score: 0,
    };
  }

  return {
    matched: true,
    family: bestFamily,
    score: bestScore,
  };
}