import React from "react";

const schedule = [
  ["1", "100,000", "8,000", "(30,000)", "78,000"],
  ["2", "78,000", "6,240", "(30,000)", "54,240"],
  ["3", "54,240", "4,339", "(30,000)", "28,579"],
  ["4", "28,579", "2,286", "(30,000)", "865"],
];

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

function Arrow() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3.5 10h12m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IfrsMetrics() {
  return (
    <main className="ifrs-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&display=swap');
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
        .ifrs-page .nav-cta { color: var(--teal) !important; border: 1px solid #9bbeb7; padding: 9px 13px; border-radius: 5px; }
        .ifrs-page .hero { display: grid; grid-template-columns: .92fr 1.08fr; gap: clamp(38px, 6vw, 76px); align-items: center; padding: 67px 0 72px; }
        .ifrs-page .eyebrow { display: flex; align-items: center; gap: 9px; color: var(--teal-dark); text-transform: uppercase; letter-spacing: .13em; font-size: 10px; font-weight: 700; margin: 0 0 21px; }
        .ifrs-page .eyebrow:before { content: ""; width: 23px; height: 1px; background: var(--teal); }
        .ifrs-page h1 { font-size: clamp(42px, 5.5vw, 67px); line-height: .99; letter-spacing: -.065em; max-width: 600px; margin: 0 0 21px; font-weight: 700; }
        .ifrs-page h1 .accent { color: var(--teal); }
        .ifrs-page .hero-copy { color: var(--muted); font-size: 16px; max-width: 440px; margin: 0 0 26px; line-height: 1.7; }
        .ifrs-page .actions { display: flex; align-items: center; gap: 21px; flex-wrap: wrap; }
        .ifrs-page .button { display: inline-flex; align-items: center; gap: 12px; text-decoration: none; background: var(--teal); color: #f5faf8; padding: 13px 16px; border-radius: 5px; font-size: 13px; font-weight: 700; transition: background .2s ease, transform .2s ease; }
        .ifrs-page .button:hover { background: var(--teal-dark); transform: translateY(-2px); }
        .ifrs-page .button svg, .ifrs-page .text-link svg { width: 16px; height: 16px; }
        .ifrs-page .text-link { display: inline-flex; align-items: center; gap: 8px; color: var(--ink); font-size: 13px; font-weight: 700; text-decoration: none; }
        .ifrs-page .text-link:hover { color: var(--teal); }
        .ifrs-page .microproof { display: flex; align-items: center; gap: 10px; font-size: 11px; color: var(--muted); margin-top: 24px; }
        .ifrs-page .microproof span { color: var(--teal); font-size: 14px; font-weight: 700; }
        .ifrs-page .schedule-shell { position: relative; }
        .ifrs-page .schedule-shell:before { content: ""; position: absolute; background: #d6e3e8; width: 88%; height: 80%; right: -13px; top: -13px; border-radius: 8px; }
        .ifrs-page .schedule { position: relative; background: var(--surface); border: 1px solid var(--line); border-radius: 7px; padding: 21px 21px 15px; box-shadow: 0 18px 40px rgba(19,43,60,.07); }
        .ifrs-page .schedule-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding-bottom: 17px; }
        .ifrs-page .schedule-kicker { display: block; font-size: 9px; color: var(--teal); font-weight: 700; text-transform: uppercase; letter-spacing: .12em; margin-bottom: 5px; }
        .ifrs-page .schedule h2 { font-size: 17px; letter-spacing: -.03em; line-height: 1.2; margin: 0; }
        .ifrs-page .sample-label { white-space: nowrap; border: 1px solid var(--line); color: var(--muted); font-size: 9px; padding: 5px 7px; border-radius: 3px; text-transform: uppercase; letter-spacing: .06em; font-weight: 700; }
        .ifrs-page .rate-row { display: flex; align-items: center; gap: 8px; color: var(--muted); font-size: 11px; border-bottom: 1px solid var(--line); padding: 0 0 13px; }
        .ifrs-page .rate-chip { background: var(--pale-teal); color: var(--teal-dark); font-size: 10px; font-weight: 700; border-radius: 3px; padding: 4px 7px; }
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
        .ifrs-page .footer { border-top: 1px solid var(--line); padding: 21px 0 30px; display: flex; justify-content: space-between; gap: 25px; color: var(--muted); font-size: 10px; }
        .ifrs-page .footer p { margin: 0; max-width: 750px; }
        .ifrs-page .footer-brand { font-weight: 700; color: var(--ink); white-space: nowrap; }
        @media (max-width: 760px) {
          .ifrs-page .frame { width: min(100% - 36px, 560px); }
          .ifrs-page .header { height: 66px; }
          .ifrs-page .nav { gap: 16px; }
          .ifrs-page .nav a:not(.nav-cta) { display: none; }
          .ifrs-page .hero { grid-template-columns: 1fr; gap: 38px; padding: 50px 0 51px; }
          .ifrs-page h1 { max-width: 530px; }
          .ifrs-page .hero-copy { max-width: 500px; }
          .ifrs-page .schedule-shell { margin-right: 9px; }
          .ifrs-page .trustbar { justify-content: flex-start; flex-wrap: wrap; gap: 14px 24px; }
          .ifrs-page .trust-intro { width: 100%; }
          .ifrs-page .section { padding: 58px 0; }
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
          .ifrs-page .footer { flex-direction: column; gap: 9px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ifrs-page *, .ifrs-page *:before, .ifrs-page *:after { scroll-behavior: auto !important; transition-duration: .01ms !important; }
        }
      `}</style>

      <div className="statusline">IFRS Lab is in development. The standards and workflow shown below are not yet available.</div>
      <div className="frame">
        <header className="header">
          <a className="brand" href="#top" aria-label="IFRS Lab home">
            <span className="brandmark">IL</span><span>IFRS <em>Lab</em></span>
          </a>
          <nav className="nav" aria-label="Main navigation">
            <a href="#roadmap">Standards</a>
            <a href="#approach">Approach</a>
            <a href="#schedule" className="nav-cta">View sample schedule</a>
          </nav>
        </header>

        <section className="hero" id="top">
          <div>
            <p className="eyebrow">A clearer path through complex standards</p>
            <h1>Make every number <span className="accent">traceable.</span></h1>
            <p className="hero-copy">IFRS Lab is being built to help finance teams turn source data and controlled assumptions into clear IFRS schedules and reports.</p>
            <div className="actions">
              <a className="button" href="#schedule">See an illustrative schedule <Arrow /></a>
              <a className="text-link" href="#roadmap">Explore the roadmap <Arrow /></a>
            </div>
            <div className="microproof"><span>↳</span> Designed around visible inputs, clear workings and review.</div>
          </div>

          <div className="schedule-shell" id="schedule">
            <article className="schedule" aria-label="Illustrative lease schedule">
              <div className="schedule-head">
                <div><span className="schedule-kicker">Illustration · IFRS 16</span><h2>Lease liability schedule</h2></div>
                <span className="sample-label">Example only</span>
              </div>
              <div className="rate-row"><span className="rate-chip">8% rate</span><span>Illustrative discount rate</span></div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Year</th><th>Opening liability</th><th>Interest</th><th>Payment</th><th>Closing</th></tr></thead>
                  <tbody>{schedule.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={`${row[0]}-${index}`}>{cell}</td>)}</tr>)}</tbody>
                </table>
              </div>
              <p className="table-note"><strong>Illustrative figures at an 8% discount rate.</strong> Final-year rounding left as is.</p>
            </article>
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
          <div className="judgment-copy"><strong>IFRS Lab is under construction.</strong> Any future outputs are intended as calculation aids only. They do not replace professional accounting judgment or audit, and no compliance certification or audit approval is implied.</div>
        </section>

        <section className="bottom-callout" aria-label="Explore more">
          <div><h2>See the workings, not just the total.</h2><p>Review the illustrative schedule and the planned standards scope above.</p></div>
          <a className="button" href="#schedule">Return to schedule <Arrow /></a>
        </section>

        <footer className="footer">
          <p>IFRS Lab is under construction. IFRS 16, IFRS 9 and IFRS 17 capabilities shown are in development and are not yet available. Outputs do not replace professional accounting judgment or audit.</p>
          <span className="footer-brand">IFRS Lab</span>
        </footer>
      </div>
    </main>
  );
}

export default IfrsMetrics;
