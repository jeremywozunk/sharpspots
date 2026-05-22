import Link from 'next/link';

const SITE_URL = 'https://sharpspots.vercel.app';

export const metadata = {
  title: 'How It Works | The SharpSpots Methodology',
  description: 'How SharpSpots finds +EV betting edges using algorithmic analysis. Our process, confidence scoring, and what we do differently.',
  alternates: { canonical: `${SITE_URL}/how-it-works` },
  openGraph: {
    title: 'How SharpSpots Works | Our Methodology',
    description: 'How we find +EV betting edges using algorithmic analysis. Process, confidence scoring, and differentiation.',
    url: `${SITE_URL}/how-it-works`,
    siteName: 'SharpSpots',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How SharpSpots Works | Our Methodology',
    description: 'How we find +EV betting edges using algorithmic analysis.',
  },
};

export default function HowItWorksPage() {
  return (
    <>
      <style>{`
        .hiw-hero { padding: 64px 48px 48px; text-align: center; background: var(--bg-2); border-bottom: 1px solid var(--border-subtle); }
        .hiw-hero h1 { font-family: var(--font-display); font-weight: 800; font-size: 56px; text-transform: uppercase; letter-spacing: 2px; color: var(--fg); line-height: 1; margin-bottom: 16px; }
        .hiw-hero h1 em { font-style: normal; color: var(--jade); }
        .hiw-hero p { font-size: 18px; color: var(--gray-muted); line-height: 1.6; max-width: 640px; margin: 0 auto; }

        .hiw-section { max-width: 760px; margin: 0 auto; padding: 56px 32px; }
        .hiw-section + .hiw-section { padding-top: 0; }
        .hiw-section h2 { font-family: var(--font-display); font-weight: 800; font-size: 32px; text-transform: uppercase; letter-spacing: 1px; color: var(--jade); line-height: 1.1; margin-bottom: 8px; }
        .hiw-section .h2-sub { font-size: 14px; color: var(--gold); font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px; }
        .hiw-section p { font-size: 17px; color: var(--fg); line-height: 1.7; margin-bottom: 16px; }
        .hiw-section p:last-child { margin-bottom: 0; }
        .hiw-section strong { color: var(--fg); font-weight: 700; }

        .rhythm-stack { display: flex; flex-direction: column; gap: 14px; margin: 24px 0; }
        .rhythm-card { background: var(--bg); border: 1px solid var(--border-subtle); border-left: 4px solid var(--jade); border-radius: 8px; padding: 20px; }
        .rhythm-card.future { border-left-color: var(--gold); background: var(--bg-2); }
        .rhythm-time { font-size: 12px; font-weight: 700; color: var(--gold); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
        .rhythm-title { font-size: 17px; font-weight: 700; color: var(--fg); margin-bottom: 6px; }
        .rhythm-desc { font-size: 15px; color: var(--gray-muted); line-height: 1.55; }

        .steps { margin: 32px 0; }
        .step-row { display: flex; gap: 20px; padding: 20px 0; border-bottom: 1px solid var(--border-subtle); }
        .step-row:last-child { border-bottom: 0; }
        .step-num { font-family: var(--font-display); font-size: 36px; font-weight: 800; color: var(--jade); line-height: 1; min-width: 50px; }
        .step-content h3 { font-size: 17px; font-weight: 700; color: var(--fg); margin-bottom: 6px; }
        .step-content p { font-size: 15px; color: var(--gray-muted); line-height: 1.6; margin-bottom: 0; }

        .confidence-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 24px 0; }
        .conf-card { background: var(--bg-2); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 16px; }
        .conf-card.boost { border-left: 4px solid var(--jade); }
        .conf-card.penalty { border-left: 4px solid #b91c1c; }
        .conf-label { font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px; }
        .conf-card.boost .conf-label { color: var(--jade); }
        .conf-card.penalty .conf-label { color: #b91c1c; }
        .conf-text { font-size: 14px; color: var(--fg); line-height: 1.5; }

        .stars-reality { background: var(--bg-2); border: 1px solid var(--gold); border-radius: 8px; padding: 20px; margin: 20px 0; }
        .stars-reality-title { font-size: 14px; font-weight: 700; color: var(--gold); letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 12px; }
        .stars-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 0.5px solid var(--border-subtle); font-size: 14px; }
        .stars-row:last-child { border-bottom: 0; }
        .stars-row .stars { color: var(--gold); letter-spacing: 2px; font-size: 14px; }
        .stars-row .meaning { color: var(--gray-muted); }

        .what-we-dont { background: var(--bg-2); border-left: 4px solid var(--jade); border-radius: 8px; padding: 24px; margin: 24px 0; }
        .what-we-dont h2 { color: var(--jade); font-size: 24px; margin-bottom: 12px; }
        .wwd-list { list-style: none; padding: 0; margin: 0; }
        .wwd-list li { font-size: 15px; color: var(--fg); padding: 8px 0 8px 28px; position: relative; line-height: 1.5; }
        .wwd-list li:before { content: '✗'; position: absolute; left: 0; top: 8px; color: #b91c1c; font-weight: 700; font-size: 16px; }

        .framing { background: var(--bg-2); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 28px; margin: 32px 0; text-align: center; }
        .framing-quote { font-size: 18px; color: var(--fg); line-height: 1.6; font-weight: 600; }
        .framing-attr { font-size: 13px; color: var(--gray-muted); margin-top: 12px; }

        .disclaimer-block { background: var(--bg-2); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 24px; margin-top: 32px; font-size: 13px; color: var(--gray-muted); line-height: 1.6; }
        .disclaimer-block strong { color: var(--fg); }
        .disclaimer-block a { color: var(--gold); }

        @media (max-width: 768px) {
          .hiw-hero { padding: 40px 20px 32px; }
          .hiw-hero h1 { font-size: 38px; }
          .hiw-hero p { font-size: 16px; }
          .hiw-section { padding: 40px 20px; }
          .hiw-section h2 { font-size: 26px; }
          .hiw-section p { font-size: 16px; }
          .confidence-grid { grid-template-columns: 1fr; }
          .step-num { font-size: 28px; min-width: 40px; }
        }
      `}</style>

      <div className="hiw-hero">
        <h1>How <em>SharpSpots</em> works</h1>
        <p>Every morning, we run every game through a three-pillar model that quantifies statistical edge, situational context, and what the market is doing. When all three agree, the pick gets more stars. When they disagree, fewer stars. Nothing is subjective.</p>
      </div>

      <section className="hiw-section">
        <div className="h2-sub">The Daily Rhythm</div>
        <h2>When picks drop, and how they refresh</h2>
        <p>Different sports settle their lineups at different times, so picks publish on a per-sport schedule. Lines keep moving after publication, so we re-pull the market every couple of hours and update the expected value on the page.</p>

        <div className="rhythm-stack">
          <div className="rhythm-card">
            <div className="rhythm-time">6 AM ET — NBA</div>
            <div className="rhythm-title">Basketball drops at sunrise</div>
            <div className="rhythm-desc">Once injury reports settle overnight, we run the full slate. Picks go live before most people are awake. The page is ready when you open your phone.</div>
          </div>
          <div className="rhythm-card">
            <div className="rhythm-time">12 PM ET — MLB Morning Pass</div>
            <div className="rhythm-title">Day games + early-evening starts</div>
            <div className="rhythm-desc">Once probable pitchers are confirmed for the day's slate, we run analysis. Picks for any game starting before 6 PM ET publish here.</div>
          </div>
          <div className="rhythm-card">
            <div className="rhythm-time">4:30 PM ET — MLB Evening Pass</div>
            <div className="rhythm-title">Prime-time and West Coast slate</div>
            <div className="rhythm-desc">Late lineup scratches and west-coast pitcher confirmations land between noon and 4 PM, so the evening pass catches the night slate with fresh data.</div>
          </div>
          <div className="rhythm-card">
            <div className="rhythm-time">~2 Hours Pre-Game</div>
            <div className="rhythm-title">Lines refresh, EV recalculates</div>
            <div className="rhythm-desc">Lines drift all day. About two hours before tipoff or first pitch, we re-pull current odds for every active pick and update the expected value shown on the page.</div>
          </div>
          <div className="rhythm-card future">
            <div className="rhythm-time">Coming Soon</div>
            <div className="rhythm-title">Daily email + more leagues</div>
            <div className="rhythm-desc">NFL, NHL, and college basketball next. A morning &quot;State of Play&quot; email is in the queue once the cross-sport schedule stabilizes.</div>
          </div>
        </div>
      </section>

      <section className="hiw-section">
        <div className="h2-sub">Our Process</div>
        <h2>How a pick gets made</h2>
        <p>Each game runs through five steps. Steps 1 and 2 happen in parallel for every game on the slate. Steps 3 through 5 happen per game.</p>

        <div className="steps">
          <div className="step-row">
            <div className="step-num">01</div>
            <div className="step-content">
              <h3>Pull the data</h3>
              <p>For every game on the slate, we fetch the matchup, probable starters or active lineups, recent performance, ballpark and weather (for MLB), bullpen workload (for MLB), bench depth (for NBA), and current odds from every major US sportsbook plus Pinnacle.</p>
            </div>
          </div>
          <div className="step-row">
            <div className="step-num">02</div>
            <div className="step-content">
              <h3>Fire the three pillars</h3>
              <p>The model evaluates the game against three independent groups of signals — <strong>statistical</strong>, <strong>situational</strong>, and <strong>market</strong> — described below. Each pillar produces a directional lean (home / away / neither) and a strength score.</p>
            </div>
          </div>
          <div className="step-row">
            <div className="step-num">03</div>
            <div className="step-content">
              <h3>Project the game</h3>
              <p>Pillar outputs feed a Bayesian aggregator that produces a probability distribution over outcomes (win probability, projected total). We strip the vig out of the sportsbook's line to get its implied true probability, then compare.</p>
            </div>
          </div>
          <div className="step-row">
            <div className="step-num">04</div>
            <div className="step-content">
              <h3>Score confidence</h3>
              <p>Stars are assigned by how many pillars fired in the same direction and how strongly. One pillar firing alone caps the pick at 2 stars. Two pillars agreeing can reach 4 stars. All three pillars agreeing is required for 5. April and May get an extra one-tier penalty because sample sizes are too small to fully trust.</p>
            </div>
          </div>
          <div className="step-row">
            <div className="step-num">05</div>
            <div className="step-content">
              <h3>Publish in plain English</h3>
              <p>A language model translates the numbers into the kind of paragraph you'd read in a sharp's newsletter. Stylistic guardrails ban hype phrases, em-dashes, and AI tells. The math drives every claim.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="hiw-section">
        <div className="h2-sub">The Three Pillars</div>
        <h2>What we actually measure</h2>
        <p>This is the part most sites won't show you. The signals below are the ones currently firing in production. As we add data sources, the pillars get heavier.</p>

        <div className="rhythm-stack">
          <div className="rhythm-card">
            <div className="rhythm-time">Pillar 1 — Statistical</div>
            <div className="rhythm-title">Who's better on paper</div>
            <div className="rhythm-desc">For MLB: starter SIERA differential, hitter wOBA against the opposing pitcher's handedness (PA-weighted by lineup spot), and a rolling 21-day SIERA to catch hot or cold streaks. For NBA: net rating differential, pace-adjusted offensive and defensive efficiency, and rest differential.</div>
          </div>
          <div className="rhythm-card">
            <div className="rhythm-time">Pillar 2 — Situational</div>
            <div className="rhythm-title">What's different about today</div>
            <div className="rhythm-desc">For MLB: bullpen quality (K-BB% from FanGraphs's reliever leaderboard) and workload (taxed bullpens from recent usage), ballpark factors, and weather (wind, temperature, Coors). For NBA: starter availability via injury report, back-to-back fatigue, and travel.</div>
          </div>
          <div className="rhythm-card">
            <div className="rhythm-time">Pillar 3 — Market</div>
            <div className="rhythm-title">What sharp money is doing</div>
            <div className="rhythm-desc">Two market signals fire here. First, line-movement detection: if a line moves 15+ cents on moneyline or 0.5+ runs on a total across multiple books in the same direction, that's sharp money showing up. Second, Pinnacle divergence: when the rec books (DraftKings, FanDuel) are at a different number than Pinnacle (the sharpest book in the world), the rec books usually haven't caught up to where sharp action has already moved Pinnacle.</div>
          </div>
        </div>

        <p>Each pillar can fire in favor of either team or stay silent if its signals contradict each other. The signals within a pillar use weights tuned from historical data. The pillars themselves are not weighted equally — the situational pillar earns the most weight when its underlying data is strong (e.g., a confirmed bullpen-taxed game) and less when it isn't.</p>
      </section>

      <section className="hiw-section">
        <div className="h2-sub">Confidence Stars</div>
        <h2>What the stars actually mean</h2>
        <p>The 1-5 star rating is calculated, not assigned. Two inputs drive it: how many pillars fired in the same direction (the agreement count) and how big the calculated edge is. Both have to clear a threshold.</p>

        <div className="confidence-grid">
          <div className="conf-card boost">
            <div className="conf-label">↑ Boosts</div>
            <div className="conf-text">Larger calculated edge over the no-vig line, all three pillars agreeing on a direction, confirmed starting pitcher or lineup, line moving toward our side across multiple books.</div>
          </div>
          <div className="conf-card penalty">
            <div className="conf-label">↓ Reduces</div>
            <div className="conf-text">Only one pillar firing, line moving against our side, key player downgrade pre-game, early-season cap (April and May drop every pick by one tier across all sports).</div>
          </div>
        </div>

        <p>Higher stars don't mean a pick is "safe." Variance is built into every bet. Stars are information about how much the model trusts the math underneath.</p>

        <div className="stars-reality">
          <div className="stars-reality-title">What each tier corresponds to</div>
          <div className="stars-row">
            <span className="stars">★★★★★</span>
            <span className="meaning">All three pillars agree, large edge. Recommended stake: 3 units.</span>
          </div>
          <div className="stars-row">
            <span className="stars">★★★★☆</span>
            <span className="meaning">Two pillars firing strongly, meaningful edge. Recommended stake: 2 units.</span>
          </div>
          <div className="stars-row">
            <span className="stars">★★★☆☆</span>
            <span className="meaning">Real edge, mixed pillar signals. Recommended stake: 1 unit.</span>
          </div>
          <div className="stars-row">
            <span className="stars">★★☆☆☆</span>
            <span className="meaning">Modest edge, one pillar firing. Recommended stake: 0.5 units.</span>
          </div>
          <div className="stars-row">
            <span className="stars">★☆☆☆☆</span>
            <span className="meaning">Marginal edge below our recommended bet threshold. Shown for transparency; no recommended play. Does not count in Track Record.</span>
          </div>
        </div>

        <p>A 5-star pick can still lose. A 2-star pick is a tighter edge with thinner margin for error. <strong>The star rating is information about the math, not a recommendation.</strong> Track our actual results on the <Link href="/track-record" style={{ color: 'var(--gold)' }}>Track Record</Link> page.</p>
      </section>

      <section className="hiw-section">
        <div className="what-we-dont">
          <h2>What we don't do</h2>
          <ul className="wwd-list">
            <li><strong>Hype language.</strong> You won't see "lock of the day" or guaranteed winners. Every pick has variance built in.</li>
            <li><strong>Human handicappers.</strong> No tipsters, no touts, no gut feel. The picks come from algorithms running on real data. A language model writes the paragraph, but the pick itself is math.</li>
            <li><strong>Promises about outcomes.</strong> We're confident in the process. Any single game can go either way.</li>
            <li><strong>Paywalls on the analysis.</strong> The picks and reasoning are free. Always.</li>
            <li><strong>Claims to be financial or professional advisors.</strong> This is entertainment.</li>
          </ul>
        </div>
      </section>

      <section className="hiw-section">
        <div className="framing">
          <div className="framing-quote">"SharpSpots picks are tools to inform your own thinking, not replacements for it."</div>
          <div className="framing-attr">Bet only what you can afford to lose.</div>
        </div>
      </section>

      <section className="hiw-section">
        <div className="disclaimer-block">
          <p style={{ margin: '0 0 12px 0' }}>
            <strong>Disclaimer:</strong> SharpSpots provides educational analysis intended to supplement your own decision-making. This is not financial advice, gambling advice, or a guarantee of outcomes. Past performance does not guarantee future results. 21+ only. If you choose to bet, bet responsibly.
          </p>
          <p style={{ margin: 0 }}>
            Problem gambling? Call <strong>1-800-GAMBLER</strong> or visit{' '}
            <a href="https://www.ncpg.org">ncpg.org</a>.
          </p>
        </div>
      </section>
    </>
  );
}