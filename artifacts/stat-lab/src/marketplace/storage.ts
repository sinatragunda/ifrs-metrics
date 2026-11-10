import type { CartItem, LabCheckoutSelection } from "./types";

export const MARKETPLACE_CART_KEY = "ifrs-unified-cart-v1";
export const LEGACY_MARKETPLACE_CART_KEY = "ifrs-marketplace-cart-v1";
export const LEGACY_LAB_CHECKOUT_KEY = "ifrs-lab-checkout";
export const CHECKOUT_RETURN_KEY = "ifrs-checkout-return";
export const MARKETPLACE_RETURN_PATH = "/loans-deposits/marketplace?cart=open";
export const LAB_RETURN_PATH = "/ifrs#pricing";

export const LAB_SUBSCRIPTION_ID = "lab-subscription";
export const LAB_LIGHT_SUPPORT_ID = "lab-light-support";
export const LAB_DEDICATED_SUPPORT_ID = "lab-dedicated-support";

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as CartItem;
  return (
    typeof item.serviceId === "string" &&
    typeof item.serviceName === "string" &&
    typeof item.tierName === "string" &&
    typeof item.price === "number" &&
    typeof item.period === "string" &&
    (item.source === "lab" || item.source === "marketplace" || item.source === undefined)
  );
}

function normalizeItem(item: CartItem): CartItem {
  return {
    ...item,
    source: item.source ?? (item.serviceId.startsWith("lab-") ? "lab" : "marketplace"),
  };
}

export function labSelectionToCartItems(selection: LabCheckoutSelection): CartItem[] {
  const items: CartItem[] = [];

  if (selection.plan) {
    items.push({
      serviceId: LAB_SUBSCRIPTION_ID,
      serviceName: "IFRS Lab · All reports",
      tierName: selection.plan === "fortnight" ? "Fortnightly" : "Monthly",
      price: selection.plan === "fortnight" ? 3.99 : 6.99,
      period: selection.plan === "fortnight" ? "/fortnight" : "/mo",
      source: "lab",
      detail: `Renews ${selection.plan === "fortnight" ? "fortnightly" : "monthly"} · IFRS 16 / 9 / 17`,
    });
  } else if (selection.lightSupport) {
    items.push({
      serviceId: LAB_LIGHT_SUPPORT_ID,
      serviceName: "IFRS Lab · Light support",
      tierName: selection.lightSupport === "fortnight" ? "Fortnightly" : "Monthly",
      price: selection.lightSupport === "fortnight" ? 80 : 120,
      period: selection.lightSupport === "fortnight" ? "/fortnight" : "/mo",
      source: "lab",
      detail: "Requested tasks · tax excluded",
    });
  } else if (selection.dedicatedSupport) {
    items.push({
      serviceId: LAB_DEDICATED_SUPPORT_ID,
      serviceName: "IFRS Lab · Dedicated support",
      tierName: selection.dedicatedSupport === "fortnight" ? "Fortnightly" : "Monthly",
      price: selection.dedicatedSupport === "fortnight" ? 180 : 300,
      period: selection.dedicatedSupport === "fortnight" ? "/fortnight" : "/mo",
      source: "lab",
      detail: "Technical assistance · tax excluded",
    });
  }

  return items;
}

function readLegacyLabItems(): CartItem[] {
  try {
    const value = JSON.parse(sessionStorage.getItem(LEGACY_LAB_CHECKOUT_KEY) || "null") as Partial<LabCheckoutSelection> | null;
    const cadence = (item: unknown): item is "fortnight" | "monthly" => item === "fortnight" || item === "monthly";
    const plan = cadence(value?.plan) ? value.plan : null;
    const lightSupport = cadence(value?.lightSupport) ? value.lightSupport : null;
    const dedicatedSupport = cadence(value?.dedicatedSupport) ? value.dedicatedSupport : null;
    if (!plan && !lightSupport && !dedicatedSupport) return [];
    // Prefer a single option if legacy storage had multiple.
    if (plan) return labSelectionToCartItems({ plan, lightSupport: null, dedicatedSupport: null });
    if (lightSupport) return labSelectionToCartItems({ plan: null, lightSupport, dedicatedSupport: null });
    return labSelectionToCartItems({ plan: null, lightSupport: null, dedicatedSupport });
  } catch {
    return [];
  }
}

export function readMarketplaceCart(): CartItem[] | null {
  try {
    const raw =
      sessionStorage.getItem(MARKETPLACE_CART_KEY) ??
      sessionStorage.getItem(LEGACY_MARKETPLACE_CART_KEY);
    const parsed = JSON.parse(raw || "null") as unknown;
    const fromStorage = Array.isArray(parsed)
      ? parsed.filter(isCartItem).map(normalizeItem)
      : [];
    const labLegacy = readLegacyLabItems();
    const withoutLabIds = new Set(
      [LAB_SUBSCRIPTION_ID, LAB_LIGHT_SUPPORT_ID, LAB_DEDICATED_SUPPORT_ID],
    );
    const merged = [
      ...fromStorage.filter((item) => !withoutLabIds.has(item.serviceId) || item.source === "lab"),
    ];
    // Prefer unified cart lab items; otherwise migrate legacy lab draft once.
    const hasLab = merged.some((item) => item.source === "lab");
    const items = hasLab ? merged : [...merged.filter((item) => item.source !== "lab"), ...labLegacy];
    return items.length ? items : null;
  } catch {
    return null;
  }
}

export function writeMarketplaceCart(items: CartItem[]) {
  sessionStorage.setItem(MARKETPLACE_CART_KEY, JSON.stringify(items));
  // Keep legacy keys in sync so older checkout readers stay coherent.
  sessionStorage.setItem(LEGACY_MARKETPLACE_CART_KEY, JSON.stringify(items.filter((item) => item.source === "marketplace")));
  const labSubscription = items.find((item) => item.serviceId === LAB_SUBSCRIPTION_ID);
  const light = items.find((item) => item.serviceId === LAB_LIGHT_SUPPORT_ID);
  const dedicated = items.find((item) => item.serviceId === LAB_DEDICATED_SUPPORT_ID);
  if (labSubscription || light || dedicated) {
    sessionStorage.setItem(
      LEGACY_LAB_CHECKOUT_KEY,
      JSON.stringify({
        plan: labSubscription
          ? labSubscription.period.includes("fortnight")
            ? "fortnight"
            : "monthly"
          : null,
        lightSupport: light ? (light.period.includes("fortnight") ? "fortnight" : "monthly") : null,
        dedicatedSupport: dedicated
          ? dedicated.period.includes("fortnight")
            ? "fortnight"
            : "monthly"
          : null,
      }),
    );
  }
}

export function mergeLabSelectionIntoCart(
  existing: CartItem[] | null,
  selection: LabCheckoutSelection,
): CartItem[] {
  const current = existing ?? [];
  const withoutLab = current.filter((item) => item.source !== "lab");
  return [...withoutLab, ...labSelectionToCartItems(selection)];
}

export function setCheckoutReturnPath(path: string) {
  sessionStorage.setItem(CHECKOUT_RETURN_KEY, path);
}

export function readCheckoutReturnPath(fallback = LAB_RETURN_PATH) {
  try {
    return sessionStorage.getItem(CHECKOUT_RETURN_KEY) || fallback;
  } catch {
    return fallback;
  }
}

export function cartHasLabItems(items: CartItem[]) {
  return items.some((item) => item.source === "lab");
}

export function cartHasMarketplaceItems(items: CartItem[]) {
  return items.some((item) => item.source === "marketplace");
}
