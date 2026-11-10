import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
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
    document.title = "Service catalog · Loans & Deposits";
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
    <div className="flex min-h-[100dvh] flex-col bg-[#edf3f6] text-[#142a3d]" style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}>
      <MarketplaceNav
        search={search}
        onSearchChange={setSearch}
        cartCount={cartItems.length}
        onOpenCart={() => setCartOpen(true)}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-[11px] text-[#64748b]">
          <Link href="/loans-deposits" className="font-medium hover:text-[#0e786b] hover:underline">Loans & Deposits</Link>
          <span>/</span>
          <span className="font-semibold text-[#40596b]">Service catalog</span>
        </nav>

        <div className="relative mb-8 mr-2 sm:mr-3">
          <div className="absolute right-[-12px] top-[-12px] h-[78%] w-[90%] rounded-lg bg-[#d6e3e8]" aria-hidden="true" />
          <section className="relative rounded-[7px] border border-[#cbd8df] bg-[#fbfcfc] p-5 shadow-[0_18px_40px_rgba(19,43,60,.07)] sm:p-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[#cbd8df] pb-4">
              <div>
                <span className="mb-1 block text-[9px] font-bold uppercase tracking-[.12em] text-[#0e786b]">
                  Workbook · Service catalog
                </span>
                <h1 className="m-0 text-[22px] font-bold leading-tight tracking-[-.04em] sm:text-[26px]">
                  Loans & Deposits modules
                </h1>
                <p className="mt-1 text-[12px] text-[#52687a]">
                  Pick plans the way you would fill a schedule — line by line, with Core kept in the cart.
                </p>
              </div>
              <span className="rounded-[3px] border border-[#cbd8df] px-[7px] py-[5px] text-[9px] font-bold uppercase tracking-[.06em] text-[#52687a]">
                Shared cart
              </span>
            </div>

            <div className="mb-3 flex flex-wrap items-end gap-0 border-b border-[#cbd8df]">
              {MARKETPLACE_CATEGORIES.map((item) => {
                const active = item === category;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`relative mr-1 border border-b-0 px-3 py-2 text-[10px] font-bold uppercase tracking-[.05em] transition-colors ${
                      active
                        ? "top-px z-[1] rounded-t-[4px] border-[#cbd8df] bg-white text-[#095e55]"
                        : "rounded-t-[4px] border-transparent bg-[#eef4f6] text-[#64748b] hover:bg-[#dcece8] hover:text-[#095e55]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[5px] border border-[#cbd8df] bg-[#f4f8f8] px-3 py-2.5">
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#52687a]">
                <span className="rounded-[3px] bg-[#dcece8] px-2 py-1 text-[10px] font-bold text-[#095e55]">
                  Sheet · {category}
                </span>
                <span>
                  {filtered.length} line{filtered.length === 1 ? "" : "s"} · cart {cartItems.length}
                </span>
              </div>
              <div className="relative shrink-0">
                <button type="button" onClick={() => setSortOpen((open) => !open)} className="btn-secondary !py-1.5">
                  Sort: {sort}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                    <div className="absolute right-0 z-20 mt-1 min-w-[180px] overflow-hidden rounded-[3px] border border-[#cbd8df] bg-white shadow-lg">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setSort(option);
                            setSortOpen(false);
                          }}
                          className={`block w-full px-3 py-2 text-left text-xs font-medium hover:bg-[#f4f8f8] ${
                            option === sort ? "bg-[#dcece8] text-[#0e786b]" : "text-[#40596b]"
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

            <div className="mb-3 hidden grid-cols-[40px_1fr_100px_100px_90px] gap-0 border border-[#cbd8df] bg-[#f4f8f8] text-[8px] font-bold uppercase tracking-[.06em] text-[#718392] sm:grid">
              {["#", "Service / assumptions", "Category", "From", "Action"].map((label) => (
                <div key={label} className="border-r border-[#cbd8df] px-2 py-2 last:border-r-0">
                  {label}
                </div>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-[5px] border border-dashed border-[#cbd8df] bg-white px-6 py-14 text-center">
                <p className="font-semibold text-[#142a3d]">No rows match this sheet filter</p>
                <p className="mt-1 text-sm text-[#64748b]">Clear search or choose another category tab.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                  }}
                  className="btn-primary mt-4"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((service, index) => (
                  <div key={service.id} className="grid items-stretch gap-0 sm:grid-cols-[40px_minmax(0,1fr)]">
                    <div className="hidden place-items-start border border-r-0 border-[#cbd8df] bg-[#f4f8f8] px-2 py-3 font-mono text-[10px] font-bold text-[#0e786b] sm:grid">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <ServiceCard
                      service={service}
                      cartItems={cartItems}
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                ))}
              </div>
            )}

            <p className="mt-4 border-t border-[#cbd8df] pt-3 text-[10px] text-[#64748b]">
              <strong className="font-semibold text-[#142a3d]">Catalog schedule view.</strong>{" "}
              IFRS Lab items and Loans & Deposits modules share one cart.
            </p>
          </section>
        </div>
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
