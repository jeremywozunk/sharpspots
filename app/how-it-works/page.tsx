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
        .hiw-hero { padding: 64px 48px 48px; text-align: center; background: #f9f6f0; border-bottom: 1px solid #e5e0d5; }
        .hiw-hero h1 { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 56px; text-transform: uppercase; letter-spacing: 2px; color: #111; line-height: 1; margin-bottom: 16px; }
        .hiw-hero h1 em { font-style: normal; color: #2d8c3e; }
        .hiw-hero p { font-size: 18px; color: #6b7280; line-height: 1.6; max-width: 640px; margin: 0 auto; }

        .hiw-section { max-width: 760px; margin: 0 auto; padding: 56px 32px; }
        .hiw-section + .hiw-section { padding-top: 0; }
        .hiw-section h2 { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 32px; text-transform: uppercase; letter-spacing: 1px; color: #2d8c3e; line-height: 1.1; margin-bottom: 8px; }
        .hiw-section .h2-sub { font-size: 14px; color: #b8860b; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px; }
        .hiw-section p { font-size: 17px; color: #222; line-height: 1.7; margin-bottom: 16px; }
        .hiw-section p:last-child { margin-bottom: 0; }
        .hiw-section strong { color: #111; font-weight: 700; }

        .rhythm-stack { display: flex; flex-direction: column; gap: 14px; margin: 24px 0; }
        .rhythm-card { background: #fff; border: 1px solid #e5e7eb; border-left: 4px solid #2d8c3e; border-radius: 8px; padding: 20px; }
        .rhythm-card.future { border-left-color: #b8860b; background: #fdfaf2; }
        .rhythm-time { font-size: 12px; font-weight: 700; color: #b8860b; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
        .rhythm-title { font-size: 17px; font-weight: 700; color: #111; margin-bottom: 6px; }
        .rhythm-desc { font-size: 15px; color: #4b5563; line-height: 1.55; }

        .steps { margin: 32px 0; }
        .step-row { display: flex; gap: 20px; padding: 20px 0; border-bottom: 0.5px solid #e5e7eb; }
        .step-row:last-child { border-bottom: 0; }
        .step-num { font-family: 'Barlow Condensed', sans-serif; font-size: 36px; font-weight: 800; color: #2d8c3e; line-height: 1; min-width: 50px; }
        .step-content h3 { font-size: 17px; font-weight: 700; color: #111; margin-bottom: 6px; }
        .step-content p { font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 0; }

        .confidence-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 24px 0; }
        .conf-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
        .conf-card.boost { border-left: 4px solid #2d8c3e; }
        .conf-card.penalty { border-left: 4px solid #b91c1c; }
        .conf-label { font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px; }
        .conf-card.boost .conf-label { color: #2d8c3e; }
        .conf-card.penalty .conf-label { color: #b91c1c; }
        .conf-text { font-size: 14px; color: #1f2937; line-height: 1.5; }

        .stars-reality { background: #fdf8ee; border: 1px solid #d4aa50; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .stars-reality-title { font-size: 14px; font-weight: 700; color: #8b6508; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 12px; }
        .stars-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 0.5px solid #e8d496; font-size: 14px; }
        .stars-row:last-child { border-bottom: 0; }
        .stars-row .stars { color: #b8860b; letter-spacing: 2px; font-size: 14px; }
        .stars-row .meaning { color: #4b5563; }

        .what-we-dont { background: #f0f7f1; border-left: 4px solid #2d8c3e; border-radius: 8px; padding: 24px; margin: 24px 0; }
        .what-we-dont h2 { color: #2d8c3e; font-size: 24px; margin-bottom: 12px; }
        .wwd-list { list-style: none; padding: 0; margin: 0; }
        .wwd-list li { font-size: 15px; color: #1f2937; padding: 8px 0 8px 28px; position: relative; line-height: 1.5; }
        .wwd-list li:before { content: '✗'; position: absolute; left: 0; top: 8px; color: #b91c1c; font-weight: 700; font-size: 16px; }

        .framing { background: #f9f6f0; border: 1px solid #e5e0d5; border-radius: 8px; padding: 28px; margin: 32px 0; text-align: center; }
        .framing-quote { font-size: 18px; color: #111; line-height: 1.6; font-weight: 600; }
        .framing-attr { font-size: 13px; color: #6b7280; margin-top: 12px; }

        .disclaimer-block { background: #fafafa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-top: 32px; font-size: 13px; color: #6b7280; line-height: 1.6; }
        .disclaimer-block strong { color: #111; }
        .disclaimer-block a { color: #b8860b; }

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
        <p>We find mathematical edges in betting markets using algorithms, then explain them in plain English. The math does the heavy lifting; we just translate.</p>
      </div>

      <section className="hiw-section">
        <div className="h2-sub">The Daily Rhythm</div>
        <h2>When picks drop, and how often they refresh</h2>
        <p>Every day, our system scans every game across the leagues we cover. Picks publish in two waves depending on how volatile the sport is, and refresh as game time approaches.</p>

        <div className="rhythm-stack">
          <div className="rhythm-card">
            <div className="rhythm-time">10 PM ET — Night Before</div>
            <div className="rhythm-title">Stable sports drop early</div>
            <div className="rhythm-desc">NFL, college football, MLS, EPL, Champions League, UFC. These typically have settled rosters by evening, so picks publish the night before.</div>
          </div>
          <div className="rhythm-card">
            <div className="rhythm-time">6 AM ET — Same Day</div>
            <div className="rhythm-title">Volatile sports drop morning of</div>
            <div className="rhythm-desc">MLB, NBA, NHL, college basketball. Pitcher confirmations, injury reports, and lineup scratches change overnight, so we wait for the latest data.</div>
          </div>
          <div className="rhythm-card">
            <div className="rhythm-time">~2 Hours Pre-Game</div>
            <div className="rhythm-title">Lines refresh, EV recalculates</div>
            <div className="rhythm-desc">Sportsbook lines move all day. We pull the current line for every game right before tipoff and update the expected value on each pick.</div>
          </div>
          <div className="rhythm-card future">
            <div className="rhythm-time">Coming Soon</div>
            <div className="rhythm-title">Daily email + live X/Twitter</div>
            <div className="rhythm-desc">A morning "State of Play" email lands in your inbox before coffee. Our Twitter account posts the parlay of the day, individual picks, and refresh alerts as lines move.</div>
          </div>
        </div>
      </section>

      <section className="hiw-section">
        <div className="h2-sub">Our Process</div>
        <h2>How a pick gets made</h2>
        <p>Each game runs through five steps before anything appears on the site. The whole process is automated end-to-end, with the math driving every call.</p>

        <div className="steps">
          <div className="step-row">
            <div className="step-num">01</div>
            <div className="step-content">
              <h3>Scan every game</h3>
              <p>We pull schedules, stats, injuries, and odds across every game in every league we cover. That's hundreds of games on a peak day.</p>
            </div>
          </div>
          <div className="step-row">
            <div className="step-num">02</div>
            <div className="step-content">
              <h3>Calculate true odds</h3>
              <p>For each game, our model calculates what the odds <em>should</em> be based on team strength, situational factors, and recent performance. We strip out the sportsbook's vig to get a fair-odds baseline.</p>
            </div>
          </div>
          <div className="step-row">
            <div className="step-num">03</div>
            <div className="step-content">
              <h3>Identify edges</h3>
              <p>If the sportsbook's line is meaningfully different from our true-odds calculation, that's an edge. We only flag bets where the expected value clears a strict threshold.</p>
            </div>
          </div>
          <div className="step-row">
            <div className="step-num">04</div>
            <div className="step-content">
              <h3>Score confidence</h3>
              <p>Not every edge is created equal. We weight things like edge size, line movement direction, key player availability, and historical accuracy of similar setups. The result is a 1-5 star rating you'll see on every pick.</p>
            </div>
          </div>
          <div className="step-row">
            <div className="step-num">05</div>
            <div className="step-content">
              <h3>Publish in plain English</h3>
              <p>The math is the hard part. The output is short, readable, and explains the situational angle, the statistical mismatch, and what the market is missing.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="hiw-section">
        <div className="h2-sub">Confidence Stars</div>
        <h2>What the stars actually mean</h2>
        <p>The 1-5 star rating on every pick isn't subjective. It's calculated from a handful of factors that boost or reduce our confidence in the underlying math.</p>

        <div className="confidence-grid">
          <div className="conf-card boost">
            <div className="conf-label">↑ Boosts</div>
            <div className="conf-text">Larger edge, sharp money signal (line moves opposite of public betting), historically reliable setup, key players confirmed active.</div>
          </div>
          <div className="conf-card penalty">
            <div className="conf-label">↓ Reduces</div>
            <div className="conf-text">Smaller edge, line moving against our pick, star player questionable or out, recent variance against similar setups.</div>
          </div>
        </div>

        <p>Higher stars don't mean a pick is "safe." Betting always involves variance. They mean we have more confidence in the underlying math.</p>

        <div className="stars-reality">
          <div className="stars-reality-title">A reality check</div>
          <div className="stars-row">
            <span className="stars">★★★★★</span>
            <span className="meaning">Strongest edge with multiple confirming signals</span>
          </div>
          <div className="stars-row">
            <span className="stars">★★★★☆</span>
            <span className="meaning">Solid edge with mostly favorable factors</span>
          </div>
          <div className="stars-row">
            <span className="stars">★★★☆☆</span>
            <span className="meaning">Real edge with mixed signals</span>
          </div>
          <div className="stars-row">
            <span className="stars">★★☆☆☆</span>
            <span className="meaning">Modest edge with more variance expected</span>
          </div>
          <div className="stars-row">
            <span className="stars">★☆☆☆☆</span>
            <span className="meaning">Marginal edge, included for transparency</span>
          </div>
        </div>

        <p>A 5-star pick can still lose. A 2-star pick is a tighter edge with thinner margin for error. <strong>The star rating is information about the math, not a recommendation.</strong></p>
      </section>

      <section className="hiw-section">
        <div className="what-we-dont">
          <h2>What we don't do</h2>
          <ul className="wwd-list">
            <li><strong>Hype language.</strong> You won't see "lock of the day" or guaranteed winners. Every pick has variance built in.</li>
            <li><strong>Human handicappers.</strong> The site is driven by artificial intelligence.</li>
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