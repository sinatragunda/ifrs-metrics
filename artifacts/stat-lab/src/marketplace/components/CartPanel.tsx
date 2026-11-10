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
  const fortnightTotal = cartItems
    .filter((item) => item.period.includes("fortnight"))
    .reduce((sum, item) => sum + item.price, 0);
  const monthlyTotal = cartItems
    .filter((item) => !item.period.includes("fortnight"))
    .reduce((sum, item) => sum + item.price, 0);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-[#142a3d]/20 backdrop-blur-[1px]" onClick={onClose} />
      )}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-[600px] flex-col bg-[#edf3f6] transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
        inert={!isOpen ? true : undefined}
        style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
      >
        <div className="relative m-3 mb-0 mr-4 flex min-h-0 flex-1 flex-col">
          <div
            className="absolute right-[-8px] top-[-8px] h-[70%] w-[92%] rounded-lg bg-[#dcece8]"
            aria-hidden="true"
          />
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[7px] border border-[#cbd8df] bg-[#fbfcfc] shadow-[0_18px_40px_rgba(19,43,60,.08)]">
            <div className="flex items-start justify-between gap-3 border-b border-[#d2dfe3] bg-white px-5 py-4">
              <div>
                <span className="mb-1 block text-[9px] font-bold uppercase tracking-[.12em] text-[#147b69]">
                  Workbook · Shared cart
                </span>
                <h2 className="m-0 text-[17px] font-bold tracking-[-.03em] text-[#142a3d]">
                  Selection schedule
                </h2>
                <p className="mt-0.5 text-[11px] text-[#64748b]">
                  {cartItems.length} line{cartItems.length === 1 ? "" : "s"} · IFRS Lab + Loans & Deposits
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-[3px] border border-[#d2dfe3] bg-[#f4f8f8] px-[7px] py-[5px] text-[9px] font-bold uppercase tracking-[.06em] text-[#52687a]">
                  {cartItems.length} items
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-icon !h-8 !w-8 !rounded-[3px]"
                  aria-label="Close cart"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {cartItems.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-[3px] border border-[#d2dfe3] bg-[#f4f8f8] text-[#94a3b8]">
                  <Package className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-[#40596b]">No rows in this cart sheet</p>
                <p className="max-w-xs text-[12px] text-[#64748b]">
                  Add IFRS Lab pricing or Loans & Deposits modules to build your selection schedule.
                </p>
                <button type="button" onClick={onClose} className="btn-ghost mt-1">
                  Browse services <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                  <div className="mb-2 grid grid-cols-[minmax(0,1.6fr)_110px_100px_40px] gap-0 border border-[#d2dfe3] bg-[#f4f8f8] text-[8px] font-bold uppercase tracking-[.06em] text-[#718392]">
                    <div className="border-r border-[#d2dfe3] px-3 py-1.5">Service</div>
                    <div className="border-r border-[#d2dfe3] px-3 py-1.5 text-right">Plan</div>
                    <div className="border-r border-[#d2dfe3] px-3 py-1.5 text-right">Amount</div>
                    <div className="px-1 py-1.5 text-center">#</div>
                  </div>

                  <div className="overflow-hidden rounded-[3px] border border-[#d2dfe3] bg-white">
                    {cartItems.map((item, index) => {
                      const isCore = item.serviceId === CORE_SERVICE_ID;
                      const sourceLabel = item.source === "lab" ? "Lab" : "L&D";
                      return (
                        <div
                          key={`${item.serviceId}-${item.tierName}-${index}`}
                          className={`grid grid-cols-[minmax(0,1.6fr)_110px_100px_40px] items-start gap-0 ${
                            index === cartItems.length - 1 ? "bg-[#f8faf9]" : "border-b border-[#e7edef]"
                          }`}
                        >
                          <div className="min-w-0 border-r border-[#e7edef] px-3 py-2.5">
                            <p className="truncate text-[12px] font-semibold text-[#40596b]">{item.serviceName}</p>
                            <p className="mt-0.5 text-[10px] text-[#94a3b8]">
                              {sourceLabel}
                              {isCore ? " · Required" : ""}
                              {item.detail ? ` · ${item.detail}` : ""}
                            </p>
                          </div>
                          <div className="border-r border-[#e7edef] px-3 py-2.5 text-right text-[11px] text-[#64748b]">
                            {item.tierName}
                          </div>
                          <div className="border-r border-[#e7edef] px-3 py-2.5 text-right font-mono text-[13px] font-medium tabular-nums text-[#52687a]">
                            {item.price === 0 ? "Free" : `$${item.price.toFixed(2)}`}
                            <div className="text-[9px] font-medium text-[#94a3b8]">
                              {item.period.replace(/^\//, "") || "mo"}
                            </div>
                          </div>
                          <div className="flex items-start justify-center px-1 py-2">
                            {isCore ? (
                              <span className="rounded-[3px] bg-[#dcece8] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[.04em] text-[#147b69]">
                                Core
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onRemove(index)}
                                className="rounded-[3px] p-1 text-[#94a3b8] hover:bg-[#fff3f1] hover:text-[#922f27]"
                                aria-label={`Remove ${item.serviceName}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3 border-t border-[#d2dfe3] bg-[#f4f8f8] px-5 py-4">
                  <div className="rounded-[5px] border border-[#d2dfe3] bg-white px-3.5 py-3">
                    <div className="mb-2 flex items-center justify-between text-[10px] text-[#64748b]">
                      <span className="rounded-[3px] bg-[#dcece8] px-2 py-0.5 font-bold text-[#147b69]">
                        Totals
                      </span>
                      <span>Tax excluded on support</span>
                    </div>
                    <div className="flex flex-wrap items-end justify-between gap-2">
                      <div className="text-[11px] text-[#64748b]">
                        {fortnightTotal > 0 && (
                          <div className="font-mono tabular-nums">${fortnightTotal.toFixed(2)} / fortnight</div>
                        )}
                        {monthlyTotal > 0 && (
                          <div className="font-mono tabular-nums">${monthlyTotal.toFixed(2)} / month</div>
                        )}
                        {fortnightTotal === 0 && monthlyTotal === 0 && (
                          <div className="font-mono tabular-nums">$0.00</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-bold uppercase tracking-[.08em] text-[#94a3b8]">Combined</div>
                        <div className="font-mono text-[22px] font-semibold tabular-nums text-[#40596b]">
                          ${total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button type="button" onClick={onCheckout} className="btn-primary w-full">
                    Proceed to checkout <ArrowRight className="h-4 w-4" />
                  </button>
                  <div className="flex gap-2">
                    <button type="button" onClick={resetCartItems} className="btn-secondary flex-1">
                      Clear items
                    </button>
                    <button type="button" onClick={onClose} className="btn-secondary flex-1">
                      Continue
                    </button>
                  </div>
                  <p className="text-center text-[10px] text-[#94a3b8]">
                    Cart rows stay saved while you review checkout.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
