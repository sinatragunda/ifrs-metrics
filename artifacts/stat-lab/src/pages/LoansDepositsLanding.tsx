import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, ShoppingCart, UserRound } from "lucide-react";
import { useMarketplaceCart } from "@/marketplace";
import "./LoansDepositsLanding.css";

function Arrow() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" width="13" height="13">
      <path d="M3.5 10h12m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const asset = (file: string) => `${import.meta.env.BASE_URL}${file}`;

const cartoons = [
  {
    title: "Lending",
    detail: "Loan books mapped into clear IFRS 9 categories.",
    src: asset("cartoon-lending.jpg"),
    alt: "Cartoon of a banker approving a loan with a customer",
  },
  {
    title: "Credit",
    detail: "Credit facilities tracked with controlled assumptions.",
    src: asset("cartoon-credit.jpg"),
    alt: "Cartoon of a customer using a credit card at a payment terminal",
  },
  {
    title: "Leases",
    detail: "Lease contracts kept visible from source to schedule.",
    src: asset("cartoon-leases.jpg"),
    alt: "Cartoon of people reviewing a lease agreement with keys",
  },
  {
    title: "Property Mortgaging",
    detail: "Mortgage exposures with amortised-cost workings.",
    src: asset("cartoon-mortgage.jpg"),
    alt: "Cartoon of a family with house keys and mortgage papers",
  },
  {
    title: "Deposit",
    detail: "Deposit movements for term, demand, and notice products.",
    src: asset("cartoon-deposit.jpg"),
    alt: "Cartoon of a bank teller and customer with a piggy bank",
  },
  {
    title: "Unit Trust",
    detail: "Fund positions prepared for disclosure packs.",
    src: asset("cartoon-unit-trust.jpg"),
    alt: "Cartoon of an advisor reviewing a unit trust chart with a client",
  },
] as const;

const offerings = [
  {
    code: "01",
    title: "Loan classification",
    detail: "Map contracts into IFRS 9 measurement categories with source-field validation and exception lists.",
  },
  {
    code: "02",
    title: "ECL staging",
    detail: "Stage 1–3 views with PD, LGD, and exposure overlays kept visible for review.",
  },
  {
    code: "03",
    title: "Deposit schedules",
    detail: "Opening, interest, payment, and closing movements for term, demand, and notice products.",
  },
  {
    code: "04",
    title: "Disclosure packs",
    detail: "Generate IFRS 7 / IFRS 9 style tables from controlled schedule outputs.",
  },
];

export default function LoansDepositsLanding() {
  const { cartItems } = useMarketplaceCart();
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = cartoons[slide];

  useEffect(() => {
    document.title = "IFRS Metrics · Loans & Deposits";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        "IFRS Metrics Loans & Deposits helps finance teams classify loan and deposit books, build amortised-cost and ECL schedules, and assemble disclosure packs.",
      );
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setSlide((current) => (current + 1) % cartoons.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [paused]);

  const goTo = (index: number) => setSlide((index + cartoons.length) % cartoons.length);

  return (
    <main className="ld-page">
      <div className="statusline">Loans & Deposits · product overview</div>

      <div className="frame">
        <header className="header">
          <Link href="/ifrs" className="brand" aria-label="IFRS Metrics home">
            <span className="brandmark">IM</span>
            <span>IFRS <em>Metrics</em></span>
          </Link>
          <nav className="nav" aria-label="Loans and deposits">
            <a href="#offerings" className="hide-sm">What it covers</a>
            <Link href="/loans-deposits/marketplace" className="ld-btn ld-btn-secondary">Pricing options</Link>
            <Link
              href="/loans-deposits/marketplace?cart=open"
              className="ld-icon ld-icon-cart"
              aria-label={`Open cart, ${cartItems.length} items`}
              title="Shared cart"
            >
              <ShoppingCart size={15} />
              <span className="cart-count">{cartItems.length}</span>
            </Link>
            <Link href="/sign-in" className="ld-icon" aria-label="Sign in" title="Sign in">
              <UserRound size={16} />
            </Link>
          </nav>
        </header>

        <section className="hero" id="top">
          <div className="hero-copy-wrap">
            <p className="eyebrow">IFRS Metrics · Loans & Deposits</p>
            <h1>
              Lending books that stay <span className="accent">traceable.</span>
            </h1>
            <p className="hero-copy">
              Classify loan and deposit portfolios, build amortised-cost and ECL workings, and assemble disclosure packs from controlled schedule outputs.
            </p>
            <div className="actions">
              <Link className="ld-btn ld-btn-primary" href="/loans-deposits/marketplace">
                Open service catalog <Arrow />
              </Link>
              <a className="ld-btn ld-btn-secondary" href="#offerings">
                See what it covers <Arrow />
              </a>
            </div>
          </div>

          <div
            className="art-shell"
            aria-roledescription="carousel"
            aria-label="Product cartoons"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
            }}
          >
            <figure className="art-card">
              <div className="carousel-stage">
                {cartoons.map((item, index) => (
                  <div
                    key={item.title}
                    className={`carousel-slide${index === slide ? " active" : ""}`}
                    aria-hidden={index !== slide}
                  >
                    <img src={item.src} alt={item.alt} width={960} height={720} />
                  </div>
                ))}
                <button
                  type="button"
                  className="carousel-nav prev"
                  aria-label="Previous cartoon"
                  onClick={() => goTo(slide - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  className="carousel-nav next"
                  aria-label="Next cartoon"
                  onClick={() => goTo(slide + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <figcaption className="art-caption">
                <div>
                  <strong>{active.title}</strong>
                  <span>{active.detail}</span>
                </div>
                <div className="carousel-dots" role="tablist" aria-label="Cartoon slides">
                  {cartoons.map((item, index) => (
                    <button
                      key={item.title}
                      type="button"
                      role="tab"
                      aria-selected={index === slide}
                      aria-label={`Show ${item.title}`}
                      className={`carousel-dot${index === slide ? " active" : ""}`}
                      onClick={() => goTo(index)}
                    />
                  ))}
                </div>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="section" id="offerings">
          <p className="section-index">01 / Lending system</p>
          <h2 className="section-title">What Loans & Deposits is for.</h2>
          <p className="section-description">
            A focused IFRS 9 toolkit for bank loan and deposit books — from source mapping through schedules and disclosure extracts.
          </p>
          <div className="offer-grid">
            {offerings.map((item) => (
              <article key={item.code} className="offer">
                <div className="offer-code">{item.code}</div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-band" id="catalog">
          <div className="inner">
            <div>
              <h2>Choose the modules you need.</h2>
              <p>
                The service catalog lists Core, ECL, deposit schedules, analytics, and delivery options in one shared cart with IFRS Lab.
              </p>
            </div>
            <Link className="ld-btn ld-btn-primary" href="/loans-deposits/marketplace">
              Go to marketplace <Arrow />
            </Link>
          </div>
        </section>

        <footer className="footer">
          <span>© {new Date().getFullYear()} IFRS Metrics · Loans & Deposits</span>
          <Link href="/ifrs">Back to IFRS Metrics</Link>
        </footer>
      </div>
    </main>
  );
}
