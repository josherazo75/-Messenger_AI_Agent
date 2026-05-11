export type CommunicationStyle =
  | "professional_spanish"
  | "everyday_spanish"
  | "simple_spanish"
  | "professional_english"
  | "everyday_english"
  | "simple_english"
  | "mixed_language";

export const STYLE_PLAYBOOK = {
  professional_spanish: {
    tone: "respectful, polished, consultative",
    sentenceStyle: "complete but not too long",
    questionStyle: "one clear question",
  },
  everyday_spanish: {
    tone: "friendly, natural, clear",
    sentenceStyle: "simple and conversational",
    questionStyle: "one easy next question",
  },
  simple_spanish: {
    tone: "warm, direct, easy to understand",
    sentenceStyle: "short and clear",
    questionStyle: "one very simple question",
  },
  professional_english: {
    tone: "calm, professional, consultative",
    sentenceStyle: "complete and structured",
    questionStyle: "one clear next-step question",
  },
  everyday_english: {
    tone: "friendly, simple, natural",
    sentenceStyle: "short to medium",
    questionStyle: "one easy question",
  },
  simple_english: {
    tone: "clear, warm, basic",
    sentenceStyle: "short and direct",
    questionStyle: "one simple question",
  },
  mixed_language: {
    tone: "natural, not forced",
    sentenceStyle: "respond in dominant language, allow common shared words",
    questionStyle: "one simple question in dominant language",
  },
} as const;