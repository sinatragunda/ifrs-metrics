import { useEffect, useMemo, useRef, useState, type FormEvent, type TouchEvent } from "react";
import { Link } from "wouter";
import { ShoppingCart, UserRound } from "lucide-react";
import {
  useSubmitIfrsMetricsInterest,
  type IfrsMetricsInterestRequestStandardsItem,
} from "@workspace/api-client-react";
import { useMarketplaceCart } from "@/marketplace";
import {
  calculateInitialLeaseLiability,
  calculateLeaseSchedule,
  validateLeaseInputs,
  type LeaseInputs,
} from "./lease-schedule";
import { PricingOptions } from "./PricingOptions";
import "./IfrsMetrics.css";

const standards = [
  {
    code: "16",
    title: "Leases",
    description: "Lease accounting, built around terms and assumptions your team can inspect.",
    items: [
      "Liability and right-of-use asset schedules",
      "Modifications and remeasurements",
      "Journal entries and maturity analysis",
    ],
  },
  {
    code: "09",
    title: "Financial instruments",
    description: "Expected credit loss tables with key inputs kept visible and in your hands.",
    items: [
      "Expected credit loss (ECL) staging",
      "PD, LGD and exposure assumptions",
      "Provision movement and disclosure tables",
    ],
  },
  {
    code: "17",
    title: "Insurance contracts",
    description: "Reporting concepts for contract groups, measurement and roll-forward.",
    items: [
      "Groups and measurement models",
      "Contractual service margin roll-forward",
      "Insurance revenue and finance expense",
    ],
  },
];

const interestStandards: {
  value: IfrsMetricsInterestRequestStandardsItem;
  label: string;
}[] = [
  { value: "IFRS 16", label: "IFRS 16 — Leases" },
  { value: "IFRS 9", label: "IFRS 9 — Financial instruments" },
  { value: "IFRS 17", label: "IFRS 17 — Insurance contracts" },
];

function Arrow() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3.5 10h12m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatAmount(amount: number): string {
  return currencyFormatter.format(amount);
}

