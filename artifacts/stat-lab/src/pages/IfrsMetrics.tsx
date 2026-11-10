import { useEffect, useMemo, useRef, useState, type FormEvent, type TouchEvent } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, UserRound } from "lucide-react";
import {
  useSubmitIfrsMetricsInterest,
  type IfrsMetricsInterestRequestStandardsItem,
} from "@workspace/api-client-react";
import { useMarketplaceCart } from "@/marketplace";
import { LAB_RETURN_PATH, setCheckoutReturnPath } from "@/marketplace/storage";
import {
  calculateInitialLeaseLiability,
  calculateLeaseSchedule,
  validateLeaseInputs,
  type LeaseInputs,
} from "./lease-schedule";

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
  const [, setLocation] = useLocation();
  const { cartItems, upsertLabSelection } = useMarketplaceCart();
  const [sampleIndex, setSampleIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const [pricingOption, setPricingOption] = useState<"fortnight" | "monthly" | "light" | "dedicated">("fortnight");
  const [lightSupportCadence, setLightSupportCadence] = useState<"fortnight" | "monthly">("monthly");
  const [dedicatedSupportCadence, setDedicatedSupportCadence] = useState<"fortnight" | "monthly">("monthly");
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
  const selectedTotal =
    pricingOption === "fortnight" ? { amount: 3.99, cadence: "fortnight" as const, label: "All reports · $3.99 per fortnight" }
    : pricingOption === "monthly" ? { amount: 6.99, cadence: "monthly" as const, label: "All reports · $6.99 per month" }
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
  const sampleStandards = [
    { code: "IFRS 16", title: "Lease liability schedule" },
    { code: "IFRS 9", title: "Expected credit loss illustration" },
    { code: "IFRS 17", title: "Contractual service margin roll-forward" },
    { code: "Loans & Deposits", title: "Lending · deposits · leases · unit trusts" },
  ];
  const enterpriseInquiryHref = `mailto:sales@ifrsmetrics.com?subject=${encodeURIComponent("Enterprise coverage inquiry")}&body=${encodeURIComponent(
    "Hello IFRS Metrics team,\n\nI would like to discuss Enterprise coverage.\n\nContact name:\nOrganization:\nWork email:\nStandards or reports needed (IFRS 16, IFRS 9, IFRS 17):\nWhat problem or reporting workflow do you need help with?\nApproximate number of users:\nDesired timeline:\n\nThank you.",
  )}`;

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
      <style>{`
        .ifrs-page {
          --paper: #edf3f6; --surface: #fbfcfc; --ink: #142a3d; --muted: #52687a;
          --line: #cbd8df; --teal: #0e786b; --teal-dark: #095e55; --amber: #f5e2aa;
          --amber-ink: #5c4614; --pale-teal: #dcece8;
          background: var(--paper); color: var(--ink); min-height: 100dvh;
          font-family: "Bricolage Grotesque", sans-serif; line-height: 1.5;
          -webkit-font-smoothing: antialiased; overflow: hidden;
        }
        .ifrs-page * { box-sizing: border-box; }
        .ifrs-page a { color: inherit; }
        .ifrs-page a:focus-visible { outline: 3px solid var(--teal); outline-offset: 4px; border-radius: 3px; }
        .ifrs-page .frame { width: min(1120px, calc(100% - 48px)); margin: 0 auto; }
        .ifrs-page .statusline { background: var(--amber); color: var(--amber-ink); text-align: center; font-size: 12px; letter-spacing: .025em; padding: 9px 18px; font-weight: 600; }
        .ifrs-page .header { height: 78px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(20,42,61,.12); }
        .ifrs-page .brand { text-decoration: none; display: flex; gap: 9px; align-items: center; font-weight: 800; font-size: 19px; letter-spacing: -.045em; }
        .ifrs-page .brandmark { width: 27px; height: 27px; background: var(--teal); color: #f4faf8; border-radius: 7px 7px 7px 2px; display: grid; place-items: center; font-size: 12px; letter-spacing: -.04em; }
        .ifrs-page .brand em { color: var(--teal); font-style: normal; }
        .ifrs-page .nav { display: flex; gap: 30px; align-items: center; font-size: 13px; font-weight: 600; color: var(--muted); }
        .ifrs-page .nav a { text-decoration: none; transition: color .2s ease; }
        .ifrs-page .nav a:hover { color: var(--teal-dark); }
        .ifrs-page .nav-cta {
          color: var(--teal) !important;
          border: 1px solid #9bbeb7;
          padding: 7px 11px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .06em;
          white-space: nowrap;
        }
        .ifrs-page .nav-cta:hover { background: var(--pale-teal); border-color: var(--teal); }
        .ifrs-page .pricing-link { color: inherit; }
        .ifrs-page .profile-link { display: grid; place-items: center; width: 29px; height: 29px; border: 1px solid #9bbeb7; border-radius: 50%; color: var(--teal-dark); background: white; }
        .ifrs-page .profile-link:hover { background: var(--pale-teal); border-color: var(--teal); }
        .ifrs-page .hero { display: grid; grid-template-columns: .92fr 1.08fr; gap: clamp(38px, 6vw, 76px); align-items: center; padding: 67px 0 72px; }
        .ifrs-page .eyebrow { display: flex; align-items: center; gap: 9px; color: var(--teal-dark); text-transform: uppercase; letter-spacing: .13em; font-size: 10px; font-weight: 700; margin: 0 0 21px; }
        .ifrs-page .eyebrow:before { content: ""; width: 23px; height: 1px; background: var(--teal); }
        .ifrs-page h1 { font-size: clamp(42px, 5.5vw, 67px); line-height: .99; letter-spacing: -.065em; max-width: 600px; margin: 0 0 21px; font-weight: 700; }
        .ifrs-page h1 .accent { color: var(--teal); }
        .ifrs-page .hero-copy { color: var(--muted); font-size: 16px; max-width: 440px; margin: 0 0 26px; line-height: 1.7; }
        .ifrs-page .actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .ifrs-page .lending-art {
          margin: 0 0 12px; border: 1px solid var(--line); border-radius: 6px; overflow: hidden; background: #edf3f6;
        }
        .ifrs-page .lending-art img {
          display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover;
        }
        .ifrs-page .lending-cta {
          display: inline-flex; align-items: center; gap: 8px; margin-top: 4px;
        }
        .ifrs-page .button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          background: var(--teal);
          color: #f5faf8;
          border: 1px solid var(--teal);
          padding: 8px 12px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .06em;
          white-space: nowrap;
          transition: background .15s ease, border-color .15s ease;
        }
        .ifrs-page .button:hover { background: var(--teal-dark); border-color: var(--teal-dark); }
        .ifrs-page .button svg, .ifrs-page .text-link svg { width: 13px; height: 13px; }
        .ifrs-page .text-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: var(--muted);
          border: 1px solid var(--line);
          padding: 8px 12px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .06em;
          text-decoration: none;
          white-space: nowrap;
          background: white;
        }
        .ifrs-page .text-link:hover { color: var(--teal-dark); border-color: var(--teal); background: var(--pale-teal); }
        .ifrs-page .microproof { display: flex; align-items: center; gap: 10px; font-size: 11px; color: var(--muted); margin-top: 24px; }
        .ifrs-page .microproof span { color: var(--teal); font-size: 14px; font-weight: 700; }
        .ifrs-page .schedule-shell { position: relative; }
        .ifrs-page .schedule-shell:before { content: ""; position: absolute; background: #d6e3e8; width: 88%; height: 80%; right: -13px; top: -13px; border-radius: 8px; }
        .ifrs-page .schedule { position: relative; background: var(--surface); border: 1px solid var(--line); border-radius: 7px; padding: 21px 21px 15px; box-shadow: 0 18px 40px rgba(19,43,60,.07); }
        .ifrs-page .schedule-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding-bottom: 17px; }
        .ifrs-page .carousel-tools { display: flex; align-items: center; gap: 7px; }
        .ifrs-page .carousel-control { display: grid; place-items: center; width: 29px; height: 29px; flex: 0 0 auto; border: 1px solid var(--line); border-radius: 50%; background: white; color: var(--teal-dark); font: inherit; font-size: 19px; line-height: 1; cursor: pointer; }
        .ifrs-page .carousel-control:hover { border-color: var(--teal); background: var(--pale-teal); }
        .ifrs-page .carousel-control:focus-visible { outline: 3px solid rgba(14,120,107,.3); outline-offset: 2px; }
        .ifrs-page .carousel-count { min-width: 28px; color: var(--muted); text-align: center; font-size: 10px; font-variant-numeric: tabular-nums; }
        .ifrs-page .carousel-hint { margin: 11px 0 0; color: var(--muted); font-size: 10px; text-align: center; }
        .ifrs-page .schedule-kicker { display: block; font-size: 9px; color: var(--teal); font-weight: 700; text-transform: uppercase; letter-spacing: .12em; margin-bottom: 5px; }
        .ifrs-page .schedule h2 { font-size: 17px; letter-spacing: -.03em; line-height: 1.2; margin: 0; }
        .ifrs-page .sample-label { white-space: nowrap; border: 1px solid var(--line); color: var(--muted); font-size: 9px; padding: 5px 7px; border-radius: 3px; text-transform: uppercase; letter-spacing: .06em; font-weight: 700; }
        .ifrs-page .rate-row { display: flex; align-items: center; gap: 8px; color: var(--muted); font-size: 11px; border-bottom: 1px solid var(--line); padding: 0 0 13px; }
        .ifrs-page .rate-chip { background: var(--pale-teal); color: var(--teal-dark); font-size: 10px; font-weight: 700; border-radius: 3px; padding: 4px 7px; }
        .ifrs-page .calculator { background: #f4f8f8; border: 1px solid var(--line); border-radius: 5px; padding: 13px; margin: 0 0 13px; }
        .ifrs-page .calculator-heading { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; margin-bottom: 10px; }
        .ifrs-page .calculator-heading strong { font-size: 11px; }
        .ifrs-page .calculator-heading span { color: var(--muted); font-size: 9px; }
        .ifrs-page .input-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 9px; }
        .ifrs-page .input-field { min-width: 0; }
        .ifrs-page .input-field label { display: block; font-size: 9px; font-weight: 700; color: var(--muted); margin-bottom: 4px; }
        .ifrs-page .input-field input { width: 100%; min-width: 0; border: 1px solid #b9cbd1; border-radius: 4px; background: white; color: var(--ink); padding: 8px 7px; font: inherit; font-size: 12px; }
        .ifrs-page .input-field input:focus-visible { outline: 3px solid rgba(14,120,107,.25); border-color: var(--teal); }
        .ifrs-page .input-field input[aria-invalid="true"] { border-color: #a43c32; }
        .ifrs-page .field-error { display: block; color: #922f27; font-size: 9px; line-height: 1.35; margin-top: 4px; }
        .ifrs-page .liability-summary { display: flex; align-items: center; justify-content: space-between; gap: 10px; border-top: 1px solid var(--line); margin-top: 11px; padding-top: 9px; font-size: 10px; color: var(--muted); }
        .ifrs-page .liability-summary strong { color: var(--ink); font-size: 12px; font-variant-numeric: tabular-nums; }
        .ifrs-page .validation-message { color: #922f27; background: #fff3f1; border: 1px solid #e4b8b2; border-radius: 4px; padding: 8px 9px; margin: 10px 0 0; font-size: 10px; }
        .ifrs-page .table-wrap { overflow-x: auto; }
        .ifrs-page table { width: 100%; min-width: 480px; border-collapse: collapse; font-size: 11px; font-variant-numeric: tabular-nums; }
        .ifrs-page th { color: #718392; text-transform: uppercase; letter-spacing: .045em; font-size: 8px; font-weight: 700; padding: 11px 6px 8px; text-align: right; white-space: nowrap; }
        .ifrs-page th:first-child, .ifrs-page td:first-child { text-align: left; }
        .ifrs-page td { padding: 10px 6px; text-align: right; border-bottom: 1px solid #e7edef; white-space: nowrap; }
        .ifrs-page tr:last-child td { border-bottom: 0; }
        .ifrs-page tbody tr:last-child { background: #f6f9f9; }
        .ifrs-page td:first-child { font-weight: 700; color: var(--teal-dark); }
        .ifrs-page .table-note { border-top: 1px solid var(--line); padding-top: 12px; margin: 0; color: var(--muted); font-size: 10px; }
        .ifrs-page .table-note strong { color: var(--ink); font-weight: 600; }
        .ifrs-page .trustbar { border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 17px 0; }
        .ifrs-page .trust-intro { color: var(--muted); font-size: 11px; font-weight: 600; }
        .ifrs-page .trust-item { display: flex; align-items: center; gap: 9px; color: var(--ink); font-size: 11px; font-weight: 600; }
        .ifrs-page .trust-icon { width: 25px; height: 25px; display: grid; place-items: center; border: 1px solid #b3cbc5; border-radius: 50%; color: var(--teal); font-size: 12px; }
        .ifrs-page .section { padding: 76px 0; }
        .ifrs-page .section-head { display: flex; justify-content: space-between; align-items: end; gap: 30px; margin-bottom: 30px; }
        .ifrs-page .section-index { color: var(--teal); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em; margin-bottom: 10px; }
        .ifrs-page h2.section-title { font-size: clamp(30px, 4vw, 43px); line-height: 1.04; letter-spacing: -.055em; margin: 0; max-width: 540px; }
        .ifrs-page .section-description { color: var(--muted); font-size: 13px; line-height: 1.7; max-width: 335px; margin: 0 0 2px; }
        .ifrs-page .roadmap { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--line); border-radius: 6px; overflow: hidden; background: var(--surface); }
        .ifrs-page .standard { min-height: 275px; padding: 23px 22px; position: relative; }
        .ifrs-page .standard + .standard { border-left: 1px solid var(--line); }
        .ifrs-page .standard-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; }
        .ifrs-page .standard-number { font-size: 31px; line-height: 1; letter-spacing: -.06em; font-weight: 700; }
        .ifrs-page .status-tag { display: inline-block; color: var(--amber-ink); background: var(--amber); font-size: 9px; text-transform: uppercase; font-weight: 700; letter-spacing: .05em; padding: 5px 7px; border-radius: 3px; }
        .ifrs-page .standard h3 { font-size: 17px; margin: 0 0 7px; letter-spacing: -.025em; }
        .ifrs-page .standard p { color: var(--muted); font-size: 11px; min-height: 51px; line-height: 1.6; margin: 0 0 13px; }
        .ifrs-page .standard ul { list-style: none; padding: 0; margin: 0; }
        .ifrs-page .standard li { position: relative; padding-left: 14px; font-size: 10px; color: #40596b; margin-top: 8px; line-height: 1.45; }
        .ifrs-page .standard li:before { content: ""; width: 4px; height: 4px; border-radius: 50%; background: var(--teal); position: absolute; left: 0; top: 5px; }
        .ifrs-page .future-note { margin-top: 11px; color: var(--muted); font-size: 10px; }
        .ifrs-page .pricing-section { padding: 70px 0; }
        .ifrs-page .pricing-table { min-width: 760px; }
        .ifrs-page .pricing-table th:nth-child(-n+3), .ifrs-page .pricing-table td:nth-child(-n+3) { text-align: left; }
        .ifrs-page .pricing-table td { vertical-align: middle; }
        .ifrs-page .pricing-tax { display: block; margin-top: 3px; color: var(--muted); font-size: 9px; font-weight: 500; white-space: nowrap; }
        .ifrs-page .pricing-table tr.selected { background: #f1f7f5; }
        .ifrs-page .pricing-table .price { color: var(--ink); font-weight: 700; }
        .ifrs-page .pricing-table .select-cell { text-align: center; }
        .ifrs-page .pricing-control { accent-color: var(--teal); width: 16px; height: 16px; cursor: pointer; }
        .ifrs-page .pricing-cycle { border: 1px solid #b9cbd1; border-radius: 4px; background: white; color: var(--ink); padding: 6px 8px; font: inherit; font-size: 10px; }
        .ifrs-page .pricing-summary { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 18px; margin-top: 16px; border: 1px solid var(--line); background: #f5f8f7; padding: 14px 16px; font-size: 12px; }
        .ifrs-page .pricing-summary strong { color: var(--ink); }
        .ifrs-page .pricing-total { font-variant-numeric: tabular-nums; color: var(--teal-dark); font-weight: 700; }
        .ifrs-page .pricing-note { margin: 10px 0 0; color: var(--muted); font-size: 10px; line-height: 1.5; }
        .ifrs-page .pricing-checkout { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 18px; margin-top: 18px; }
        .ifrs-page .pricing-checkout-button { border: 0; cursor: pointer; }
        .ifrs-page .pricing-checkout-button:focus-visible { outline: 3px solid rgba(14,120,107,.35); outline-offset: 3px; }
        .ifrs-page .pricing-checkout-note { margin: 0; color: var(--muted); font-size: 11px; }
        .ifrs-page .pricing-checkout-status { flex-basis: 100%; margin: 0; color: var(--amber-ink); font-size: 11px; }
        .ifrs-page .enterprise-contact { display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; background: var(--teal); color: white; padding: 7px 11px; font-size: 10px; font-weight: 700; text-decoration: none; white-space: nowrap; }
        .ifrs-page .enterprise-contact:hover { background: var(--teal-dark); }
        .ifrs-page .enterprise-contact:focus-visible { outline: 3px solid rgba(14,120,107,.3); outline-offset: 2px; }
        .ifrs-page .workflow { background: #183348; color: #f1f6f7; padding: 61px 0; position: relative; }
        .ifrs-page .workflow:after { content: "TRACE"; position: absolute; right: 4vw; top: 31px; font-size: 10px; letter-spacing: .2em; color: rgba(255,255,255,.26); writing-mode: vertical-rl; }
        .ifrs-page .workflow .section-index { color: #74c6b8; }
        .ifrs-page .workflow h2 { font-size: clamp(30px, 4vw, 42px); max-width: 470px; line-height: 1.05; letter-spacing: -.05em; margin: 0 0 13px; }
        .ifrs-page .workflow-intro { font-size: 13px; color: #b6c8d1; max-width: 500px; margin: 0; }
        .ifrs-page .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; margin-top: 39px; }
        .ifrs-page .step { border-top: 1px solid rgba(225,239,240,.3); padding-top: 16px; }
        .ifrs-page .step-number { color: #76cbbb; font-size: 10px; letter-spacing: .1em; font-weight: 700; }
        .ifrs-page .step h3 { font-size: 17px; margin: 12px 0 7px; letter-spacing: -.02em; }
        .ifrs-page .step p { color: #b6c8d1; font-size: 11px; line-height: 1.7; margin: 0; max-width: 275px; }
        .ifrs-page .judgment { display: grid; grid-template-columns: .85fr 1.15fr; gap: 54px; align-items: center; padding: 76px 0; }
        .ifrs-page .judgment h2 { font-size: clamp(27px, 3.5vw, 38px); line-height: 1.07; letter-spacing: -.05em; margin: 0; }
        .ifrs-page .judgment-copy { border-left: 2px solid var(--teal); padding: 2px 0 2px 22px; color: var(--muted); font-size: 13px; line-height: 1.75; }
        .ifrs-page .judgment-copy strong { color: var(--ink); font-weight: 700; }
        .ifrs-page .bottom-callout { background: var(--pale-teal); padding: 33px 36px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; gap: 25px; margin-bottom: 68px; }
        .ifrs-page .bottom-callout h2 { font-size: 24px; line-height: 1.1; letter-spacing: -.04em; margin: 0 0 7px; }
        .ifrs-page .bottom-callout p { font-size: 12px; color: var(--muted); margin: 0; }
        .ifrs-page .bottom-callout .button { white-space: nowrap; }
        .ifrs-page .interest-section { background: var(--surface); border: 1px solid var(--line); border-radius: 6px; padding: clamp(24px, 4vw, 40px); margin: 0 0 36px; }
        .ifrs-page .interest-section h2 { font-size: clamp(25px, 3.5vw, 34px); line-height: 1.08; letter-spacing: -.045em; margin: 0 0 9px; }
        .ifrs-page .interest-intro { color: var(--muted); font-size: 13px; line-height: 1.65; max-width: 650px; margin: 0 0 23px; }
        .ifrs-page .interest-grid { display: grid; grid-template-columns: minmax(220px, .85fr) 1.15fr; gap: 22px 28px; align-items: start; }
        .ifrs-page .interest-label { display: block; font-size: 12px; color: var(--ink); font-weight: 700; margin-bottom: 7px; }
        .ifrs-page .interest-email { width: 100%; border: 1px solid #b9cbd1; border-radius: 4px; background: white; color: var(--ink); padding: 11px 12px; font: inherit; font-size: 13px; }
        .ifrs-page .interest-email:focus-visible, .ifrs-page .interest-checkbox:focus-visible { outline: 3px solid rgba(14,120,107,.25); border-color: var(--teal); }
        .ifrs-page .interest-options { display: grid; gap: 9px; }
        .ifrs-page .interest-option, .ifrs-page .interest-consent { display: flex; align-items: flex-start; gap: 9px; color: #40596b; font-size: 12px; line-height: 1.5; }
        .ifrs-page .interest-checkbox { accent-color: var(--teal); margin: 3px 0 0; flex: 0 0 auto; }
        .ifrs-page .interest-consent { grid-column: 1 / -1; padding-top: 2px; }
        .ifrs-page .interest-submit { cursor: pointer; border: 0; }
        .ifrs-page .interest-submit:disabled { cursor: wait; opacity: .65; transform: none; }
        .ifrs-page .interest-feedback { margin: 14px 0 0; font-size: 12px; line-height: 1.55; }
        .ifrs-page .interest-feedback[data-kind="success"] { color: var(--teal-dark); }
        .ifrs-page .interest-feedback[data-kind="error"] { color: #922f27; }
        .ifrs-page .interest-privacy { color: var(--muted); font-size: 10px; margin: 12px 0 0; }
        .ifrs-page .footer { border-top: 1px solid var(--line); padding: 21px 0 30px; display: flex; justify-content: space-between; gap: 25px; color: var(--muted); font-size: 10px; }
        .ifrs-page .footer p { margin: 0; max-width: 750px; }
        .ifrs-page .footer-brand { font-weight: 700; color: var(--ink); white-space: nowrap; }
        @media (max-width: 760px) {
          .ifrs-page .frame { width: min(560px, calc(100% - 36px)); }
          .ifrs-page .header { height: 66px; }
          .ifrs-page .brand { flex: 0 0 auto; font-size: 16px; white-space: nowrap; }
          .ifrs-page .nav { min-width: 0; flex: 1; justify-content: flex-end; gap: 7px; }
          .ifrs-page .nav a:not(.nav-cta):not(.pricing-link):not(.profile-link) { display: none; }
          .ifrs-page .nav .nav-cta { padding: 7px 10px; font-size: 10px; }
          .ifrs-page .nav .pricing-link { border: 1px solid #9bbeb7; border-radius: 5px; padding: 7px 8px; font-size: 10px; }
          .ifrs-page .hero { grid-template-columns: 1fr; gap: 38px; padding: 50px 0 51px; }
          .ifrs-page .hero > * { min-width: 0; }
          .ifrs-page h1 { max-width: 10ch; font-size: clamp(36px, 9.5vw, 46px); overflow-wrap: anywhere; }
          .ifrs-page .hero-copy { width: 100%; max-width: 100%; font-size: 15px; }
          .ifrs-page .actions { align-items: flex-start; gap: 12px; }
          .ifrs-page .text-link { font-size: 11px; }
          .ifrs-page .schedule-shell { margin-right: 9px; }
          .ifrs-page .schedule { padding: 16px 13px 13px; }
          .ifrs-page .schedule-head { align-items: flex-start; }
          .ifrs-page .carousel-tools { flex-wrap: wrap; justify-content: flex-end; gap: 5px; }
          .ifrs-page .sample-label { display: none; }
          .ifrs-page .input-grid { grid-template-columns: 1fr; }
          .ifrs-page .input-field input { padding: 10px; }
          .ifrs-page .trustbar { justify-content: flex-start; flex-wrap: wrap; gap: 14px 24px; }
          .ifrs-page .trust-intro { width: 100%; }
          .ifrs-page .section { padding: 58px 0; }
          .ifrs-page .pricing-section { padding: 58px 0; }
          .ifrs-page .section-head { display: block; }
          .ifrs-page .section-description { margin-top: 14px; }
          .ifrs-page .roadmap { grid-template-columns: 1fr; }
          .ifrs-page .standard { min-height: unset; padding: 21px; }
          .ifrs-page .standard + .standard { border-left: 0; border-top: 1px solid var(--line); }
          .ifrs-page .standard p { min-height: unset; max-width: 370px; }
          .ifrs-page .workflow { padding: 53px 0; }
          .ifrs-page .steps { grid-template-columns: 1fr; gap: 22px; }
          .ifrs-page .step p { max-width: 450px; }
          .ifrs-page .judgment { grid-template-columns: 1fr; gap: 23px; padding: 58px 0; }
          .ifrs-page .bottom-callout { align-items: flex-start; flex-direction: column; padding: 25px; margin-bottom: 48px; }
          .ifrs-page .interest-grid { grid-template-columns: 1fr; gap: 18px; }
          .ifrs-page .interest-consent { grid-column: auto; }
          .ifrs-page .footer { flex-direction: column; gap: 9px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ifrs-page *, .ifrs-page *:before, .ifrs-page *:after { scroll-behavior: auto !important; transition-duration: .01ms !important; }
        }
      `}</style>

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
                <p className="table-note"><strong>Illustrative only.</strong> This simplified movement omits risk adjustment, finance effects, experience adjustments, and other measurement details.</p>
              </> : <>
                <div className="rate-row">
                  <span className="rate-chip">Loans & Deposits</span>
                  <span>Lending · deposits · leases · unit trusts</span>
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
                <tr className={pricingOption === "fortnight" ? "selected" : ""}>
                  <td>All-report subscription</td><td>IFRS 16 · IFRS 9 · IFRS 17</td><td>Renews every fortnight</td><td className="price">$3.99</td>
                  <td className="select-cell"><input className="pricing-control" type="radio" name="ifrs-pricing" aria-label="Select fortnightly subscription" checked={pricingOption === "fortnight"} onChange={() => setPricingOption("fortnight")} /></td>
                </tr>
                <tr className={pricingOption === "monthly" ? "selected" : ""}>
                  <td>All-report subscription</td><td>IFRS 16 · IFRS 9 · IFRS 17</td><td>Renews monthly</td><td className="price">$6.99</td>
                  <td className="select-cell"><input className="pricing-control" type="radio" name="ifrs-pricing" aria-label="Select monthly subscription" checked={pricingOption === "monthly"} onChange={() => setPricingOption("monthly")} /></td>
                </tr>
                <tr className={pricingOption === "light" ? "selected" : ""}>
                  <td>Light support</td><td>Help with specific requested tasks</td>
                  <td><select className="pricing-cycle" aria-label="Light support billing cycle" value={lightSupportCadence} onChange={(event) => setLightSupportCadence(event.target.value as "fortnight" | "monthly")}><option value="fortnight">Per fortnight</option><option value="monthly">Monthly</option></select></td>
                  <td className="price">${lightSupportCadence === "fortnight" ? "80.00 / fortnight" : "120.00 / month"} <span className="pricing-tax">(tax excluded)</span></td>
                  <td className="select-cell"><input className="pricing-control" type="radio" name="ifrs-pricing" aria-label="Select light support" checked={pricingOption === "light"} onChange={() => setPricingOption("light")} /></td>
                </tr>
                <tr className={pricingOption === "dedicated" ? "selected" : ""}>
                  <td>Dedicated technical support</td><td>Dedicated technical assistance</td>
                  <td><select className="pricing-cycle" aria-label="Dedicated technical support billing cycle" value={dedicatedSupportCadence} onChange={(event) => setDedicatedSupportCadence(event.target.value as "fortnight" | "monthly")}><option value="fortnight">Per fortnight</option><option value="monthly">Monthly</option></select></td>
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
                  plan: pricingOption === "fortnight" || pricingOption === "monthly" ? pricingOption : null,
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
