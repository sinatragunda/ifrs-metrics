import { useState, memo, type ComponentType } from "react";
import {
  Activity,
  BarChart3,
  Check,
  Database,
  FileSpreadsheet,
  Layers3,
  Lock,
  MessageSquareText,
  Search,
  Sparkles,
  Table2,
  Upload,
} from "lucide-react";
import type { CartItem, PricingTier, Service } from "../types";
import { StarRating } from "./StarRating";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Layers3,
  Activity,
  FileSpreadsheet,
  Database,
  BarChart3,
  Sparkles,
  Table2,
  Search,
  Upload,
  Lock,
  MessageSquareText,
};

export const ServiceCard = memo(function ServiceCard({
  service,
  onAddToCart,
  cartItems,
}: {
  service: Service;
  onAddToCart: (serviceId: string, tier: PricingTier) => void;
  cartItems: CartItem[];
}) {
  const [selectedTier, setSelectedTier] = useState(
    Math.max(0, service.tiers.findIndex((tier) => tier.popular)),
  );
  const tier = service.tiers[selectedTier] ?? service.tiers[0];
  const cartItemForService = cartItems.find((item) => item.serviceId === service.id);
  const isCurrentTierInCart = cartItemForService?.tierName === tier.name;
  const canSwitchPlan = Boolean(cartItemForService && !isCurrentTierInCart);
  const Icon = ICONS[service.icon] ?? Layers3;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-[#d2dfe3] bg-white transition-shadow duration-200 hover:shadow-md">
      <div className="border-b border-[#d2dfe3] p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#dcece8] text-[#147b69]">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-tight text-[#142a3d]">{service.name}</h3>
              <span className="text-xs text-[#64748b]">{service.category}</span>
            </div>
          </div>
          {service.badge && (
            <span
              className={`rounded-sm px-2 py-0.5 text-[10px] font-semibold ${
                service.badge === "New"
                  ? "bg-blue-100 text-blue-700"
                  : service.badge === "Best Seller"
                    ? "bg-[#142a3d] text-white"
                    : "bg-green-100 text-green-700"
              }`}
            >
              {service.badge}
            </span>
          )}
        </div>
        <p className="line-clamp-2 text-xs leading-relaxed text-[#64748b]">{service.description}</p>
        <div className="mt-2 flex items-center gap-2">
          <StarRating rating={service.rating} />
          <span className="text-xs font-medium text-[#147b69]">{service.rating}</span>
          <span className="text-xs text-[#64748b]">({service.reviews.toLocaleString()})</span>
        </div>
      </div>

      <div className="px-4 pt-3">
        <div className="flex overflow-hidden rounded-md border border-[#d2dfe3]">
          {service.tiers.map((item, index) => (
            <button
              key={item.name}
              type="button"
              onClick={() => setSelectedTier(index)}
              className={`relative flex-1 py-1.5 text-xs font-medium transition-colors ${index > 0 ? "border-l border-[#d2dfe3]" : ""}`}
              style={
                selectedTier === index
                  ? { backgroundColor: "#142a3d", color: "white" }
                  : { backgroundColor: "white", color: "#52708a" }
              }
            >
              {item.name}
              {item.popular && selectedTier !== index && (
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#147b69]" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3">
        <div className="flex items-baseline gap-1">
          {tier.price === 0 ? (
            <span className="text-2xl font-bold text-[#147b69]">Free</span>
          ) : (
            <>
              <span className="text-2xl font-bold text-[#142a3d]">${tier.price.toFixed(2)}</span>
              <span className="text-sm text-[#64748b]">{tier.period}</span>
            </>
          )}
          {tier.popular && (
            <span className="ml-auto rounded bg-[#dcece8] px-1.5 py-0.5 text-[10px] font-semibold text-[#147b69]">
              Most Popular
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 pb-3 pt-2">
        <ul className="space-y-1">
          {tier.features.slice(0, 4).map((feature) => (
            <li key={feature} className="flex items-center gap-1.5 text-xs text-[#64748b]">
              <Check className="h-3 w-3 shrink-0 text-[#147b69]" />
              {feature}
            </li>
          ))}
          {tier.features.length > 4 && (
            <li className="pl-4 text-xs text-[#64748b]">+{tier.features.length - 4} more</li>
          )}
        </ul>
      </div>

      <div className="px-4 pb-4">
        {service.cartOption !== false && (
          <button
            type="button"
            onClick={() => onAddToCart(service.id, tier)}
            disabled={isCurrentTierInCart}
            className={`w-full rounded py-2 text-sm font-semibold transition-all active:scale-[0.98] ${
              isCurrentTierInCart
                ? "cursor-default bg-[#eef4f6] text-[#64748b]"
                : "bg-[#147b69] text-white hover:bg-[#0f6556]"
            }`}
          >
            {isCurrentTierInCart ? "✓ Added to cart" : canSwitchPlan ? "Switch Plan" : "Add to Cart"}
          </button>
        )}
      </div>
    </div>
  );
});
