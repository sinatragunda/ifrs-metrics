import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, ShoppingCart, UserRound } from "lucide-react";
import { useMarketplaceCart } from "@/marketplace";

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
      <style>{`
        .ld-page {
          --paper: #edf3f6;
          --surface: #fbfcfc;
          --ink: #142a3d;
          --muted: #52687a;
          --line: #cbd8df;
          --accent: #0e786b;
          --accent-soft: #dcece8;
          --warm: #f5e2aa;
          color: var(--ink);
          min-height: 100dvh;
          font-family: "Bricolage Grotesque", sans-serif;
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          background:
            radial-gradient(1100px 480px at 8% -8%, rgba(14, 120, 107, 0.10), transparent 55%),
            radial-gradient(900px 420px at 94% 6%, rgba(245, 226, 170, 0.18), transparent 52%),
            linear-gradient(180deg, #edf3f6 0%, #f4f8f8 45%, #edf3f6 100%);
        }
        .ld-page * { box-sizing: border-box; }
        .ld-page a { color: inherit; text-decoration: none; }
        .ld-page a:focus-visible, .ld-page button:focus-visible {
          outline: 3px solid rgba(14, 120, 107, 0.35); outline-offset: 3px; border-radius: 3px;
        }
        .ld-page .frame { width: min(1120px, calc(100% - 48px)); margin: 0 auto; }
        .ld-page .statusline {
          background: #142a3d; color: #dcece8;
          text-align: center; font-size: 12px; letter-spacing: .03em; padding: 9px 18px; font-weight: 600;
        }
        .ld-page .header {
          height: 78px; display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid var(--line);
        }
        .ld-page .brand {
          display: flex; gap: 9px; align-items: center; font-weight: 800; font-size: 19px; letter-spacing: -.045em;
        }
        .ld-page .brandmark {
          width: 27px; height: 27px; background: var(--ink); color: #f4f8f8;
          border-radius: 7px 7px 7px 2px; display: grid; place-items: center; font-size: 12px;
        }
        .ld-page .brand em { color: var(--accent); font-style: normal; }
        .ld-page .nav { display: flex; gap: 16px; align-items: center; font-size: 13px; font-weight: 600; color: var(--muted); }
        .ld-page .nav a:hover { color: var(--ink); }
        .ld-page .ld-btn {
          display: inline-flex; align-items: center; gap: 8px; border-radius: 3px;
          padding: 8px 12px; font-size: 11px; font-weight: 700; letter-spacing: .06em;
          text-transform: uppercase; white-space: nowrap; border: 1px solid transparent;
          transition: transform .2s ease, background .2s ease, border-color .2s ease, color .2s ease;
        }
        .ld-page .ld-btn:hover { transform: translateY(-1px); }
        .ld-page .ld-btn-primary { background: var(--accent); color: #f5faf8; border-color: var(--accent); }
        .ld-page .ld-btn-primary:hover { background: #095e55; border-color: #095e55; }
        .ld-page .ld-btn-secondary {
          background: white; color: var(--muted); border-color: var(--line);
        }
        .ld-page .ld-btn-secondary:hover { color: #095e55; border-color: var(--accent); background: var(--accent-soft); }
        .ld-page .ld-icon {
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          width: 29px; height: 29px; border-radius: 50%;
          border: 1px solid var(--line); background: white; color: var(--ink);
          transition: background .2s ease, border-color .2s ease;
        }
        .ld-page .ld-icon:hover { background: var(--accent-soft); border-color: var(--accent); }
        .ld-page .ld-icon-cart {
          width: auto; min-width: 29px; padding: 0 9px; border-radius: 999px;
          font-size: 11px; font-weight: 700; letter-spacing: .02em;
        }
        .ld-page .ld-icon-cart .cart-count {
          min-width: 1.1em; text-align: center; font-variant-numeric: tabular-nums;
        }
        .ld-page .hero {
          display: grid; grid-template-columns: .95fr 1.05fr; gap: clamp(36px, 6vw, 72px);
          align-items: center; padding: 64px 0 70px;
        }
        .ld-page .hero-copy-wrap { animation: ld-rise .7s cubic-bezier(.2,.7,.2,1) both; }
        .ld-page .eyebrow {
          display: flex; align-items: center; gap: 9px; color: var(--accent);
          text-transform: uppercase; letter-spacing: .13em; font-size: 10px; font-weight: 700; margin: 0 0 18px;
        }
        .ld-page .eyebrow:before { content: ""; width: 23px; height: 1px; background: var(--warm); }
        .ld-page h1 {
          font-size: clamp(38px, 5.2vw, 60px); line-height: .99; letter-spacing: -.065em;
          max-width: 560px; margin: 0 0 18px; font-weight: 700;
        }
        .ld-page h1 .accent {
          background: linear-gradient(120deg, var(--ink) 20%, var(--accent) 90%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .ld-page .hero-copy {
          color: var(--muted); font-size: 16px; max-width: 440px; margin: 0 0 24px; line-height: 1.7;
        }
        .ld-page .actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .ld-page .art-shell {
          position: relative;
          animation: ld-float 7s ease-in-out infinite;
        }
        .ld-page .art-shell:before {
          content: ""; position: absolute; background: #dcece8;
          width: 90%; height: 82%; right: -12px; top: -12px; border-radius: 8px;
        }
        .ld-page .art-card {
          position: relative; background: var(--surface); border: 1px solid var(--line);
          border-radius: 7px; overflow: hidden;
          box-shadow: 0 18px 40px rgba(19, 43, 60, .08);
          animation: ld-rise .8s .12s cubic-bezier(.2,.7,.2,1) both;
        }
        .ld-page .carousel-stage {
          position: relative; aspect-ratio: 4 / 3; background: #f4f8f8; overflow: hidden;
        }
        .ld-page .carousel-slide {
          position: absolute; inset: 0; opacity: 0;
          transition: opacity .45s ease;
          pointer-events: none;
        }
        .ld-page .carousel-slide.active {
          opacity: 1; pointer-events: auto;
        }
        .ld-page .carousel-slide img {
          display: block; width: 100%; height: 100%; object-fit: cover;
        }
        .ld-page .carousel-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          display: grid; place-items: center; width: 32px; height: 32px;
          border: 1px solid var(--line); border-radius: 3px; background: rgba(251,252,252,.92);
          color: var(--muted); cursor: pointer; z-index: 2;
          transition: background .2s ease, color .2s ease, border-color .2s ease;
        }
        .ld-page .carousel-nav:hover { background: white; color: var(--accent); border-color: var(--accent); }
        .ld-page .carousel-nav.prev { left: 10px; }
        .ld-page .carousel-nav.next { right: 10px; }
        .ld-page .art-caption {
          display: flex; justify-content: space-between; align-items: center; gap: 12px;
          border-top: 1px solid var(--line); background: #f4f8f8; padding: 10px 14px;
        }
        .ld-page .art-caption strong {
          display: block; font-size: 13px; letter-spacing: -.02em; color: var(--ink);
        }
        .ld-page .art-caption span {
          display: block; margin-top: 2px; font-size: 10px; color: var(--muted);
        }
        .ld-page .carousel-dots {
          display: flex; align-items: center; gap: 6px; flex-shrink: 0;
        }
        .ld-page .carousel-dot {
          width: 7px; height: 7px; border-radius: 99px; border: 0; padding: 0;
          background: #b7c8c4; cursor: pointer;
          transition: width .2s ease, background .2s ease;
        }
        .ld-page .carousel-dot.active {
          width: 18px; background: var(--accent);
        }
        .ld-page .section { padding: 64px 0; }
        .ld-page .section-index {
          color: var(--accent); font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .12em; margin-bottom: 10px;
        }
        .ld-page h2.section-title {
          font-size: clamp(28px, 3.8vw, 40px); line-height: 1.04; letter-spacing: -.055em;
          margin: 0 0 12px; max-width: 540px;
        }
        .ld-page .section-description {
          color: var(--muted); font-size: 13px; line-height: 1.7; max-width: 420px; margin: 0 0 28px;
        }
        .ld-page .offer-grid {
          display: grid; grid-template-columns: repeat(2, 1fr);
          border: 1px solid var(--line); border-radius: 6px; overflow: hidden; background: rgba(251,252,252,.92);
          backdrop-filter: blur(8px);
        }
        .ld-page .offer {
          padding: 22px; min-height: 150px;
          transition: background .25s ease;
        }
        .ld-page .offer:hover { background: #f4f8f8; }
        .ld-page .offer:nth-child(odd) { border-right: 1px solid var(--line); }
        .ld-page .offer:nth-child(-n+2) { border-bottom: 1px solid var(--line); }
        .ld-page .offer-code {
          font-size: 28px; letter-spacing: -.06em; font-weight: 700; color: #9bbeb7;
          transition: color .25s ease, transform .25s ease;
        }
        .ld-page .offer:hover .offer-code { color: var(--accent); transform: translateX(2px); }
        .ld-page .offer h3 { font-size: 16px; margin: 10px 0 6px; letter-spacing: -.025em; }
        .ld-page .offer p { color: var(--muted); font-size: 12px; line-height: 1.6; margin: 0; }
        .ld-page .cta-band {
          border: 1px solid var(--line); border-radius: 8px;
          padding: 34px 28px; margin-bottom: 48px;
          background:
            linear-gradient(120deg, rgba(251,252,252,.96), rgba(220,236,232,.55));
        }
        .ld-page .cta-band .inner {
          display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 18px;
        }
        .ld-page .cta-band h2 { font-size: clamp(24px, 3vw, 32px); letter-spacing: -.04em; margin: 0 0 6px; }
        .ld-page .cta-band p { margin: 0; color: var(--muted); font-size: 13px; max-width: 420px; }
        .ld-page .footer {
          border-top: 1px solid var(--line); padding: 22px 0 34px;
          display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px;
          color: var(--muted); font-size: 11px;
        }
        @keyframes ld-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ld-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ld-page .art-shell,
          .ld-page .hero-copy-wrap,
          .ld-page .art-card { animation: none !important; }
          .ld-page .carousel-slide { transition: none; }
          .ld-page .ld-btn:hover { transform: none; }
        }
        @media (max-width: 860px) {
          .ld-page .hero { grid-template-columns: 1fr; padding: 42px 0 48px; }
          .ld-page .art-shell { animation: none; }
          .ld-page .offer-grid { grid-template-columns: 1fr; }
          .ld-page .offer:nth-child(odd) { border-right: 0; }
          .ld-page .offer { border-bottom: 1px solid var(--line); }
          .ld-page .offer:last-child { border-bottom: 0; }
          .ld-page .nav .hide-sm { display: none; }
        }
      `}</style>

      <div className="statusline">Loans & Deposits · product overview</div>

      <div className="frame">
        <header className="header">
          <Link href="/ifrs" className="brand" aria-label="IFRS Metrics home">
            <span className="brandmark">IM</span>
            <span>IFRS <em>Metrics</em></span>
          </Link>
          <nav className="nav" aria-label="Loans and deposits">
            <Link href="/ifrs" className="hide-sm">IFRS Lab</Link>
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
          <Link href="/ifrs">Back to IFRS Lab</Link>
        </footer>
      </div>
    </main>
  );
}
