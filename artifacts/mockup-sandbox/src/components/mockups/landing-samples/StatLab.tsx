import React from "react";

const workspaceUrl = "https://274ad449-1251-4772-aafd-26e2c31f0809-00-otrclokwcfd7.worf.replit.dev/";

const Icon = ({ name, size = 18 }: { name: string; size?: number }) => {
  const paths: Record<string, React.ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></>,
    table: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M9 4v16M15 10v10" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-5 5" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" /><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

export function StatLab() {
  return (
    <div className="sl-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Mono:wght@400;500&display=swap');
        .sl-page{--bg:#edf3f6;--paper:#fbfcfb;--ink:#132b40;--muted:#52697b;--line:#ccd9e1;--teal:#137b6d;--teal-dark:#0d6258;--mint:#dcefe9;--amber:#f6e6b9;--amber-ink:#604a16;color:var(--ink);background:var(--bg);font-family:'Bricolage Grotesque',sans-serif;line-height:1.5;min-height:100vh;overflow:hidden}
        .sl-page *{box-sizing:border-box}.sl-wrap{width:min(1160px,calc(100% - 48px));margin:0 auto}
        .sl-top{height:78px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(19,43,64,.13)}
        .sl-logo{display:flex;align-items:center;gap:11px;text-decoration:none;color:var(--ink);font-size:21px;font-weight:800;letter-spacing:-.045em}
        .sl-mark{width:34px;height:34px;border-radius:10px;background:var(--ink);display:grid;place-items:center;color:#b8e3d4}
        .sl-nav{display:flex;align-items:center;gap:29px}.sl-nav a{font-size:13px;color:var(--muted);text-decoration:none;font-weight:600}.sl-nav a:hover{color:var(--teal)}
        .sl-button{display:inline-flex;justify-content:center;align-items:center;gap:10px;padding:13px 18px;border:0;border-radius:7px;background:var(--teal);color:#fff;text-decoration:none;font-weight:700;font-size:13px;transition:transform .18s ease,background .18s ease}
        .sl-button:hover{background:var(--teal-dark);transform:translateY(-2px)}.sl-button:focus-visible,.sl-nav a:focus-visible{outline:3px solid #d89c2f;outline-offset:4px}
        .sl-button.sl-small{padding:10px 15px;font-size:12px}
        .sl-hero{display:grid;grid-template-columns:.9fr 1.1fr;align-items:center;gap:55px;padding:76px 0 82px;position:relative}
        .sl-kicker{display:flex;align-items:center;gap:9px;color:var(--teal);font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
        .sl-kicker:before{content:'';width:25px;height:1px;background:currentColor}
        .sl-hero h1{font-size:clamp(46px,6vw,76px);line-height:.99;letter-spacing:-.065em;margin:20px 0 20px;max-width:570px;font-weight:800}
        .sl-hero h1 em{font-style:normal;color:var(--teal)}
        .sl-lead{font-size:17px;color:var(--muted);max-width:475px;line-height:1.65;margin:0 0 27px}
        .sl-actions{display:flex;align-items:center;gap:20px;flex-wrap:wrap}.sl-textlink{font-size:13px;font-weight:700;color:var(--ink);text-decoration:none;display:inline-flex;align-items:center;gap:8px}
        .sl-trust{display:flex;align-items:center;gap:9px;color:#526b78;font-size:11px;margin-top:23px}.sl-trust svg{color:var(--teal)}
        .sl-visual{position:relative;padding:12px 0 12px 12px}
        .sl-visual:before{content:'';position:absolute;z-index:0;inset:44px -20px 0 62px;background:#dce9ec;border-radius:48% 52% 42% 58% / 48% 39% 61% 52%;transform:rotate(-4deg)}
        .sl-app{position:relative;z-index:1;background:var(--paper);border:1px solid #c7d6dc;border-radius:12px;box-shadow:0 24px 60px rgba(19,43,64,.12);overflow:hidden}
        .sl-appbar{height:48px;background:#142b3e;color:#e7f1ef;display:flex;align-items:center;justify-content:space-between;padding:0 15px}
        .sl-appbrand{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:700}.sl-dot{height:7px;width:7px;background:#72c9a7;border-radius:50%}
        .sl-browser{font-family:'DM Mono',monospace;font-size:9px;color:#b2c0c9;display:flex;align-items:center;gap:8px}
        .sl-appbody{display:grid;grid-template-columns:146px minmax(0,1fr);min-height:337px}
        .sl-rail{background:#f1f5f4;border-right:1px solid #dce4e3;padding:15px 10px}
        .sl-rail-label{font-size:8px;text-transform:uppercase;letter-spacing:.13em;color:#85949a;font-weight:700;padding:2px 8px 9px}
        .sl-rail-item{display:flex;align-items:center;gap:8px;padding:8px;border-radius:5px;color:#61737b;font-size:10px;margin-bottom:3px}
        .sl-rail-item.active{background:#dcebe5;color:#1b6b5c;font-weight:700}
        .sl-dataset{margin-top:19px;border-top:1px solid #d9e1df;padding:14px 8px 0;color:#263f4d;font-size:9px;font-weight:700}
        .sl-dataset small{display:block;font-size:8px;color:#7b8b8e;font-weight:500;margin-top:4px}
        .sl-work{padding:18px 18px 16px;min-width:0}
        .sl-workhead{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
        .sl-workhead h3{margin:0;font-size:15px;letter-spacing:-.025em}.sl-workhead p{margin:3px 0 0;color:#829095;font-size:9px}
        .sl-demo-tag{font-size:8px;color:#795f1f;background:#f8edce;border-radius:20px;padding:5px 8px;white-space:nowrap;font-weight:700}
        .sl-fields{display:flex;gap:6px;overflow:hidden;margin:14px 0 12px}
        .sl-field{font:8px 'DM Mono',monospace;color:#51636a;border:1px solid #dbe3e1;background:#fafcfb;border-radius:4px;padding:5px 7px;white-space:nowrap}
        .sl-tablewrap{overflow:hidden;border:1px solid #e0e6e2;border-radius:5px}
        .sl-table{border-collapse:collapse;width:100%;font-size:9px;white-space:nowrap;text-align:left}
        .sl-table th{background:#f5f7f4;color:#84908e;font-size:7px;letter-spacing:.08em;text-transform:uppercase;font-weight:700}
        .sl-table th,.sl-table td{padding:7px 8px;border-bottom:1px solid #e9eeeb}
        .sl-table tr:last-child td{border-bottom:0}.sl-table td{color:#475d62}.sl-table td.num{font-family:'DM Mono',monospace;color:#385c55}
        .sl-analysis{display:grid;grid-template-columns:1.15fr .85fr;gap:10px;margin-top:12px}
        .sl-analysis-card{border:1px solid #dfe7e3;border-radius:6px;padding:10px;background:#fcfdfb;min-width:0}
        .sl-analysis-title{display:flex;justify-content:space-between;align-items:center;gap:6px;font-size:9px;font-weight:700;color:#29434b}
        .sl-analysis-title span:last-child{font-size:7px;color:#798d8a;font-weight:500}
        .sl-chart{height:61px;display:flex;align-items:flex-end;gap:6px;border-bottom:1px solid #d9e4df;margin:9px 3px 0;padding:0 5px}
        .sl-bar{flex:1;max-width:23px;background:#65ad98;border-radius:3px 3px 0 0;position:relative}
        .sl-bar:nth-child(2){background:#408d7b}.sl-bar:nth-child(3){background:#187b6c}.sl-bar:nth-child(4){background:#8fc7b2}
        .sl-bar:after{content:attr(data-count);position:absolute;top:-14px;left:50%;transform:translateX(-50%);font:7px 'DM Mono',monospace;color:#68837a}
        .sl-axes{display:flex;justify-content:space-between;font:7px 'DM Mono',monospace;color:#84938f;margin:4px 2px 0}
        .sl-statline{display:flex;justify-content:space-between;border-bottom:1px solid #edf0ed;padding:6px 0;font-size:8px;color:#687b7d}
        .sl-statline b{font:9px 'DM Mono',monospace;color:#29474c}
        .sl-worknote{font-size:8px;color:#879294;margin:9px 1px 0}
        .sl-floatnote{position:absolute;right:-27px;bottom:23px;background:#f6e6b9;border:1px solid #e8d8a7;border-radius:7px;padding:11px 13px;max-width:181px;box-shadow:0 10px 25px rgba(39,55,49,.09);font-size:10px;color:#604a16;line-height:1.4;z-index:2}
        .sl-floatnote strong{display:block;margin-bottom:3px;font-size:11px}
        .sl-proof{border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:rgba(255,255,255,.36)}
        .sl-proof-inner{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:20px 0}
        .sl-proof-intro{font-size:11px;color:#72838c;max-width:160px;line-height:1.4}
        .sl-proof-item{display:flex;align-items:center;gap:10px;font-size:12px;font-weight:700;color:#304a59}
        .sl-proof-icon{width:32px;height:32px;border-radius:8px;background:#dcebe5;color:var(--teal);display:grid;place-items:center}
        .sl-section{padding:92px 0}.sl-section-head{max-width:590px;margin-bottom:38px}
        .sl-section h2{font-size:clamp(32px,4vw,48px);line-height:1.04;letter-spacing:-.055em;margin:14px 0 12px}
        .sl-section-head p{font-size:15px;color:var(--muted);max-width:540px;margin:0;line-height:1.65}
        .sl-path{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:stretch}
        .sl-path-main{background:var(--ink);border-radius:11px;color:#eff6f1;padding:30px 31px;position:relative;overflow:hidden}
        .sl-path-main:after{content:'01';position:absolute;right:16px;bottom:-28px;font-size:144px;font-weight:800;letter-spacing:-.1em;color:rgba(202,237,220,.07);line-height:1}
        .sl-step-kicker{font:10px 'DM Mono',monospace;color:#91ccb5;letter-spacing:.12em}
        .sl-path-main h3{font-size:28px;letter-spacing:-.04em;margin:13px 0 8px;max-width:310px;line-height:1.08}
        .sl-path-main p{font-size:13px;line-height:1.6;color:#b8c9ce;max-width:350px;margin:0}
        .sl-drop{margin-top:26px;border:1px dashed #75918f;border-radius:7px;padding:15px;display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.035)}
        .sl-drop-icon{width:35px;height:35px;border-radius:8px;background:#275247;color:#b9ebd4;display:grid;place-items:center}
        .sl-drop b{font-size:11px;display:block}.sl-drop small{display:block;color:#a4b9ba;font-size:9px;margin-top:2px}
        .sl-path-side{display:flex;flex-direction:column;gap:13px}
        .sl-path-card{border:1px solid var(--line);background:var(--paper);border-radius:9px;padding:22px 23px;flex:1}
        .sl-path-card-top{display:flex;align-items:center;gap:11px}.sl-step-number{width:30px;height:30px;border:1px solid #bed7cb;border-radius:50%;color:var(--teal);display:grid;place-items:center;font:10px 'DM Mono',monospace}
        .sl-path-card h3{margin:0;font-size:16px;letter-spacing:-.025em}.sl-path-card p{margin:10px 0 0 41px;font-size:12px;color:var(--muted);line-height:1.6;max-width:370px}
        .sl-capabilities{background:#e2ecee;border-top:1px solid #d2dfe1;border-bottom:1px solid #d2dfe1}
        .sl-cap-layout{display:grid;grid-template-columns:.8fr 1.2fr;gap:60px;align-items:start}
        .sl-cap-layout .sl-section-head{margin:0}
        .sl-cap-list{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .sl-cap{background:rgba(251,252,251,.77);border:1px solid #d3e0e1;border-radius:8px;padding:18px}
        .sl-cap-icon{width:30px;height:30px;background:#d9eee6;color:var(--teal);border-radius:7px;display:grid;place-items:center;margin-bottom:12px}
        .sl-cap h3{font-size:14px;margin:0 0 5px;letter-spacing:-.02em}.sl-cap p{font-size:11px;color:#667d87;margin:0;line-height:1.55}
        .sl-limits{margin-top:18px;border-left:3px solid #d09a34;background:#f7edcf;padding:14px 17px;border-radius:0 7px 7px 0;color:#68531e;font-size:11px;line-height:1.55}
        .sl-limits strong{display:block;font-size:12px;margin-bottom:3px}
        .sl-privacy{display:grid;grid-template-columns:1fr auto;gap:30px;align-items:center;background:var(--mint);border:1px solid #c5dfd3;border-radius:10px;padding:27px 30px}
        .sl-privacy h3{font-size:22px;letter-spacing:-.04em;margin:0 0 6px}.sl-privacy p{font-size:12px;color:#4d706a;max-width:600px;margin:0;line-height:1.6}
        .sl-privacy-mark{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;background:#c9e5d8;color:#176e5c}
        .sl-cta{background:var(--ink);color:#f3f7f3;padding:56px 28px;text-align:center;border-radius:12px;position:relative;overflow:hidden}
        .sl-cta:before,.sl-cta:after{content:'';position:absolute;border:1px solid rgba(169,219,196,.16);border-radius:50%;width:250px;height:250px;top:-145px;left:-72px}
        .sl-cta:after{width:320px;height:320px;top:auto;left:auto;right:-170px;bottom:-245px}
        .sl-cta .sl-kicker{justify-content:center;color:#a6d5c1}.sl-cta h2{font-size:clamp(32px,4.5vw,50px);letter-spacing:-.055em;line-height:1.03;margin:15px auto 12px;max-width:650px}
        .sl-cta p{font-size:13px;color:#b5c6c8;margin:0 auto 23px;max-width:490px}
        .sl-cta .sl-button{background:#82c9ad;color:#102e37}.sl-cta .sl-button:hover{background:#a1ddc3}
        .sl-footer{padding:24px 0 32px;border-top:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:20px;color:#667b84;font-size:10px}
        .sl-footbrand{font-size:13px;font-weight:800;letter-spacing:-.03em;color:var(--ink)}
        @media(max-width:900px){.sl-hero{grid-template-columns:1fr;gap:35px;padding:58px 0 65px}.sl-hero-copy{max-width:650px}.sl-visual{width:min(680px,100%);margin:0 auto}.sl-floatnote{right:-10px}.sl-cap-layout{grid-template-columns:1fr;gap:27px}.sl-section{padding:72px 0}}
        @media(max-width:640px){.sl-wrap{width:min(100% - 32px,540px)}.sl-top{height:68px}.sl-nav{gap:0}.sl-nav a:not(.sl-button){display:none}.sl-nav .sl-button{padding:9px 12px;font-size:11px}.sl-logo{font-size:19px}.sl-mark{width:31px;height:31px}.sl-hero{padding:48px 0 48px;gap:25px}.sl-hero h1{font-size:clamp(43px,13vw,60px);margin:17px 0}.sl-lead{font-size:15px}.sl-actions{gap:14px}.sl-visual{padding:6px 0}.sl-appbody{grid-template-columns:102px minmax(0,1fr);min-height:0}.sl-rail{padding:12px 6px}.sl-rail-item{font-size:8px;gap:5px;padding:7px 5px}.sl-rail-item svg{width:13px}.sl-work{padding:13px 10px}.sl-workhead h3{font-size:12px}.sl-workhead p{font-size:8px}.sl-demo-tag{font-size:7px;padding:4px 6px}.sl-fields{gap:4px;margin:10px 0}.sl-field{font-size:7px;padding:4px 5px}.sl-table th,.sl-table td{padding:6px 5px;font-size:8px}.sl-table th{font-size:6px}.sl-analysis{gap:6px;margin-top:8px}.sl-analysis-card{padding:7px}.sl-analysis-title{font-size:8px}.sl-chart{height:46px;gap:4px}.sl-floatnote{font-size:8px;padding:8px 9px;max-width:143px;right:-2px;bottom:5px}.sl-floatnote strong{font-size:9px}.sl-proof-inner{flex-wrap:wrap;justify-content:flex-start;gap:14px;padding:18px 0}.sl-proof-intro{width:100%;max-width:none}.sl-proof-item{width:calc(50% - 7px);font-size:10px;gap:7px}.sl-proof-icon{width:28px;height:28px;flex:none}.sl-section{padding:58px 0}.sl-section-head{margin-bottom:26px}.sl-section h2{font-size:35px}.sl-path{grid-template-columns:1fr;gap:12px}.sl-path-main{padding:25px 22px}.sl-path-main h3{font-size:25px}.sl-path-card{padding:18px}.sl-cap-list{grid-template-columns:1fr 1fr;gap:8px}.sl-cap{padding:13px}.sl-cap h3{font-size:12px}.sl-cap p{font-size:10px}.sl-privacy{padding:21px;gap:12px}.sl-privacy h3{font-size:19px}.sl-privacy p{font-size:11px}.sl-privacy-mark{width:43px;height:43px;flex:none}.sl-cta{padding:43px 20px}.sl-footer{align-items:flex-start;flex-direction:column;gap:6px}.sl-tablewrap{overflow-x:auto}.sl-table{min-width:390px}}
        @media(prefers-reduced-motion:reduce){.sl-page *{scroll-behavior:auto!important;transition:none!important}}
      `}</style>
      <header className="sl-wrap sl-top">
        <a className="sl-logo" href="#top" aria-label="StatLab home"><span className="sl-mark"><Icon name="chart" size={18} /></span><span>StatLab</span></a>
        <nav className="sl-nav" aria-label="Main navigation">
          <a href="#workflow">How it works</a>
          <a href="#capabilities">What it can do</a>
          <a className="sl-button sl-small" href={workspaceUrl} target="_blank" rel="noopener noreferrer">Open workspace <Icon name="arrow" size={15} /></a>
        </nav>
      </header>

      <main id="top">
        <section className="sl-wrap sl-hero">
          <div className="sl-hero-copy">
            <div className="sl-kicker">A browser-based data workspace</div>
            <h1>From raw rows to <em>clearer</em> evidence.</h1>
            <p className="sl-lead">Bring a CSV or TSV, take a closer look, and run a few careful analyses—without sending your dataset anywhere.</p>
            <div className="sl-actions">
              <a className="sl-button" href={workspaceUrl} target="_blank" rel="noopener noreferrer">Open StatLab <Icon name="arrow" size={17} /></a>
              <a className="sl-textlink" href="#workflow">See how it works <span aria-hidden="true">↓</span></a>
            </div>
            <div className="sl-trust"><Icon name="shield" size={15} /> Files are read locally in your browser</div>
          </div>
          <div className="sl-visual" aria-label="Illustrative StatLab workspace showing a dataset and numeric histogram">
            <div className="sl-app">
              <div className="sl-appbar">
                <div className="sl-appbrand"><span className="sl-dot" /> StatLab <span style={{ color: "#91a7ac", fontWeight: 400 }}> / Data &amp; explore</span></div>
                <div className="sl-browser"><span>●</span> Browser session</div>
              </div>
              <div className="sl-appbody">
                <aside className="sl-rail">
                  <div className="sl-rail-label">Workspace</div>
                  <div className="sl-rail-item active"><Icon name="table" size={14} /> Data &amp; explore</div>
                  <div className="sl-rail-item"><Icon name="chart" size={14} /> Results</div>
                  <div className="sl-dataset">Current dataset<small>Field study · spring cohort<br />24 rows · 6 fields</small></div>
                </aside>
                <div className="sl-work">
                  <div className="sl-workhead">
                    <div><h3>Dataset preview</h3><p>Field study · spring cohort · All rows</p></div>
                    <div className="sl-demo-tag">ILLUSTRATIVE PREVIEW</div>
                  </div>
                  <div className="sl-fields">
                    <span className="sl-field">participant · abc</span><span className="sl-field">condition · abc</span><span className="sl-field">focus_score · 123</span>
                  </div>
                  <div className="sl-tablewrap">
                    <table className="sl-table">
                      <thead><tr><th>Participant</th><th>Condition</th><th>Hours sleep</th><th>Focus score</th></tr></thead>
                      <tbody>
                        <tr><td>P-01</td><td>Routine</td><td className="num">6.2</td><td className="num">61</td></tr>
                        <tr><td>P-02</td><td>Routine</td><td className="num">7.1</td><td className="num">68</td></tr>
                        <tr><td>P-03</td><td>Routine</td><td className="num">5.8</td><td className="num">55</td></tr>
                        <tr><td>P-13</td><td>Guided</td><td className="num">6.4</td><td className="num">72</td></tr>
                        <tr><td>P-14</td><td>Guided</td><td className="num">7.2</td><td className="num">79</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="sl-analysis">
                    <div className="sl-analysis-card">
                      <div className="sl-analysis-title"><span>Histogram · focus_score</span><span>24 observations</span></div>
                      <div className="sl-chart">
                        <i className="sl-bar" data-count="2" style={{ height: "21%" }} /><i className="sl-bar" data-count="8" style={{ height: "70%" }} /><i className="sl-bar" data-count="10" style={{ height: "88%" }} /><i className="sl-bar" data-count="4" style={{ height: "42%" }} />
                      </div>
                      <div className="sl-axes"><span>50</span><span>60</span><span>70</span><span>80</span><span>90</span></div>
                    </div>
                    <div className="sl-analysis-card">
                      <div className="sl-analysis-title"><span>Quick summary</span><span>focus_score</span></div>
                      <div className="sl-statline"><span>Observed</span><b>24</b></div>
                      <div className="sl-statline"><span>Missing</span><b>0</b></div>
                      <div className="sl-statline"><span>Range</span><b>52–87</b></div>
                    </div>
                  </div>
                  <div className="sl-worknote">Illustration uses the workspace’s sample study dataset.</div>
                </div>
              </div>
            </div>
            <div className="sl-floatnote"><strong>See the data and result together.</strong>Keep your analysis close to the rows that shaped it.</div>
          </div>
        </section>

        <div className="sl-proof">
          <div className="sl-wrap sl-proof-inner">
            <div className="sl-proof-intro">A small, focused toolkit for an honest first pass.</div>
            <div className="sl-proof-item"><span className="sl-proof-icon"><Icon name="upload" size={16} /></span>CSV &amp; TSV import</div>
            <div className="sl-proof-item"><span className="sl-proof-icon"><Icon name="table" size={16} /></span>Dataset preview</div>
            <div className="sl-proof-item"><span className="sl-proof-icon"><Icon name="chart" size={16} /></span>Summaries &amp; histograms</div>
            <div className="sl-proof-item"><span className="sl-proof-icon"><Icon name="shield" size={16} /></span>Local browser session</div>
          </div>
        </div>

        <section className="sl-wrap sl-section" id="workflow">
          <div className="sl-section-head">
            <div className="sl-kicker">A useful first pass</div>
            <h2>Start with what you have.<br />Follow the question.</h2>
            <p>No setup ritual. Import a delimited file, inspect its fields, then choose a supported analysis when you’re ready.</p>
          </div>
          <div className="sl-path">
            <article className="sl-path-main">
              <div className="sl-step-kicker">01 / BRING YOUR DATA</div>
              <h3>Begin with the table, not a blank page.</h3>
              <p>Load a CSV or TSV from your computer. StatLab previews the rows and identifies numeric and category fields so you can orient yourself.</p>
              <div className="sl-drop">
                <span className="sl-drop-icon"><Icon name="upload" size={18} /></span>
                <span><b>Import a local file</b><small>CSV or tab-separated values</small></span>
              </div>
            </article>
            <div className="sl-path-side">
              <article className="sl-path-card">
                <div className="sl-path-card-top"><span className="sl-step-number">02</span><h3>Explore with a clear purpose</h3></div>
                <p>Run descriptive summaries, inspect a numeric histogram, or filter rows to focus on a subset.</p>
              </article>
              <article className="sl-path-card">
                <div className="sl-path-card-top"><span className="sl-step-number">03</span><h3>Compare two independent groups</h3></div>
                <p>When your question fits, run a Welch t-test on a numeric outcome split across two observed groups.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="sl-capabilities sl-section" id="capabilities">
          <div className="sl-wrap sl-cap-layout">
            <div className="sl-section-head">
              <div className="sl-kicker">The current toolkit</div>
              <h2>Focused methods.<br />Clear boundaries.</h2>
              <p>StatLab is an approachable browser workspace for a handful of useful data tasks—not a full statistical package.</p>
              <div className="sl-limits"><strong>Not every method is available.</strong>Current computed analyses are descriptive summaries, numeric histograms, and Welch independent two-group t-tests. Row filters help you prepare the preview.</div>
            </div>
            <div className="sl-cap-list">
              <article className="sl-cap"><span className="sl-cap-icon"><Icon name="table" size={16} /></span><h3>Preview a dataset</h3><p>Inspect imported rows and the fields detected from your file.</p></article>
              <article className="sl-cap"><span className="sl-cap-icon"><Icon name="chart" size={16} /></span><h3>Descriptive summaries</h3><p>Review center, spread, range, quartiles, and missingness for numeric fields.</p></article>
              <article className="sl-cap"><span className="sl-cap-icon"><Icon name="chart" size={16} /></span><h3>Numeric histograms</h3><p>See how observed numeric values are distributed across bins.</p></article>
              <article className="sl-cap"><span className="sl-cap-icon"><Icon name="spark" size={16} /></span><h3>Welch two-group test</h3><p>Compare a numeric outcome across two independent groups.</p></article>
              <article className="sl-cap"><span className="sl-cap-icon"><Icon name="table" size={16} /></span><h3>Filter rows</h3><p>Subset the preview using a field condition before exploring.</p></article>
              <article className="sl-cap"><span className="sl-cap-icon"><Icon name="shield" size={16} /></span><h3>Work locally</h3><p>Imported data stays in the browser rather than being uploaded to a server.</p></article>
            </div>
          </div>
        </section>

        <section className="sl-wrap sl-section">
          <div className="sl-privacy">
            <div><h3>Your data stays in this browser.</h3><p>StatLab reads your selected CSV or TSV locally. The workspace is designed so your dataset stays in your browser session while you preview and explore it.</p></div>
            <div className="sl-privacy-mark"><Icon name="shield" size={25} /></div>
          </div>
        </section>

        <section className="sl-wrap" style={{ paddingBottom: 76 }}>
          <div className="sl-cta">
            <div className="sl-kicker">Ready when your dataset is</div>
            <h2>Take your next question into StatLab.</h2>
            <p>Open the workspace, import a file, and see what your data can say with the tools available today.</p>
            <a className="sl-button" href={workspaceUrl} target="_blank" rel="noopener noreferrer">Open the StatLab workspace <Icon name="arrow" size={17} /></a>
          </div>
        </section>
      </main>
      <footer className="sl-wrap sl-footer">
        <div className="sl-footbrand">StatLab</div>
        <div>A browser-based workspace for careful first looks at data.</div>
        <div>Methods are limited to the capabilities described above.</div>
      </footer>
    </div>
  );
}

export default StatLab;
