import { Request, Response } from "express";
import { MessengerWebhookBody } from "../types/messenger";
import {
  saveMessage,
  isOutOfOrderIncomingMessage,
} from "../services/message.service";
import { buildQualifiedReply } from "../services/qualification.service";
import { humanizeReply } from "../services/humanize.service";
import {
  scheduleFollowUp,
  completeFollowUp,
} from "../services/followup.service";
import { sendTextMessage } from "../services/messenger.service";

function shouldScheduleFollowUp(reply: string): boolean {
  return reply.includes("?");
}

export function verifyWebhook(req: Request, res: Response): Response {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  const verifyToken = process.env.META_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    console.log("Webhook verified successfully.");
    return res.status(200).send(challenge);
  }

  return res.status(403).send("Verification failed.");
}

export async function receiveWebhook(
  req: Request,
  res: Response
): Promise<Response> {
  const body = req.body as MessengerWebhookBody;

  if (body.object !== "page") {
    return res.status(404).send("Not Found");
  }

  res.status(200).send("EVENT_RECEIVED");

  for (const entry of body.entry ?? []) {
    for (const event of entry.messaging ?? []) {
      const senderId = event.sender?.id;
      const recipientId = event.recipient?.id;
      const timestamp = event.timestamp;
      const messageText = event.message?.text;
      const messageId = event.message?.mid;

      if (event.message?.is_echo) {
        continue;
      }

      console.log("New Messenger event received:");
      console.log("senderId:", senderId);
      console.log("recipientId:", recipientId);
      console.log("timestamp:", timestamp);
      console.log("messageId:", messageId);
      console.log("messageText:", messageText);
      console.log("-----------------------------");

      if (senderId && isOutOfOrderIncomingMessage(senderId, timestamp)) {
        console.log("Out-of-order incoming message ignored.");
        continue;
      }

      const savedIncoming = saveMessage({
        senderId,
        recipientId,
        messageId,
        messageText,
        direction: "incoming",
        timestamp,
      });

      if (!savedIncoming) {
        continue;
      }

      if (senderId) {
        completeFollowUp(senderId);
      }

      const mechanicalReply = buildQualifiedReply(senderId ?? "", messageText);
      const reply = await humanizeReply(mechanicalReply, messageText);

      console.log("Bot reply:");
      console.log(reply);
      console.log("=============================");

      if (senderId && reply) {
        try {
          await sendTextMessage({
            recipientId: senderId,
            text: reply,
          });
        } catch (error) {
          console.error("Failed to send Messenger reply:", error);
        }
      }

      saveMessage({
        senderId: recipientId,
        recipientId: senderId,
        messageId: `bot-${messageId}`,
        messageText: reply,
        direction: "outgoing",
        timestamp: Date.now(),
      });

      if (senderId && shouldScheduleFollowUp(mechanicalReply)) {
        scheduleFollowUp(senderId, mechanicalReply, timestamp);
        console.log("Follow-up scheduled.");
      }
    }
  }

  return res as unknown as Response;
}