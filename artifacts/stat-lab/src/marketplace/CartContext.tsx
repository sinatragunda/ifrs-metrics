import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { CORE_SERVICE_ID, LOANS_DEPOSITS_SERVICES } from "./data";
import {
  labSelectionToCartItems,
  readMarketplaceCart,
  writeMarketplaceCart,
} from "./storage";
import type { CartItem, LabCheckoutSelection, PricingTier } from "./types";

type CartContextValue = {
  cartItems: CartItem[];
  addCartItem: (serviceId: string, tier: PricingTier) => void;
  upsertLabSelection: (selection: LabCheckoutSelection) => void;
  ensureMarketplaceCore: () => void;
  removeCartItem: (index: number) => void;
  resetCartItems: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function getDefaultCoreItems(): CartItem[] {
  return LOANS_DEPOSITS_SERVICES.filter((service) => service.id === CORE_SERVICE_ID).map((service) => {
    const tier = service.tiers[0];
    return {
      serviceId: service.id,
      serviceName: service.name,
      tierName: tier.name,
      price: tier.price,
      period: tier.period,
      source: "marketplace" as const,
    };
  });
}

function withCore(items: CartItem[]): CartItem[] {
  if (items.some((item) => item.serviceId === CORE_SERVICE_ID)) return items;
  return [...getDefaultCoreItems(), ...items];
}

function toCartItem(serviceId: string, tier: PricingTier): CartItem | null {
  const service = LOANS_DEPOSITS_SERVICES.find((item) => item.id === serviceId);
  if (!service) return null;
  return {
    serviceId: service.id,
    serviceName: service.name,
    tierName: tier.name,
    price: tier.price,
    period: tier.period,
    source: "marketplace",
  };
}

export function MarketplaceCartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => readMarketplaceCart() ?? []);

  useEffect(() => {
    writeMarketplaceCart(cartItems);
  }, [cartItems]);

  const resetCartItems = useCallback(() => {
    setCartItems(getDefaultCoreItems());
  }, []);

  const ensureMarketplaceCore = useCallback(() => {
    setCartItems((previous) => withCore(previous));
  }, []);

  const removeCartItem = useCallback((index: number) => {
    setCartItems((previous) => {
      const target = previous[index];
      if (!target || target.serviceId === CORE_SERVICE_ID) return previous;
      const next = previous.filter((_, itemIndex) => itemIndex !== index);
      const stillHasMarketplace = next.some((item) => item.source === "marketplace");
      return stillHasMarketplace ? withCore(next) : next;
    });
  }, []);

  const addCartItem = useCallback((serviceId: string, tier: PricingTier) => {
    const next = toCartItem(serviceId, tier);
    if (!next) return;
    setCartItems((previous) => {
      const existingIndex = previous.findIndex((item) => item.serviceId === serviceId);
      if (existingIndex === -1) return withCore([...previous, next]);
      if (previous[existingIndex].tierName === tier.name) return previous;
      const updated = [...previous];
      updated[existingIndex] = next;
      return withCore(updated);
    });
  }, []);

  const upsertLabSelection = useCallback((selection: LabCheckoutSelection) => {
    setCartItems((previous) => {
      const withoutLab = previous.filter((item) => item.source !== "lab");
      return [...withoutLab, ...labSelectionToCartItems(selection)];
    });
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addCartItem,
        upsertLabSelection,
        ensureMarketplaceCore,
        removeCartItem,
        resetCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useMarketplaceCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useMarketplaceCart must be used within MarketplaceCartProvider");
  return context;
}
