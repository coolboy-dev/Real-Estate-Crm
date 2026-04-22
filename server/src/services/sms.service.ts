import twilio from "twilio";
import { env } from "../config/env.js";

const client =
  env.TWILIO_SID && env.TWILIO_TOKEN
    ? twilio(env.TWILIO_SID, env.TWILIO_TOKEN)
    : null;

export async function sendSMS(to: string, body: string) {
  if (!client) {
    console.warn("Twilio not configured – SMS skipped:", body);
    return;
  }
  await client.messages.create({ from: env.TWILIO_PHONE as string, to, body });
}
