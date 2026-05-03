import client from './contentful';

interface GamePick {
  sys: { id: string };
  fields: {
    title: string;
    league: string;
    recommended_play: string;
    line: string;
    ev_percentage: string;
    game_time: string;
    confidenceScore: number;
    analysis_para_1: string;
  };
}

function StarRating({ score }: { score: number }) {
  return (
    <div style={{ color: '#b8860b', fontSize: 16, letterSpacing: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= score ? '#b8860b' : '#d1d5db' }}>★</span>
      ))}
    </div>
  );
}

function getTeaser(text: string): string {
  if (!text) return '';
  const sentences = text.split('. ');
  return sentences[0] + (sentences.length > 1 ? '.' : '');
}

async function getTopPicks(): Promise<GamePick[]> {
  const res = await client.getEntries({
    content_type: 'gamePick',
    'fields.status': 'published',
    order: ['-fields.confidenceScore'],
    limit: 5,
  });
  return res.items as unknown as GamePick[];
}

export default async function Home() {
  const picks = await getTopPicks();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: system-ui, -apple-system, sans-serif; background: #fff; color: #111; }

        .topbar { height: 5px; background: linear-gradient(to right, #2d8c3e 50%, #b8860b 50%); }

        .nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 48px; border-bottom: 1px solid #e5e7eb; position: relative; }
        .logo { display: flex; flex-direction: column; line-height: 0.88; font-family: 'Barlow Condensed', Arial Black, sans-serif; font-weight: 800; font-size: 72px; text-transform: uppercase; letter-spacing: 2px; }
        .logo .sharp { color: #2d8c3e; }
        .logo .spots { color: #b8860b; }
        .nav-links { display: flex; gap: 36px; align-items: center; }
        .nav-links a { font-size: 16px; color: #111; text-decoration: none; font-weight: 700; }
        .sports-btn { font-size: 16px; color: #111; background: none; border: none; cursor: pointer; font-family: system-ui; font-weight: 700; padding: 0; }
        .sports-btn:after { content: ' ▾'; font-size: 12px; }

        .hero { padding: 64px 48px 56px; border-bottom: 1px solid #e5e0d5; text-align: center; background: #f9f6f0; }
        .hero h1 { font-size: 36px; font-weight: 500; line-height: 1.35; margin-bottom: 14px; color: #111; }
        .hero h1 em { font-style: normal; color: #2d8c3e; }
        .hero p { font-size: 16px; color: #6b7280; line-height: 1.6; }

        .section-header { display: flex; flex-direction: column; align-items: center; padding: 28px 48px 16px; gap: 16px; }
        .section-label { font-size: 12px; font-weight: 700; letter-spacing: 0.1em; color: #9ca3af; text-transform: uppercase; }
        .parlay-btn { font-size: 16px; font-weight: 700; color: #b8860b; background: #fdf8ee; border: 1.5px solid #d4aa50; border-radius: 30px; padding: 12px 32px; cursor: pointer; text-decoration: none; white-space: nowrap; }

        .card { padding: 20px 48px 20px 44px; border-bottom: 0.5px solid #e5e7eb; border-left: 4px solid #2d8c3e; display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; cursor: pointer; transition: background 0.15s; }
        .card:hover { background: #f9fafb; }
        .card-left { flex: 1; min-width: 0; }
        .card-league { font-size: 11px; font-weight: 700; color: #2d8c3e; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
        .card-title { font-size: 17px; font-weight: 600; margin-bottom: 6px; }
        .card-teaser { font-size: 13px; color: #6b7280; line-height: 1.5; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .card-play { display: inline-block; font-size: 11px; font-weight: 700; color: #1a6b2a; background: #f0faf2; border: 0.5px solid #a8d8b0; border-radius: 20px; padding: 2px 10px; }
        .card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
        .ev-badge { background: #f0faf2; color: #1a6b2a; font-size: 13px; font-weight: 600; padding: 4px 12px; border-radius: 20px; border: 0.5px solid #a8d8b0; white-space: nowrap; }
        .view-link { font-size: 13px; color: #b8860b; }

        .hiw { padding: 48px; background: #f9f6f0; border-top: 1px solid #e5e0d5; }
        .hiw-title { font-size: 20px; font-weight: 600; margin-bottom: 28px; color: #111; }
        .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .step { background: #fff; border: 0.5px solid #e5e0d5; border-radius: 10px; padding: 24px; border-top: 3px solid #2d8c3e; }
        .step-num { font-size: 13px; font-weight: 700; color: #2d8c3e; margin-bottom: 8px; }
        .step-text { font-size: 15px; color: #374151; line-height: 1.6; }

        .footer { padding: 20px 48px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .footer-links { display: flex; gap: 24px; flex-wrap: wrap; }
        .footer-links a { font-size: 12px; color: #9ca3af; text-decoration: none; }
        .footer-disc { font-size: 11px; color: #9ca3af; }

        @media (max-width: 768px) {
          .nav { padding: 16px 20px; }
          .logo { font-size: 48px; }
          .nav-links { gap: 20px; }
          .nav-links a { font-size: 14px; }
          .sports-btn { font-size: 14px; }
          .hero { padding: 40px 20px; }
          .hero h1 { font-size: 26px; }
          .hero p { font-size: 15px; }
          .section-header { padding: 20px 20px 12px; }
          .card { padding: 16px 20px 16px 16px; flex-direction: column; gap: 12px; }
          .card-right { align-items: flex-start; flex-direction: row; flex-wrap: wrap; gap: 10px; }
          .hiw { padding: 32px 20px; }
          .steps { grid-template-columns: 1fr; }
          .footer { padding: 16px 20px; }
          .footer-links { gap: 16px; }
        }
      `}</style>

      <div className="topbar" />

      <nav className="nav">
        <div className="logo">
          <span className="sharp">SHARP</span>
          <span className="spots">SPOTS</span>
        </div>
        <div className="nav-links">
          <button className="sports-btn">Sports</button>
          <a href="/how-it-works">How It Works</a>
          <a href="/blog">Blog</a>
        </div>
      </nav>

      <div className="hero">
        <h1>Smarter bets, backed by <em>real math</em>.<br />Updated every morning.</h1>
        <p>Algorithmic edge detection across 7 major leagues, explained simply.</p>
      </div>

      <div className="section-header">
        <div className="section-label">Today's Top Picks</div>
        <a className="parlay-btn" href="/parlay">🎯 Parlay of the Day</a>
      </div>

      {picks.length === 0 && (
        <div style={{ padding: '24px 48px', color: '#6b7280', fontSize: 14 }}>
          No picks available today. Check back tomorrow morning.
        </div>
      )}

      {picks.map((pick) => (
        <div key={pick.sys.id} className="card">
          <div className="card-left">
            <div className="card-league">{pick.fields.league} · {pick.fields.game_time}</div>
            <div className="card-title">{pick.fields.title}</div>
            {pick.fields.analysis_para_1 && (
              <div className="card-teaser">{getTeaser(pick.fields.analysis_para_1)}</div>
            )}
            <span className="card-play">{pick.fields.recommended_play} {pick.fields.line}</span>
          </div>
          <div className="card-right">
            <span className="ev-badge">+{pick.fields.ev_percentage} EV</span>
            <StarRating score={pick.fields.confidenceScore} />
            <span className="view-link">View Analysis →</span>
          </div>
        </div>
      ))}

      <div className="hiw">
        <div className="hiw-title">How SharpSpots works</div>
        <div className="steps">
          <div className="step">
            <div className="step-num">01</div>
            <div className="step-text">We scan every game across all major leagues daily</div>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <div className="step-text">Our model combines AI-driven quantitative and qualitative analysis to calculate where the sportsbook is mispriced</div>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <div className="step-text">You get the edge, explained in plain language</div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-links">
          <a href="/sports">Sports</a>
          <a href="/how-it-works">How It Works</a>
          <a href="/blog">Blog</a>
          <a href="/responsible-gambling">Responsible Gambling</a>
        </div>
        <div className="footer-disc">21+ only. Bet responsibly.</div>
      </footer>
    </>
  );
}