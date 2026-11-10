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
    <article className="overflow-hidden rounded-[3px] border border-[#cbd8df] bg-white">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.9fr)]">
        <div className="border-b border-[#cbd8df] p-4 lg:border-b-0 lg:border-r">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-start gap-2.5">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[3px] border border-[#cbd8df] bg-[#f4f8f8] text-[#0e786b]">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[13px] font-bold leading-tight tracking-[-.02em] text-[#142a3d]">
                    {service.name}
                  </h3>
                  {service.badge && (
                    <span className="rounded-[3px] border border-[#cbd8df] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[.06em] text-[#52687a]">
                      {service.badge}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[.08em] text-[#0e786b]">
                  {service.category}
                </p>
              </div>
            </div>
            <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
              <StarRating rating={service.rating} />
              <span className="font-mono text-[11px] font-semibold text-[#0e786b]">{service.rating}</span>
            </div>
          </div>
          <p className="text-[12px] leading-relaxed text-[#52687a]">{service.description}</p>
          <ul className="mt-3 grid gap-1 sm:grid-cols-2">
            {tier.features.slice(0, 4).map((feature) => (
              <li key={feature} className="flex items-start gap-1.5 text-[11px] text-[#40596b]">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-[#0e786b]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          {tier.features.length > 4 && (
            <p className="mt-1 text-[10px] text-[#64748b]">+{tier.features.length - 4} more workings</p>
          )}
        </div>

        <div className="bg-[#f8faf9] p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[9px] font-bold uppercase tracking-[.1em] text-[#718392]">Plan assumptions</span>
            {tier.popular && (
              <span className="rounded-[3px] bg-[#dcece8] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[.06em] text-[#095e55]">
                Popular
              </span>
            )}
          </div>

          <div className="mb-3 flex overflow-hidden rounded-[3px] border border-[#cbd8df] bg-white">
            {service.tiers.map((item, index) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setSelectedTier(index)}
                className={`relative flex-1 py-1.5 text-[10px] font-bold uppercase tracking-[.05em] transition-colors ${
                  index > 0 ? "border-l border-[#cbd8df]" : ""
                }`}
                style={
                  selectedTier === index
                    ? { backgroundColor: "#142a3d", color: "white" }
                    : { backgroundColor: "white", color: "#52687a" }
                }
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="mb-3 border border-[#cbd8df] bg-white">
            <div className="grid grid-cols-2 border-b border-[#cbd8df] text-[9px] font-bold uppercase tracking-[.06em] text-[#718392]">
              <div className="border-r border-[#cbd8df] bg-[#f4f8f8] px-2 py-1.5">Field</div>
              <div className="bg-[#f4f8f8] px-2 py-1.5 text-right">Value</div>
            </div>
            <div className="grid grid-cols-2 border-b border-[#e7edef] text-[11px]">
              <div className="border-r border-[#e7edef] px-2 py-2 font-semibold text-[#095e55]">Price</div>
              <div className="px-2 py-2 text-right font-mono font-bold tabular-nums text-[#142a3d]">
                {tier.price === 0 ? "Free" : `$${tier.price.toFixed(2)}${tier.period}`}
              </div>
            </div>
            <div className="grid grid-cols-2 text-[11px]">
              <div className="border-r border-[#e7edef] px-2 py-2 font-semibold text-[#095e55]">Reviews</div>
              <div className="px-2 py-2 text-right font-mono tabular-nums text-[#40596b]">
                {service.reviews.toLocaleString()}
              </div>
            </div>
          </div>

          {service.cartOption !== false && (
            <button
              type="button"
              onClick={() => onAddToCart(service.id, tier)}
              disabled={isCurrentTierInCart}
              className={`btn-primary w-full ${
                isCurrentTierInCart
                  ? "cursor-default !border-[#eef4f6] !bg-[#eef4f6] !text-[#64748b] hover:!bg-[#eef4f6]"
                  : ""
              }`}
            >
              {isCurrentTierInCart ? "✓ On schedule" : canSwitchPlan ? "Switch plan" : "Add to cart"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
});