export function IfrsMetrics() {
  const { cartItems } = useMarketplaceCart();
  const [sampleIndex, setSampleIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const [interestEmail, setInterestEmail] = useState("");
  const [interestStandardsSelected, setInterestStandardsSelected] = useState<
    IfrsMetricsInterestRequestStandardsItem[]
  >([]);
  const [interestConsent, setInterestConsent] = useState(false);
  const [interestFeedback, setInterestFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);
  const interestMutation = useSubmitIfrsMetricsInterest();
  const [rawInputs, setRawInputs] = useState({
    termYears: "4",
    annualPayment: "30000",
    discountRate: "8",
  });
  const inputs: LeaseInputs = {
    termYears: rawInputs.termYears.trim() ? Number(rawInputs.termYears) : Number.NaN,
    annualPayment: rawInputs.annualPayment.trim() ? Number(rawInputs.annualPayment) : Number.NaN,
    discountRate: rawInputs.discountRate.trim() ? Number(rawInputs.discountRate) : Number.NaN,
  };
  const errors = validateLeaseInputs(inputs);
  const schedule = useMemo(
    () => Object.keys(errors).length === 0 ? calculateLeaseSchedule(inputs) : [],
    [rawInputs.termYears, rawInputs.annualPayment, rawInputs.discountRate],
  );
  const initialLiability = Object.keys(errors).length === 0
    ? calculateInitialLeaseLiability(inputs)
    : null;
  const sampleStandards = [
    { code: "IFRS 16", title: "Lease liability schedule" },
    { code: "IFRS 9", title: "Expected credit loss illustration" },
    { code: "IFRS 17", title: "Contractual service margin roll-forward" },
    { code: "Loans & Deposits", title: "Lending · Deposits · Leases · Unit Trusts" },
  ];

  function changeSample(direction: -1 | 1) {
    setSampleIndex((current) => (current + direction + sampleStandards.length) % sampleStandards.length);
  }

  function handleSampleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartX.current = null;
    if (startX === null || endX === undefined) return;
    const distance = endX - startX;
    if (Math.abs(distance) < 48) return;
    changeSample(distance < 0 ? 1 : -1);
  }

  function submitInterest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInterestFeedback(null);
    interestMutation.mutate(
      {
        data: {
          email: interestEmail.trim(),
          standards: interestStandardsSelected,
          consent: true,
        },
      },
      {
        onSuccess: (response) => {
          setInterestFeedback({ kind: "success", message: response.message });
          setInterestEmail("");
          setInterestStandardsSelected([]);
          setInterestConsent(false);
        },
        onError: () => {
          setInterestFeedback({
            kind: "error",
            message: "We couldn't save your interest right now. Please try again.",
          });
        },
      },
    );
  }

  useEffect(() => {
    document.title = "IFRS Metrics";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "IFRS Metrics is in development. Explore the planned IFRS 16, IFRS 9, and IFRS 17 workflows and an illustrative lease schedule.");
  }, []);

  return (
    <main className="ifrs-page">
      <div className="statusline">IFRS Metrics is in development. The standards and workflow shown below are not yet available.</div>
      <div className="frame">
        <header className="header">
          <a className="brand" href="#top" aria-label="IFRS Metrics home">
            <span className="brandmark">IM</span><span>IFRS <em>Metrics</em></span>
          </a>
          <nav className="nav" aria-label="Main navigation">
            <Link href="/workspace/app" className="nav-cta">Workspace Lab</Link>
            <a href="#roadmap">Standards</a>
            <a href="#pricing" className="pricing-link">Pricing</a>
            <Link href="/loans-deposits" className="nav-cta">Loans & Deposits</Link>
            <Link
              href="/loans-deposits/marketplace?cart=open"
              className="profile-link"
              title="Shared cart"
              aria-label={`Open cart, ${cartItems.length} items`}
              style={{ width: "auto", padding: "0 9px", borderRadius: 6, gap: 6, display: "inline-flex", alignItems: "center" }}
            >
              <ShoppingCart size={15} />
              <span style={{ fontSize: 11, fontWeight: 700 }}>{cartItems.length}</span>
            </Link>
            <Link href="/sign-in" className="profile-link" title="Sign in" aria-label="Sign in"><UserRound size={17}/></Link>
          </nav>
        </header>

        <section className="hero" id="top">
          <div>
            <p className="eyebrow">A clearer path through complex standards</p>
            <h1>Make every number <span className="accent">traceable.</span></h1>
            <p className="hero-copy">IFRS Metrics is being built to help finance teams turn source data and controlled assumptions into clear IFRS schedules and reports.</p>
            <div className="actions">
              <Link className="button" href="/workspace/app">Open Workspace Lab <Arrow /></Link>
            </div>
            <div className="microproof"><span>↳</span> Designed around visible inputs, clear workings and review.</div>
          </div>

          <div
            className="schedule-shell"
            id="schedule"
            onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
            onTouchEnd={handleSampleTouchEnd}
          >
            <article className="schedule" aria-label={`Illustrative ${sampleStandards[sampleIndex].code} sample`} aria-live="polite">
              <div className="schedule-head">
                <div><span className="schedule-kicker">Illustration · {sampleStandards[sampleIndex].code}</span><h2>{sampleStandards[sampleIndex].title}</h2></div>
                <div className="carousel-tools">
                  <span className="sample-label">Illustrative only</span>
                  <button type="button" className="carousel-control" onClick={() => changeSample(-1)} aria-label="Show previous IFRS sample" title="Previous sample">‹</button>
                  <span className="carousel-count" aria-live="polite">{sampleIndex + 1} / {sampleStandards.length}</span>
                  <button type="button" className="carousel-control" onClick={() => changeSample(1)} aria-label="Show next IFRS sample" title="Next sample">›</button>
                </div>
              </div>
              {sampleIndex === 0 ? <>
              <div className="calculator" aria-label="Lease schedule assumptions">
                <div className="calculator-heading"><strong>Adjust assumptions</strong><span>Annual payments · paid at year-end</span></div>
                <div className="input-grid">
                  <div className="input-field">
                    <label htmlFor="lease-term">Lease term (years)</label>
                    <input
                      id="lease-term"
                      data-testid="input-lease-term"
                      type="number"
                      min="1"
                      max="50"
                      step="1"
                      inputMode="numeric"
                      value={rawInputs.termYears}
                      aria-invalid={Boolean(errors.termYears)}
                      aria-describedby={errors.termYears ? "lease-term-error" : undefined}
                      onChange={(event) => setRawInputs((current) => ({ ...current, termYears: event.target.value }))}
                    />
                    {errors.termYears && <span className="field-error" id="lease-term-error">{errors.termYears}</span>}
                  </div>
                  <div className="input-field">
                    <label htmlFor="annual-payment">Annual payment</label>
                    <input
                      id="annual-payment"
                      data-testid="input-annual-payment"
                      type="number"
                      min="0.01"
                      max="1000000000000"
                      step="0.01"
                      inputMode="decimal"
                      value={rawInputs.annualPayment}
                      aria-invalid={Boolean(errors.annualPayment)}
                      aria-describedby={errors.annualPayment ? "annual-payment-error" : undefined}
                      onChange={(event) => setRawInputs((current) => ({ ...current, annualPayment: event.target.value }))}
                    />
                    {errors.annualPayment && <span className="field-error" id="annual-payment-error">{errors.annualPayment}</span>}
                  </div>
                  <div className="input-field">
                    <label htmlFor="discount-rate">Discount rate (%)</label>
                    <input
                      id="discount-rate"
                      data-testid="input-discount-rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      inputMode="decimal"
                      value={rawInputs.discountRate}
                      aria-invalid={Boolean(errors.discountRate)}
                      aria-describedby={errors.discountRate ? "discount-rate-error" : undefined}
                      onChange={(event) => setRawInputs((current) => ({ ...current, discountRate: event.target.value }))}
                    />
                    {errors.discountRate && <span className="field-error" id="discount-rate-error">{errors.discountRate}</span>}
                  </div>
                </div>
                {initialLiability !== null && (
                  <div className="liability-summary" data-testid="text-initial-liability">
                    <span>Initial lease liability (present value)</span>
                    <strong>{formatAmount(initialLiability)}</strong>
                  </div>
                )}
                {Object.keys(errors).length > 0 && (
                  <p className="validation-message" role="alert" data-testid="status-lease-validation">
                    Fix the highlighted assumptions to calculate the illustrative schedule.
                  </p>
                )}
              </div>
              <div className="rate-row"><span className="rate-chip">{Number.isFinite(inputs.discountRate) ? `${inputs.discountRate}% rate` : "Rate not set"}</span><span>Illustrative discount rate</span></div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Year</th><th>Opening liability</th><th>Interest</th><th>Payment</th><th>Closing</th></tr></thead>
                  <tbody>{schedule.map((row) => (
                    <tr key={row.year} data-testid={`row-lease-year-${row.year}`}>
                      <td>{row.year}</td>
                      <td>{formatAmount(row.openingLiability)}</td>
                      <td>{formatAmount(row.interest)}</td>
                      <td>{formatAmount(row.payment)}</td>
                      <td>{formatAmount(row.closingLiability)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <p className="table-note" data-testid="text-illustrative-schedule-note">
                <strong>Illustrative calculation only.</strong> Amounts use the entered assumptions; the final payment may include a rounding adjustment. Not accounting advice.
              </p>
              </> : sampleIndex === 1 ? <>
                <div className="rate-row"><span className="rate-chip">Simplified ECL</span><span>Example inputs only · values are not calculated from a portfolio</span></div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Stage</th><th>ECL horizon</th><th>Exposure</th><th>PD</th><th>LGD</th><th>Illustrative ECL</th></tr></thead>
                    <tbody>
                      <tr><td>Stage 1</td><td>12-month</td><td>500,000</td><td>2.0%</td><td>45%</td><td>4,500</td></tr>
                      <tr><td>Stage 2</td><td>Lifetime</td><td>220,000</td><td>8.0%</td><td>45%</td><td>7,920</td></tr>
                      <tr><td>Stage 3</td><td>Lifetime</td><td>75,000</td><td>60.0%</td><td>45%</td><td>20,250</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="table-note"><strong>Illustrative only.</strong> Simplified exposure × PD × LGD examples; staging, discounting, forward-looking scenarios, and portfolio-specific assumptions are not included.</p>
              </> : sampleIndex === 2 ? <>
                <div className="rate-row"><span className="rate-chip">Contract group</span><span>Illustrative CSM movement · amount units</span></div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Movement</th><th>Illustrative amount</th><th>Basis</th></tr></thead>
                    <tbody>
                      <tr><td>Opening CSM</td><td>48,000</td><td>Opening balance</td></tr>
                      <tr><td>New business</td><td>12,000</td><td>Added to CSM</td></tr>
                      <tr><td>CSM released</td><td>(16,000)</td><td>Services provided</td></tr>
                      <tr><td>Closing CSM</td><td>44,000</td><td>Illustrative balance</td></tr>
                    </tbody>
                  </table>
                </div>
              </> : <>
                <div className="rate-row">
                  <span className="rate-chip">Loans & Deposits</span>
                  <span>Lending · Deposits · Leases · Unit Trusts </span>
                </div>
                <figure className="lending-art">
                  <img
                    src={`${import.meta.env.BASE_URL}loans-deposits-spiral.jpg`}
                    alt="Abstract spiral illustration for Loans and Deposits"
                    width={960}
                    height={720}
                  />
                </figure>
                <Link className="button lending-cta" href="/loans-deposits">
                  Open Loans & Deposits <Arrow />
                </Link>
                <p className="table-note">
                  Explore the Loans & Deposits product overview and service catalog.
                </p>
              </>}
            </article>
            <div className="carousel-hint">Swipe to explore samples, or use the previous and next buttons.</div>
          </div>
        </section>

        <div className="trustbar" aria-label="Product principles">
          <span className="trust-intro">What we’re designing for</span>
          <span className="trust-item"><span className="trust-icon">↗</span> Traceable source rows</span>
          <span className="trust-item"><span className="trust-icon">◉</span> Controlled assumptions</span>
          <span className="trust-item"><span className="trust-icon">✓</span> Reviewable workings</span>
        </div>

        <section className="section" id="roadmap">
          <div className="section-head">
            <div><p className="section-index">01 / Standards roadmap</p><h2 className="section-title">Clear scope. Honest status.</h2></div>
            <p className="section-description">We’re starting with three areas where finance teams often rely on complex spreadsheets. Every standard below is in development.</p>
          </div>
          <div className="roadmap">
            {standards.map((standard) => (
              <article className="standard" key={standard.code}>
                <div className="standard-top"><span className="standard-number">IFRS {standard.code}</span><span className="status-tag">In development</span></div>
                <h3>{standard.title}</h3>
                <p>{standard.description}</p>
                <ul>{standard.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            ))}
          </div>
          <p className="future-note">These capabilities are planned and are not currently available.</p>
        </section>
      </div>

      <PricingOptions />

      <section className="workflow" id="approach">
        <div className="frame">
          <p className="section-index">02 / The intended workflow</p>
          <h2>From source data to a line of sight.</h2>
          <p className="workflow-intro">The product is being designed to keep the path from raw input to reported figure visible at every step.</p>
          <div className="steps">
            <article className="step"><span className="step-number">01 — UPLOAD</span><h3>Bring your data</h3><p>Use a template or your own Excel or CSV file. Input checks are intended to flag issues before calculations.</p></article>
            <article className="step"><span className="step-number">02 — SET ASSUMPTIONS</span><h3>Keep judgment in view</h3><p>Discount rates, terms and other assumptions stay under your control and are recorded for review.</p></article>
            <article className="step"><span className="step-number">03 — REVIEW & EXPORT</span><h3>Follow each figure</h3><p>Planned Excel and PDF outputs link calculations back to their source rows for easier review.</p></article>
          </div>
        </div>
      </section>

      <div className="frame">
        <section className="judgment">
          <div><p className="section-index">03 / A note on use</p><h2>Tools can support judgment. They can’t replace it.</h2></div>
          <div className="judgment-copy"><strong>IFRS Metrics is under construction.</strong> Any future outputs are intended as calculation aids only. They do not replace professional accounting judgment or audit, and no compliance certification or audit approval is implied.</div>
        </section>

        <section className="interest-section" id="interest" aria-labelledby="interest-title">
          <p className="section-index">04 / Product updates</p>
          <h2 id="interest-title">Follow IFRS Metrics development.</h2>
          <p className="interest-intro">
            IFRS Metrics is still in development and is not yet available. Leave your email if you’d like occasional updates as plans progress; selecting standards is optional.
          </p>
          <form onSubmit={submitInterest}>
            <div className="interest-grid">
              <div>
                <label className="interest-label" htmlFor="interest-email">Work email</label>
                <input
                  className="interest-email"
                  id="interest-email"
                  data-testid="input-interest-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  required
                  value={interestEmail}
                  onChange={(event) => setInterestEmail(event.target.value)}
                />
              </div>
              <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="interest-label">Which standards interest you? <span style={{ fontWeight: 400, color: "var(--muted)" }}>Optional</span></legend>
                <div className="interest-options">
                  {interestStandards.map((standard) => (
                    <label className="interest-option" key={standard.value}>
                      <input
                        className="interest-checkbox"
                        data-testid={`checkbox-interest-${standard.value.replace(" ", "-")}`}
                        type="checkbox"
                        value={standard.value}
                        checked={interestStandardsSelected.includes(standard.value)}
                        onChange={(event) => {
                          setInterestStandardsSelected((selected) =>
                            event.target.checked
                              ? [...selected, standard.value]
                              : selected.filter((value) => value !== standard.value),
                          );
                        }}
                      />
                      <span>{standard.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="interest-consent">
                <input
                  className="interest-checkbox"
                  data-testid="checkbox-interest-consent"
                  type="checkbox"
                  required
                  checked={interestConsent}
                  onChange={(event) => setInterestConsent(event.target.checked)}
                />
                <span>I agree to receive occasional email updates about IFRS Metrics development and availability.</span>
              </label>
              <div>
                <button
                  className="button interest-submit"
                  data-testid="button-submit-interest"
                  type="submit"
                  disabled={interestMutation.isPending || !interestConsent}
                >
                  {interestMutation.isPending ? "Submitting…" : "Register interest"} <Arrow />
                </button>
              </div>
            </div>
            <p className="interest-privacy">Your email will be used only for IFRS Metrics updates.</p>
            {interestFeedback && (
              <p
                className="interest-feedback"
                data-testid="status-interest-submission"
                data-kind={interestFeedback.kind}
                role={interestFeedback.kind === "error" ? "alert" : "status"}
                aria-live="polite"
              >
                {interestFeedback.message}
              </p>
            )}
          </form>
        </section>

        <section className="bottom-callout" aria-label="Explore more">
          <div><h2>See the workings, not just the total.</h2><p>Review the illustrative schedule and the planned standards scope above.</p></div>
          <Link className="button" href="/workspace/app">Open Workspace Lab <Arrow /></Link>
        </section>

        <footer className="footer">
          <p>IFRS Metrics is under construction. IFRS 16, IFRS 9 and IFRS 17 capabilities shown are in development and are not yet available. Outputs do not replace professional accounting judgment or audit.</p>
          <span className="footer-brand">IFRS Metrics</span>
        </footer>
      </div>
    </main>
  );
}

export default IfrsMetrics;
