import { KNOWLEDGE_BASE, KnowledgeTopic } from "../config/knowledge-base";
import { normalizeSpanishText } from "./spanish-normalizer.service";

export interface TopicMatch {
  matched: boolean;
  topic: KnowledgeTopic | null;
  score: number;
}

function normalize(text?: string): string {
  return (text || "").toLowerCase().trim();
}

export function classifyKnowledgeTopic(messageText?: string): TopicMatch {
  const raw = normalize(messageText);
  const normalizedSpanish = normalizeSpanishText(messageText);
  const merged = `${raw} ${normalizedSpanish}`.trim();

  let bestTopic: KnowledgeTopic | null = null;
  let bestScore = 0;

  for (const topic of KNOWLEDGE_BASE) {
    let score = 0;

    for (const keyword of topic.keywords) {
      if (merged.includes(normalize(keyword))) {
        score += keyword.split(" ").length >= 2 ? 3 : 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }

  if (!bestTopic || bestScore <= 0) {
    return {
      matched: false,
      topic: null,
      score: 0,
    };
  }

  return {
    matched: true,
    topic: bestTopic,
    score: bestScore,
  };
}