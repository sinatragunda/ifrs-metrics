import { Link } from "wouter";
import { Search, ShoppingCart, UserRound } from "lucide-react";

export function MarketplaceNav({
  search,
  onSearchChange,
  cartCount,
  onOpenCart,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  cartCount: number;
  onOpenCart: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#d2dfe3] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/loans-deposits" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-[7px_7px_7px_2px] bg-[#147b69] text-[11px] font-bold tracking-tight text-[#f4faf8]">
            IM
          </span>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-[-0.03em] text-[#142a3d]">
              IFRS <span className="text-[#147b69]">Metrics</span>
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#64748b]">
              Loans & Deposits
            </div>
          </div>
        </Link>

        <div className="relative mx-auto hidden w-full max-w-md flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search services..."
            className="w-full rounded-md border border-[#d2dfe3] bg-[#f8faf9] py-2 pl-9 pr-3 text-sm text-[#142a3d] outline-none placeholder:text-[#94a3b8] focus:border-[#147b69] focus:bg-white"
            aria-label="Search services"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/ifrs"
            className="hidden rounded-md px-2.5 py-1.5 text-xs font-semibold text-[#52687a] hover:bg-[#f4f8f8] hover:text-[#147b69] sm:inline"
          >
            IFRS Lab
          </Link>
          <Link
            href="/sign-in"
            className="grid h-9 w-9 place-items-center rounded-full border border-[#d2dfe3] text-[#40596b] hover:border-[#147b69] hover:bg-[#dcece8]"
            title="Account"
            aria-label="Account"
          >
            <UserRound className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={onOpenCart}
            className="relative grid h-9 place-items-center rounded-md border border-[#d2dfe3] bg-[#142a3d] px-3 text-white hover:bg-[#1c3a52]"
            aria-label={`Cart ${cartCount}`}
          >
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="rounded bg-white/15 px-1.5 py-0.5 tabular-nums">{cartCount}</span>
            </span>
          </button>
        </div>
      </div>

      <div className="border-t border-[#e8eef1] px-4 py-2 sm:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search services..."
            className="w-full rounded-md border border-[#d2dfe3] bg-[#f8faf9] py-2 pl-9 pr-3 text-sm text-[#142a3d] outline-none focus:border-[#147b69] focus:bg-white"
            aria-label="Search services"
          />
        </div>
      </div>
    </header>
  );
}
