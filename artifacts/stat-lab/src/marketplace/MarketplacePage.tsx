import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLocation, useSearch } from "wouter";
import { useMarketplaceCart } from "./CartContext";
import { LOANS_DEPOSITS_SERVICES, MARKETPLACE_CATEGORIES, SORT_OPTIONS } from "./data";
import { MARKETPLACE_RETURN_PATH, setCheckoutReturnPath, writeMarketplaceCart } from "./storage";
import type { PricingTier } from "./types";
import { CartPanel } from "./components/CartPanel";
import { MarketplaceFooter } from "./components/MarketplaceFooter";
import { MarketplaceNav } from "./components/MarketplaceNav";
import { ServiceCard } from "./components/ServiceCard";

export default function MarketplacePage() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const {
    cartItems,
    addCartItem,
    removeCartItem,
    resetCartItems,
    ensureMarketplaceCore,
  } = useMarketplaceCart();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof MARKETPLACE_CATEGORIES)[number]>("All");
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]>("Most Popular");
  const [sortOpen, setSortOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(() => new URLSearchParams(searchString).get("cart") === "open");

  useEffect(() => {
    document.title = "IFRS Metrics · Loans & Deposits";
  }, []);

  useEffect(() => {
    ensureMarketplaceCore();
  }, [ensureMarketplaceCore]);

  useEffect(() => {
    if (new URLSearchParams(searchString).get("cart") === "open") {
      setCartOpen(true);
    }
  }, [searchString]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    let services = LOANS_DEPOSITS_SERVICES.filter((service) => {
      const matchesCategory = category === "All" || service.category === category;
      const matchesSearch =
        !query ||
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });

    services = [...services].sort((a, b) => {
      if (sort === "Highest Rated") return b.rating - a.rating;
      if (sort === "Price: Low to High") {
        return (a.tiers.find((tier) => tier.popular)?.price ?? a.tiers[0].price) -
          (b.tiers.find((tier) => tier.popular)?.price ?? b.tiers[0].price);
      }
      if (sort === "Price: High to Low") {
        return (b.tiers.find((tier) => tier.popular)?.price ?? b.tiers[0].price) -
          (a.tiers.find((tier) => tier.popular)?.price ?? a.tiers[0].price);
      }
      return b.reviews - a.reviews;
    });

    return services;
  }, [category, search, sort]);

  function handleAddToCart(serviceId: string, tier: PricingTier) {
    addCartItem(serviceId, tier);
    setCartOpen(true);
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#eef4f6] text-[#142a3d]">
      <MarketplaceNav
        search={search}
        onSearchChange={setSearch}
        cartCount={cartItems.length}
        onOpenCart={() => setCartOpen(true)}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#147b69]">
            Marketplace · Loans & Deposits
          </p>
          <h1 className="text-2xl font-bold tracking-[-0.04em] text-[#142a3d] sm:text-3xl">
            Frequently Used Services
          </h1>
          <p className="mt-1 text-sm text-[#64748b]">
            Showing {filtered.length} service{filtered.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          {MARKETPLACE_CATEGORIES.map((item) => {
            const active = item === category;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-[#142a3d] text-white"
                    : "border border-[#d2dfe3] bg-white text-[#52687a] hover:border-[#147b69] hover:text-[#147b69]"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-xs text-[#64748b]">
            Shared cart with IFRS Lab. Core package stays for Loans & Deposits; Lab pricing items appear here too.
          </p>
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setSortOpen((open) => !open)}
              className="flex items-center gap-1.5 rounded-md border border-[#d2dfe3] bg-white px-3 py-1.5 text-xs font-semibold text-[#40596b] hover:border-[#147b69]"
            >
              Sort: {sort}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 z-20 mt-1 min-w-[180px] overflow-hidden rounded-md border border-[#d2dfe3] bg-white shadow-lg">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setSort(option);
                        setSortOpen(false);
                      }}
                      className={`block w-full px-3 py-2 text-left text-xs font-medium hover:bg-[#f4f8f8] ${
                        option === sort ? "bg-[#dcece8] text-[#147b69]" : "text-[#40596b]"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#d2dfe3] bg-white px-6 py-16 text-center">
            <p className="font-semibold text-[#142a3d]">No services match your filters</p>
            <p className="mt-1 text-sm text-[#64748b]">Try another category or clear the search.</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-4 rounded-md bg-[#147b69] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0f6556]"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                cartItems={cartItems}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </main>

      <MarketplaceFooter />

      <CartPanel
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        resetCartItems={resetCartItems}
        onRemove={removeCartItem}
        onCheckout={() => {
          writeMarketplaceCart(cartItems);
          setCheckoutReturnPath(MARKETPLACE_RETURN_PATH);
          setCartOpen(false);
          setLocation("/checkout");
        }}
      />
    </div>
  );
}
