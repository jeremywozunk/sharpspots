import client from './contentful';
import Link from 'next/link';

interface GamePick {
  sys: { id: string };
  fields: {
    title: string;
    slug: string;
    league: string;
    teams: string;
    playToLine: string;
    evPercentage: string;
    gameDate: string;
    confidenceScore: number;
    analysisParagraph1: any;
  };
}

function StarRating({ score }: { score: number }) {
  return (
    <div style={{ color: 'var(--gold)', fontSize: 14, letterSpacing: 3 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= score ? 'var(--gold)' : 'var(--star-empty)' }}>
          ★
        </span>
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
    'fields.status': 'live',
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
        .hero { padding: 80px 48px 64px; border-bottom: 1px solid var(--border-subtle); text-align: center; }
        .hero h1 { font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 44px; line-height: 1.18; margin-bottom: 18px; color: var(--fg); }
        .hero h1 em { font-style: italic; color: var(--jade); }
        .hero p { font-family: var(--font-ui); font-size: 14px; color: var(--gray-muted); line-height: 1.65; letter-spacing: 0.02em; max-width: 540px; margin: 0 auto; }

        .section-header { display: flex; flex-direction: column; align-items: center; padding: 40px 48px 24px; gap: 18px; }
        .section-label { font-family: var(--font-ui); font-size: 11px; font-weight: 600; letter-spacing: 0.18em; color: var(--gray-muted); text-transform: uppercase; }
        .parlay-btn { font-family: var(--font-ui); font-size: 11px; font-weight: 600; color: var(--gold); background: transparent; border: 1px dashed var(--gold); border-radius: 0; padding: 12px 28px; cursor: pointer; text-decoration: none; white-space: nowrap; letter-spacing: 0.12em; text-transform: uppercase; transition: background 0.15s; }
        .parlay-btn:hover { background: rgba(212, 175, 55, 0.08); }

        .card-list { padding: 0 48px; }

        .card { padding: 28px 0; border-bottom: 1px solid var(--border-subtle); border-left: 1px solid var(--jade); padding-left: 28px; display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; cursor: pointer; transition: background 0.2s; text-decoration: none; color: inherit; margin-bottom: 0; }
        .card:hover { background: rgba(74, 222, 128, 0.04); }
        .card-left { flex: 1; min-width: 0; }
        .edge-no { font-family: var(--font-ui); font-size: 10px; font-weight: 600; color: var(--jade); text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 10px; }
        .card-league { font-family: var(--font-ui); font-size: 10px; font-weight: 600; color: var(--gray-muted); text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 4px; }
        .card-title { font-family: var(--font-display); font-style: italic; font-weight: 700; font-size: 22px; line-height: 1.22; margin-bottom: 12px; color: var(--fg); }
        .card-teaser { font-family: var(--font-prose); font-size: 13px; color: var(--gray-muted); line-height: 1.6; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .play-stripe { display: inline-block; font-family: var(--font-ui); font-size: 10px; font-weight: 600; color: var(--jade); border-top: 2px solid var(--jade); border-bottom: 2px solid var(--jade); padding: 6px 14px; letter-spacing: 0.1em; text-transform: uppercase; }
        .card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; flex-shrink: 0; }
        .ev-badge { background: transparent; color: var(--jade); font-family: var(--font-ui); font-size: 11px; font-weight: 600; padding: 5px 12px; border-radius: 0; border: 1px solid var(--jade); white-space: nowrap; letter-spacing: 0.08em; text-transform: uppercase; }
        .view-link { font-family: var(--font-ui); font-size: 11px; color: var(--gold); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 500; }

        .empty { padding: 48px; font-family: var(--font-prose); font-style: italic; color: var(--gray-muted); font-size: 15px; text-align: center; }

        .hiw { padding: 80px 48px; background: var(--bg-2); border-top: 1px solid var(--border-subtle); margin-top: 60px; }
        .hiw-title { font-family: var(--font-display); font-style: italic; font-weight: 700; font-size: 28px; margin-bottom: 36px; color: var(--fg); text-align: center; }
        .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1100px; margin: 0 auto; }
        .step { background: var(--bg); border: 1px solid var(--border-subtle); border-top: 2px solid var(--jade); padding: 32px 28px; }
        .step-num { font-family: var(--font-brand); font-size: 22px; color: var(--jade); margin-bottom: 14px; letter-spacing: 0.12em; }
        .step-text { font-family: var(--font-prose); font-size: 14px; color: var(--fg); line-height: 1.65; }

        @media (max-width: 768px) {
          .hero { padding: 52px 20px 40px; }
          .hero h1 { font-size: 30px; }
          .hero p { font-size: 13px; }
          .section-header { padding: 28px 20px 16px; }
          .card-list { padding: 0 20px; }
          .card { padding: 22px 0 22px 18px; flex-direction: column; gap: 14px; }
          .card-title { font-size: 19px; }
          .card-teaser { display: none; }
          .card-right { align-items: flex-start; flex-direction: row; flex-wrap: wrap; gap: 10px; }
          .hiw { padding: 56px 20px; }
          .hiw-title { font-size: 22px; }
          .steps { grid-template-columns: 1fr; gap: 18px; }
        }
      `}</style>

      <div className="hero">
        <h1>
          Smarter bets, backed by <em>real math.</em>
          <br />
          Updated every morning.
        </h1>
        <p>Algorithmic edge detection across the major leagues — three independent pillars, fully explained, transparent track record.</p>
      </div>

      <div className="section-header">
        <div className="section-label">Today's Top Picks</div>
        <Link className="parlay-btn" href="/parlay">
          ◇ Parlay of the Day
        </Link>
      </div>

      <div className="card-list">
        