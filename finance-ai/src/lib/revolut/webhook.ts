/**
 * Revolut Webhook Handler
 *
 * Verifies and processes incoming webhook events from Revolut.
 */

import crypto from "crypto";

export interface RevolutWebhookEvent {
  event: string;
  timestamp: string;
  data: {
    id: string;
    type?: string;
    state?: string;
    [key: string]: unknown;
  };
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export function parseWebhookEvent(body: unknown): RevolutWebhookEvent {
  const event = body as RevolutWebhookEvent;

  if (!event.event || !event.data) {
    throw new Error("Invalid webhook event payload");
  }

  return event;
}

export const WEBHOOK_EVENTS = {
  TRANSACTION_CREATED: "TransactionCreated",
  TRANSACTION_STATE_CHANGED: "TransactionStateChanged",
} as const;
