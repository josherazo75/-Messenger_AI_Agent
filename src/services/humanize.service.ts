const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const HUMANIZE_REPLIES = process.env.HUMANIZE_REPLIES === "true";
const MODEL = "claude-sonnet-4-20250514";

const SYSTEM_PROMPT = `You are a tone rewriter for a security camera installation business.

You will receive:
1. A mechanical bot reply (the MESSAGE TO REWRITE)
2. The customer's original message (for language/tone context)

YOUR ONLY JOB:
Rewrite the bot reply to sound warm, natural, and human — like a friendly sales rep texting from their phone.

STRICT RULES:
- Do NOT change the meaning, intent, or information
- Do NOT add prices, facts, discounts, or promises
- Do NOT remove questions already in the original
- Do NOT add new questions
- Keep the same language as the original
- Keep it SHORT — 1 to 3 sentences max
- Do NOT use emojis unless the customer used them first
- Do NOT sound corporate or robotic
- Do NOT start with "Of course", "Absolutely", "Great", "Sure thing", or similar filler
- Respond with ONLY the rewritten message`;

function normalize(text?: string): string {
  return (text || "").toLowerCase().trim();
}

export function isHandoffMessage(reply: string): boolean {
  const text = normalize(reply);

  return (
    text.includes("mejor número") ||
    text.includes("best phone number") ||
    text.includes("confirmar precio exacto") ||
    text.includes("confirm the exact price") ||
    text.includes("confirm directly") ||
    text.includes("instalador tendría que confirmar") ||
    text.includes("installer would need to confirm") ||
    text.includes("comunicarnos") ||
    text.includes("reach you") ||
    text.includes("availability") ||
    text.includes("disponibilidad") ||
    text.includes("coordinar") ||
    text.includes("schedule")
  );
}

export async function humanizeReply(
  mechanicalReply: string,
  customerMessage?: string
): Promise<string> {
  if (!HUMANIZE_REPLIES) {
    return mechanicalReply;
  }

  if (!mechanicalReply || mechanicalReply.trim().length < 10) {
    return mechanicalReply;
  }

  if (isHandoffMessage(mechanicalReply)) {
    return mechanicalReply;
  }

  if (!ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY not set — skipping humanization.");
    return mechanicalReply;
  }

  try {
    const userContent = `MESSAGE TO REWRITE:
${mechanicalReply}

CUSTOMER'S ORIGINAL MESSAGE:
${customerMessage ?? "(none)"}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 256,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userContent }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`Humanize API error ${response.status}: ${err}`);
      return mechanicalReply;
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };

    const humanized =
      data.content.find((b) => b.type === "text")?.text?.trim() ?? "";

    if (!humanized) {
      return mechanicalReply;
    }

    console.log(`[Humanize] "${mechanicalReply}" -> "${humanized}"`);
    return humanized;
  } catch (error) {
    console.error("Humanize service error:", error);
    return mechanicalReply;
  }
}