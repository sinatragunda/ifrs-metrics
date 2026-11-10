import { useMemo, useState } from 'react';
import { useUser } from '@clerk/react';
import { Link, useLocation } from 'wouter';
import { useMarketplaceCart } from '@/marketplace';
import { startPocketsflowCheckout } from '@/marketplace/pocketsflow-checkout';
import {
  LAB_RETURN_PATH,
  MARKETPLACE_RETURN_PATH,
  cartHasLabItems,
  cartHasMarketplaceItems,
  readCheckoutReturnPath,
} from '@/marketplace/storage';

export function CheckoutReviewPage() {
  const { user, isLoaded } = useUser();
  const [, setLocation] = useLocation();
  const { cartItems } = useMarketplaceCart();
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const hasLab = cartHasLabItems(cartItems);
  const hasMarketplace = cartHasMarketplaceItems(cartItems);
  const returnTo = readCheckoutReturnPath(
    hasMarketplace ? MARKETPLACE_RETURN_PATH : LAB_RETURN_PATH,
  );
  const backLabel = returnTo.startsWith('/loans-deposits') ? 'Back to cart' : 'Back to pricing';

  const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  const chipPrimary = 'btn-primary';
  const chipSecondary = 'btn-secondary';

  const totals = useMemo(() => {
    let fortnight = 0;
    let monthly = 0;
    for (const item of cartItems) {
      if (item.period.includes('fortnight')) fortnight += item.price;
      else monthly += item.price;
    }
    return { fortnight, monthly, combined: fortnight + monthly };
  }, [cartItems]);

  const totalPeriodLabel =
    totals.fortnight > 0 && totals.monthly > 0
      ? 'combined'
      : totals.fortnight > 0
        ? 'per fortnight'
        : totals.monthly > 0
          ? 'per month'
          : '';

  const email = user?.primaryEmailAddress?.emailAddress;
  const titleScope = hasLab && hasMarketplace
    ? 'IFRS Lab + Loans & Deposits'
    : hasLab
      ? 'IFRS Lab'
      : 'Loans & Deposits';

  const payWithPocketsflow = async () => {
    setCheckoutError('');
    if (!user) {
      setLocation('/sign-in?returnTo=%2Fcheckout');
      return;
    }
    if (totals.combined <= 0) {
      setCheckoutError('Add a paid item before starting payment.');
      return;
    }

    setCheckoutBusy(true);
    try {
      await startPocketsflowCheckout(cartItems, { customerEmail: email });
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Could not start Pocketsflow checkout.');
    } finally {
      setCheckoutBusy(false);
    }
  };

  if (!cartItems.length) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#eef4f6] p-6 text-[#142a3d]">
        <div className="relative max-w-md">
          <div className="absolute right-[-10px] top-[-10px] h-[80%] w-[88%] rounded-lg bg-[#d6e3e8]" aria-hidden="true" />
          <div className="relative rounded-[7px] border border-[#cbd8df] bg-white p-6 text-center shadow-[0_18px_40px_rgba(19,43,60,.07)]">
            <span className="mb-1 block text-[9px] font-bold uppercase tracking-[.12em] text-[#147b69]">Checkout · Shared cart</span>
            <h1 className="m-0 text-[17px] font-bold tracking-[-.03em]">No checkout selection</h1>
            <p className="mt-2 text-[12px] text-[#52687a]">Add IFRS Lab pricing or Loans & Deposits services before continuing.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link href="/ifrs#pricing" className={chipPrimary}>IFRS Lab pricing</Link>
              <Link href="/loans-deposits/marketplace?cart=open" className={chipSecondary}>Loans & Deposits cart</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef4f6] px-4 py-7 text-[#142a3d] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-[11px] text-[#737a77]">
          <Link href="/ifrs" className="font-medium hover:text-[#147b69] hover:underline">Home</Link>
          <span>/</span>
          <Link href="/loans-deposits/marketplace?cart=open" className="font-medium hover:text-[#147b69] hover:underline">Cart</Link>
          <span>/</span>
          <span className="font-semibold text-[#34434a]">Checkout</span>
        </nav>

        <div className="relative mr-3">
          <div className="absolute right-[-13px] top-[-13px] h-[80%] w-[88%] rounded-lg bg-[#d6e3e8]" aria-hidden="true" />
          <article className="relative rounded-[7px] border border-[#cbd8df] bg-white p-[21px_21px_15px] shadow-[0_18px_40px_rgba(19,43,60,.07)]" aria-label="Checkout schedule">
            <div className="border-b border-[#cbd8df] pb-4">
              <span className="mb-1 block text-[9px] font-bold uppercase tracking-[.12em] text-[#147b69]">Checkout · {titleScope}</span>
              <h1 className="m-0 text-[17px] font-bold leading-tight tracking-[-.03em]">Review your selection</h1>
            </div>

            <div className="mt-3.5 mb-3.5 rounded-[5px] border border-[#cbd8df] bg-[#f4f8f8] p-3.5">
              <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
                <strong className="text-[11px]">Shared cart</strong>
                <span className="text-[9px] text-[#52687a]">{cartItems.length} line item{cartItems.length === 1 ? '' : 's'}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px]">
                {hasLab && <span className="rounded-[3px] bg-[#dcece8] px-2 py-1 font-bold text-[#095e55]">IFRS Lab</span>}
                {hasMarketplace && <span className="rounded-[3px] bg-[#e8eef3] px-2 py-1 font-bold text-[#40596b]">Loans & Deposits</span>}
              </div>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-3 border-t border-[#cbd8df] pt-3">
                <div className="text-[10px] text-[#52687a]">
                  <div>Ready for checkout</div>
                  {totals.fortnight > 0 && totals.monthly > 0 && (
                    <div className="mt-1 font-mono tabular-nums">
                      {money(totals.fortnight)} / fortnight · {money(totals.monthly)} / month
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-bold uppercase tracking-[.08em] text-[#718392]">
                    Cart total{totalPeriodLabel ? ` · ${totalPeriodLabel}` : ''}
                  </div>
                  <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-[#142a3d]">
                    {money(totals.combined)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3.5 flex flex-wrap items-center gap-2 border-b border-[#cbd8df] pb-3.5 text-[11px] text-[#52687a]">
              <span className="rounded-[3px] bg-[#dcece8] px-[7px] py-1 text-[10px] font-bold text-[#095e55]">Subscription schedule</span>
              <span>Combined Lab and marketplace line items</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-[11px] tabular-nums">
                <thead>
                  <tr>
                    {['Service', 'Source', 'Plan', 'Amount', 'Period'].map((label, index) => (
                      <th
                        key={label}
                        className={`whitespace-nowrap px-1.5 pb-2 pt-1 text-[8px] font-bold uppercase tracking-[.045em] text-[#718392] ${index === 0 ? 'text-left' : 'text-right'}`}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item, index) => (
                    <tr key={`${item.serviceId}-${item.tierName}`} className={index === cartItems.length - 1 ? 'bg-[#f6f9f9]' : undefined}>
                      <td className={`px-1.5 py-2.5 text-left font-bold text-[#095e55] ${index === cartItems.length - 1 ? '' : 'border-b border-[#e7edef]'}`}>
                        <div>{item.serviceName}</div>
                        {item.detail && <div className="mt-0.5 text-[10px] font-medium text-[#64748b]">{item.detail}</div>}
                      </td>
                      <td className={`whitespace-nowrap px-1.5 py-2.5 text-right text-[#52687a] ${index === cartItems.length - 1 ? '' : 'border-b border-[#e7edef]'}`}>
                        {item.source === 'lab' ? 'IFRS Lab' : 'Loans & Deposits'}
                      </td>
                      <td className={`whitespace-nowrap px-1.5 py-2.5 text-right text-[#52687a] ${index === cartItems.length - 1 ? '' : 'border-b border-[#e7edef]'}`}>
                        {item.tierName}
                      </td>
                      <td className={`whitespace-nowrap px-1.5 py-2.5 text-right font-semibold ${index === cartItems.length - 1 ? '' : 'border-b border-[#e7edef]'}`}>
                        {item.price === 0 ? 'Free' : money(item.price)}
                      </td>
                      <td className={`whitespace-nowrap px-1.5 py-2.5 text-right capitalize ${index === cartItems.length - 1 ? '' : 'border-b border-[#e7edef]'}`}>
                        {item.period.includes('fortnight') ? 'fortnight' : 'month'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3.5 overflow-x-auto border-t border-[#cbd8df] pt-3.5">
              <div className="mb-2.5 flex flex-wrap items-center gap-2 text-[11px] text-[#52687a]">
                <span className="rounded-[3px] bg-[#dcece8] px-[7px] py-1 text-[10px] font-bold text-[#095e55]">Account</span>
                <span>{!isLoaded ? 'Checking account…' : user ? `Signed in as ${email || user.fullName}` : 'Sign in required to continue'}</span>
              </div>
              {!user && isLoaded && (
                <div className="mb-3.5 flex flex-wrap gap-2">
                  <Link href="/sign-in?returnTo=%2Fcheckout" className={chipPrimary}>Sign in</Link>
                  <Link href="/sign-up?returnTo=%2Fcheckout" className={chipSecondary}>Create account</Link>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void payWithPocketsflow()}
                  disabled={checkoutBusy || totals.combined <= 0}
                  className={`${chipPrimary} disabled:opacity-50`}
                >
                  {checkoutBusy ? 'Opening checkout…' : 'Pay with card'}
                </button>
              </div>
              {checkoutError && (
                <p role="alert" className="mt-2 rounded-[3px] border border-[#e4b8b2] bg-[#fff3f1] px-2.5 py-2 text-[10px] font-medium text-[#922f27]">
                  {checkoutError}
                </p>
              )}
            </div>

            <p className="mt-3 border-t border-[#cbd8df] pt-3 text-[10px] text-[#52687a]">
              <strong className="font-semibold text-[#142a3d]">Shared checkout.</strong> IFRS Lab and Loans & Deposits selections share one cart. Support prices exclude tax.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={returnTo} className={chipSecondary}>{backLabel}</Link>
              <Link href="/loans-deposits/marketplace?cart=open" className={chipSecondary}>Open cart</Link>
              <Link href="/workspace/app" className={chipSecondary}>Open workspace</Link>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
