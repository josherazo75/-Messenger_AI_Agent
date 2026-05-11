interface SendTextMessageInput {
  recipientId: string;
  text: string;
}

export async function sendTextMessage(input: SendTextMessageInput): Promise<void> {
  const pageAccessToken = process.env.PAGE_ACCESS_TOKEN;

  if (!pageAccessToken) {
    throw new Error("Missing PAGE_ACCESS_TOKEN in .env");
  }

  const response = await fetch(
    `https://graph.facebook.com/v22.0/me/messages?access_token=${pageAccessToken}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_type: "RESPONSE",
        recipient: { id: input.recipientId },
        message: { text: input.text },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Messenger Send API error:", data);
    throw new Error("Failed to send Messenger message");
  }

  console.log("Messenger message sent successfully:", data);
}