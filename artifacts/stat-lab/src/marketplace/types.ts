export type PricingTier = {
  id?: string;
  name: string;
  price: number;
  period: string;
  description?: string;
  features: string[];
  popular?: boolean;
};

export type Service = {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  cartOption?: boolean;
  rating: number;
  reviews: number;
  tiers: PricingTier[];
  badge?: string;
};

export type CartSource = "lab" | "marketplace";

export type CartItem = {
  serviceId: string;
  serviceName: string;
  tierName: string;
  price: number;
  period: string;
  source: CartSource;
  detail?: string;
};

export type LabCheckoutSelection = {
  plan: "fortnight" | "monthly";
  lightSupport: "fortnight" | "monthly" | null;
  dedicatedSupport: "fortnight" | "monthly" | null;
};
