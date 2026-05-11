export interface MessengerMessage {
  mid?: string;
  text?: string;
  is_echo?: boolean;
}

export interface MessengerSender {
  id?: string;
}

export interface MessengerRecipient {
  id?: string;
}

export interface MessagingEvent {
  sender?: MessengerSender;
  recipient?: MessengerRecipient;
  timestamp?: number;
  message?: MessengerMessage;
}

export interface WebhookEntry {
  id?: string;
  time?: number;
  messaging?: MessagingEvent[];
}

export interface MessengerWebhookBody {
  object?: string;
  entry?: WebhookEntry[];
}