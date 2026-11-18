import { useEffect, type ReactNode } from "react";
import { Link } from "wouter";
import "@/assets/styles/stat-lab/StatLabLanding.css";

const Icon = ({ name, size = 18 }: { name: string; size?: number }) => {
  const paths: Record<string, ReactNode> = {
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
  useEffect(() => {
    document.title = "StatLab — From raw rows to clearer evidence";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Explore CSV and TSV data with careful summaries, histograms, Welch t-tests, and local browser-based analysis.");
  }, []);

  return (
    <div className="sl-page">
      <header className="sl-wrap sl-top">
        <a className="sl-logo" href="#top" aria-label="StatLab home"><span className="sl-mark"><Icon name="chart" size={18} /></span><span>StatLab</span></a>
        <nav className="sl-nav" aria-label="Main navigation">
          <Link href="/ifrs">IFRS Metrics</Link>
          <a href="#workflow">How it works</a>
          <a href="#capabilities">What it can do</a>
          <Link className="sl-button sl-small" href="/workspace">Open workspace <Icon name="arrow" size={15} /></Link>
        </nav>
      </header>

      <main id="top">
        <section className="sl-wrap sl-hero">
          <div className="sl-hero-copy">
            <div className="sl-kicker">A browser-based data workspace</div>
            <h1>From raw rows to <em>clearer</em> evidence.</h1>
            <p className="sl-lead">Bring a CSV or TSV, take a closer look, and run a few careful analyses—without sending your dataset anywhere.</p>
            <div className="sl-actions">
              <Link className="sl-button" href="/workspace">Open StatLab <Icon name="arrow" size={17} /></Link>
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
            <Link className="sl-button" href="/workspace">Open the StatLab workspace <Icon name="arrow" size={17} /></Link>
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
