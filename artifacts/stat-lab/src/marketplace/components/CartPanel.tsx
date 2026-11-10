import { ArrowRight, Package, Trash2, X } from "lucide-react";
import { CORE_SERVICE_ID } from "../data";
import type { CartItem } from "../types";

export function CartPanel({
  isOpen,
  onClose,
  cartItems,
  resetCartItems,
  onRemove,
  onCheckout,
}: {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  resetCartItems: () => void;
  onRemove: (index: number) => void;
  onCheckout: () => void;
}) {
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-[400px] flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
        inert={!isOpen ? true : undefined}
      >
        <div className="flex items-center justify-between bg-[#142a3d] px-5 py-4 text-white">
          <h2 className="text-lg font-bold">Your Cart ({cartItems.length})</h2>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-white/10" aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <Package className="h-12 w-12 text-[#cbd8df]" />
            <p className="font-semibold text-[#142a3d]">Your cart is empty</p>
            <p className="text-sm text-[#64748b]">Add IFRS Lab pricing or Loans & Deposits services to get started.</p>
            <button type="button" onClick={onClose} className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-[#147b69] hover:underline">
              Browse services <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-px overflow-y-auto py-3">
              {cartItems.map((item, index) => {
                const isCore = item.serviceId === CORE_SERVICE_ID;
                const sourceLabel = item.source === "lab" ? "IFRS Lab" : "Loans & Deposits";
                return (
                  <div key={`${item.serviceId}-${item.tierName}-${index}`} className="px-5 py-3 hover:bg-[#f4f8f8]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-tight text-[#142a3d]">{item.serviceName}</p>
                        <p className="mt-0.5 text-xs text-[#64748b]">
                          {item.tierName}{isCore ? " · Required" : ""} · {sourceLabel}
                        </p>
                        {item.detail && <p className="mt-0.5 text-[11px] text-[#94a3b8]">{item.detail}</p>}
                        <p className="mt-1 font-mono text-sm font-bold text-[#142a3d]">
                          {item.price === 0 ? "Free" : `$${item.price.toFixed(2)}${item.period}`}
                        </p>
                      </div>
                      {isCore ? (
                        <span className="shrink-0 rounded bg-[#dcece8] px-2 py-1 text-[10px] font-semibold text-[#147b69]">Core</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onRemove(index)}
                          className="rounded p-1.5 text-[#64748b] hover:bg-[#fff0ec] hover:text-[#8c4036]"
                          aria-label={`Remove ${item.serviceName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 border-t border-[#d2dfe3] bg-[#f8faf9] p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#64748b]">Cart total</span>
                <span className="font-mono text-lg font-bold text-[#142a3d]">${total.toFixed(2)}</span>
              </div>
              <button
                type="button"
                onClick={onCheckout}
                className="flex w-full items-center justify-center gap-2 rounded bg-[#147b69] py-2.5 text-sm font-semibold text-white hover:bg-[#0f6556]"
              >
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetCartItems}
                  className="flex-1 rounded border border-[#d2dfe3] bg-white py-2 text-xs font-semibold text-[#40596b] hover:bg-[#f4f8f8]"
                >
                  Clear Items
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded border border-[#d2dfe3] bg-white py-2 text-xs font-semibold text-[#40596b] hover:bg-[#f4f8f8]"
                >
                  Continue Shopping
                </button>
              </div>
              <p className="text-center text-[10px] text-[#64748b]">
                Cart selections are kept while you review checkout.
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
