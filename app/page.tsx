import client from './contentful';
import Link from 'next/link';

interface GamePick {
  sys: { id: string };
  fields: {
    title: string;
    slug: string;
    league: string;
    teams: string[];
    playToLine: string;
    evPercentage: string;
    gameDate: string;
    confidenceScore: number;
    analysisParagraph1: any;
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

function getTeaserFromRichText(richText: any): string {
  if (!richText?.content) return '';
  const firstParagraph = richText.content.find((node: any) => node.nodeType === 'paragraph');
  if (!firstParagraph) return '';
  const text = firstParagraph.content
    .filter((node: any) => node.nodeType === 'text')
    .map((node: any) => node.value)
    .join('');
  const sentences = text.split('. ');
  return sentences[0] + (sentences.length > 1 ? '.' : '');
}

function buildGameUrl(pick: GamePick): string {
  const date = new Date(pick.fields.gameDate);
  const dateStr = date.toISOString().split('T')[0];
  const league = pick.fields.league.toLowerCase();
  return `/${league}/picks/${dateStr}/${pick.fields.slug}`;
}

function getGameTimeDisplay(gameDate: string): string {
  if (!gameDate) return '';
  return new Date(gameDate).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
    timeZoneName: 'short',
  });
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
        .hero { padding: 64px 48px 56px; border-bottom: 1px solid #e5e0d5; text-align: center; background: #f9f6f0; }
        .hero h1 { font-size: 36px; font-weight: 500; line-height: 1.35; margin-bottom: 14px; color: #111; }
        .hero h1 em { font-style: normal; color: #2d8c3e; }
        .hero p { font-size: 16px; color: #6b7280; line-height: 1.6; }

        .section-header { display: flex; flex-direction: column; align-items: center; padding: 28px 48px 16px; gap: 16px; }
        .section-label { font-size: 12px; font-weight: 700; letter-spacing: 0.1em; color: #9ca3af; text-transform: uppercase; }
        .parlay-btn { font-size: 16px; font-weight: 700; color: #b8860b; background: #fdf8ee; border: 1.5px solid #d4aa50; border-radius: 30px; padding: 12px 32px; cursor: pointer; text-decoration: none; white-space: nowrap; }

        .card { padding: 20px 48px 20px 44px; border-bottom: 0.5px solid #e5e7eb; border-left: 4px solid #2d8c3e; display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; cursor: pointer; transition: background 0.15s; text-decoration: none; color: inherit; }
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

        @media (max-width: 768px) {
          .hero { padding: 40px 20px; }
          .hero h1 { font-size: 26px; }
          .hero p { font-size: 15px; }
          .section-header { padding: 20px 20px 12px; }
          .card { padding: 16px 20px 16px 16px; flex-direction: column; gap: 12px; }
          .card-right { align-items: flex-start; flex-direction: row; flex-wrap: wrap; gap: 10px; }
          .hiw { padding: 32px 20px; }
          .steps { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="hero">
        <h1>Smarter bets, backed by <em>real math</em>.<br />Updated every morning.</h1>
        <p>Algorithmic edge detection across 7 major leagues, explained simply.</p>
      </div>

      <div className="section-header">
        <div className="section-label">Today's Top Picks</div>
        <Link className="parlay-btn" href="/parlay">🎯 Parlay of the Day</Link>
      </div>

      {picks.length === 0 && (
        <div style={{ padding: '24px 48px', color: '#6b7280', fontSize: 14 }}>
          No picks available today. Check back tomorrow morning.
        </div>
      )}

      {picks.map((pick) => (
        <Link key={pick.sys.id} href={buildGameUrl(pick)} className="card">
          <div className="card-left">
            <div className="card-league">{pick.fields.league} · {getGameTimeDisplay(pick.fields.gameDate)}</div>
            <div className="card-title">{pick.fields.title}</div>
            {pick.fields.analysisParagraph1 && (
              <div className="card-teaser">{getTeaserFromRichText(pick.fields.analysisParagraph1)}</div>
            )}
            <span className="card-play">{pick.fields.playToLine}</span>
          </div>
          <div className="card-right">
            <span className="ev-badge">{pick.fields.evPercentage} EV</span>
            <StarRating score={pick.fields.confidenceScore} />
            <span className="view-link">View Analysis →</span>
          </div>
        </Link>
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
    </>
  );
}