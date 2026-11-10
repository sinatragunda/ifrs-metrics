import { useState } from "react";
import { useLocation } from "wouter";
import { useMarketplaceCart } from "@/marketplace";
import { LAB_RETURN_PATH, setCheckoutReturnPath } from "@/marketplace/storage";

type PricingOption = "subscription" | "light" | "dedicated";
type BillingCadence = "fortnight" | "monthly";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatAmount(amount: number): string {
  return currencyFormatter.format(amount);
}

function Arrow() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3.5 10h12m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const enterpriseInquiryHref = `mailto:sales@ifrsmetrics.com?subject=${encodeURIComponent("Enterprise coverage inquiry")}&body=${encodeURIComponent(
  "Hello IFRS Metrics team,\n\nI would like to discuss Enterprise coverage.\n\nContact name:\nOrganization:\nWork email:\nStandards or reports needed (IFRS 16, IFRS 9, IFRS 17):\nWhat problem or reporting workflow do you need help with?\nApproximate number of users:\nDesired timeline:\n\nThank you.",
)}`;

export function PricingOptions() {
  const [, setLocation] = useLocation();
  const { upsertLabSelection } = useMarketplaceCart();
  const [pricingOption, setPricingOption] = useState<PricingOption>("subscription");
  const [subscriptionCadence, setSubscriptionCadence] = useState<BillingCadence>("fortnight");
  const [lightSupportCadence, setLightSupportCadence] = useState<BillingCadence>("monthly");
  const [dedicatedSupportCadence, setDedicatedSupportCadence] = useState<BillingCadence>("monthly");

  const selectedTotal =
    pricingOption === "subscription"
      ? {
          amount: subscriptionCadence === "fortnight" ? 3.99 : 6.99,
          cadence: subscriptionCadence,
          label: subscriptionCadence === "fortnight"
            ? "All reports · $3.99 per fortnight"
            : "All reports · $6.99 per month",
        }
      : pricingOption === "light"
        ? {
            amount: lightSupportCadence === "fortnight" ? 80 : 120,
            cadence: lightSupportCadence,
            label: `Light support · $${lightSupportCadence === "fortnight" ? "80.00 per fortnight" : "120.00 per month"} (tax excluded)`,
          }
        : {
            amount: dedicatedSupportCadence === "fortnight" ? 180 : 300,
            cadence: dedicatedSupportCadence,
            label: `Dedicated technical support · $${dedicatedSupportCadence === "fortnight" ? "180.00 per fortnight" : "300.00 per month"} (tax excluded)`,
          };

  return (
    <section className="pricing-section" id="pricing" aria-labelledby="pricing-title">
      <div className="frame">
        <div className="section-head">
          <div><p className="section-index">Pricing</p><h2 className="section-title" id="pricing-title">Choose the coverage you need.</h2></div>
          <p className="section-description">Every subscription includes all three planned reports: IFRS 16, IFRS 9, and IFRS 17.</p>
        </div>
        <div className="table-wrap">
          <table className="pricing-table">
            <thead><tr><th>Option</th><th>Reports / service</th><th>Billing cycle</th><th>Price</th><th className="select-cell">Select</th></tr></thead>
            <tbody>
              <tr className={pricingOption === "subscription" ? "selected" : ""}>
                <td>All-report subscription</td><td>IFRS 16 · IFRS 9 · IFRS 17</td>
                <td>
                  <select
                    className="pricing-cycle"
                    aria-label="Subscription billing cycle"
                    value={subscriptionCadence}
                    onChange={(event) => setSubscriptionCadence(event.target.value as BillingCadence)}
                  >
                    <option value="fortnight">Per fortnight</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </td>
                <td className="price">${subscriptionCadence === "fortnight" ? "3.99 / fortnight" : "6.99 / month"}</td>
                <td className="select-cell"><input className="pricing-control" type="radio" name="ifrs-pricing" aria-label="Select all-report subscription" checked={pricingOption === "subscription"} onChange={() => setPricingOption("subscription")} /></td>
              </tr>
              <tr className={pricingOption === "light" ? "selected" : ""}>
                <td>Light support</td><td>Help with specific requested tasks</td>
                <td><select className="pricing-cycle" aria-label="Light support billing cycle" value={lightSupportCadence} onChange={(event) => setLightSupportCadence(event.target.value as BillingCadence)}><option value="fortnight">Per fortnight</option><option value="monthly">Monthly</option></select></td>
                <td className="price">${lightSupportCadence === "fortnight" ? "80.00 / fortnight" : "120.00 / month"} <span className="pricing-tax">(tax excluded)</span></td>
                <td className="select-cell"><input className="pricing-control" type="radio" name="ifrs-pricing" aria-label="Select light support" checked={pricingOption === "light"} onChange={() => setPricingOption("light")} /></td>
              </tr>
              <tr className={pricingOption === "dedicated" ? "selected" : ""}>
                <td>Dedicated technical support</td><td>Dedicated technical assistance</td>
                <td><select className="pricing-cycle" aria-label="Dedicated technical support billing cycle" value={dedicatedSupportCadence} onChange={(event) => setDedicatedSupportCadence(event.target.value as BillingCadence)}><option value="fortnight">Per fortnight</option><option value="monthly">Monthly</option></select></td>
                <td className="price">${dedicatedSupportCadence === "fortnight" ? "180.00 / fortnight" : "300.00 / month"} <span className="pricing-tax">(tax excluded)</span></td>
                <td className="select-cell"><input className="pricing-control" type="radio" name="ifrs-pricing" aria-label="Select dedicated technical support" checked={pricingOption === "dedicated"} onChange={() => setPricingOption("dedicated")} /></td>
              </tr>
              <tr>
                <td>Enterprise coverage</td><td>Tailored reporting, onboarding, and support</td><td>Custom</td><td className="price">Contact for pricing</td>
                <td className="select-cell"><a className="enterprise-contact" href={enterpriseInquiryHref} aria-label="Select Enterprise coverage and email an inquiry">Enquire</a></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="pricing-summary" aria-live="polite">
          <strong>Your selection</strong>
          <span>{selectedTotal.label}</span>
          <span className="pricing-total">
            Total: ${formatAmount(selectedTotal.amount)} / {selectedTotal.cadence === "fortnight" ? "fortnight" : "month"}
          </span>
        </div>
        <div className="pricing-checkout">
          <button
            className="button pricing-checkout-button"
            type="button"
            onClick={() => {
              upsertLabSelection({
                plan: pricingOption === "subscription" ? subscriptionCadence : null,
                lightSupport: pricingOption === "light" ? lightSupportCadence : null,
                dedicatedSupport: pricingOption === "dedicated" ? dedicatedSupportCadence : null,
              });
              setCheckoutReturnPath(LAB_RETURN_PATH);
              setLocation("/checkout");
            }}
            aria-describedby="checkout-routing-note"
          >
            Add to cart & checkout <Arrow />
          </button>
          <p className="pricing-checkout-note" id="checkout-routing-note">
            Adds this Lab option to the shared cart with Loans & Deposits, then opens checkout review.
          </p>
        </div>
        <p className="pricing-note">Choose one pricing option. Support prices exclude tax. Selecting an option does not start a subscription or take payment.</p>
      </div>
    </section>
  );
}
