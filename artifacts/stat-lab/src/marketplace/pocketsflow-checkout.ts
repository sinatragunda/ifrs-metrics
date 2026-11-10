import { Pocketsflow } from "pocketsflow";
import type { CartItem } from "./types";

const DEFAULT_API_KEY = "pk_live_9721d286f4f0f43a64e5c5fe76c3a241ce850d277d161446";
const DEFAULT_SUCCESS_URL = "https://hardy-poise-hybrid.ngrok-free.dev/payments/success";
const DEFAULT_CANCEL_URL = "https://hardy-poise-hybrid.ngrok-free.dev/payments/error";

function env(name: string, fallback: string) {
  const value = import.meta.env[name];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export async function startPocketsflowCheckout(
  cartItems: CartItem[],
  options?: { customerEmail?: string | null },
) {
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
  if (total <= 0) {
    throw new Error("Add a paid item before starting Pocketsflow checkout.");
  }

  const apiKey = env("VITE_POCKETSFLOW_API_KEY", DEFAULT_API_KEY);
  const successUrl = env("VITE_POCKETSFLOW_SUCCESS_URL", DEFAULT_SUCCESS_URL);
  const cancelUrl = env("VITE_POCKETSFLOW_CANCEL_URL", DEFAULT_CANCEL_URL);

  const pf = new Pocketsflow({ apiKey });
  const checkoutId = crypto.randomUUID().slice(0, 8);
  const lines = cartItems
    .map((item) => `${item.serviceId}:${item.tierName}:${item.price}${item.period}`)
    .join("|");
  // Keep serialized Pocketsflow metadata under 500 characters.
  const metadataBudget = 500;
  let note = `id=${checkoutId};amt=${total.toFixed(2)};n=${cartItems.length};${lines}`;
  let metadata: Record<string, string> = { note };
  while (JSON.stringify(metadata).length > metadataBudget && note.length > 24) {
    note = `${note.slice(0, Math.max(24, note.length - 24))}...`;
    metadata = { note };
  }

  const subscription = await pf.subscriptionOffers.create({
    frequency: "monthly",
    name: `IFRS Metrics subscription ${checkoutId}`,
    price: total,
    callbackUrl: successUrl,
  });

  const productId = subscription._id;
  if (!productId) {
    throw new Error("Pocketsflow did not return a subscription offer id.");
  }

  const checkoutWindow = window.open("", "_blank");
  const session = await pf.checkout.create({
    productId,
    cancelUrl,
    successUrl,
    customerEmail: options?.customerEmail || undefined,
    metadata,
  });

  if (!session?.url) {
    checkoutWindow?.close();
    throw new Error("Pocketsflow did not return a checkout URL.");
  }

  if (checkoutWindow) {
    checkoutWindow.location.href = session.url;
  } else {
    window.location.href = session.url;
  }
}
