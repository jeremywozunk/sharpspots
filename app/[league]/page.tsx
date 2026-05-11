import { createClient } from 'contentful';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
});

const SITE_URL = 'https://sharpspots.vercel.app';

const ALLOWED_LEAGUES: Record<string, string> = {
  'nba': 'NBA',
  'mlb': 'MLB',
  'nfl': 'NFL',
  'nhl': 'NHL',
  'mls': 'MLS',
  'epl': 'EPL',
  'ufc': 'UFC',
  'champions-league': 'Champions League',
  'college-basketball': 'College Basketball',
  'college-football': 'College Football',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ league: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { league } = await params;
  const leagueDisplay = ALLOWED_LEAGUES[league.toLowerCase()];
  if (!leagueDisplay) return { title: 'League Not Found | SharpSpots' };

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York',
  });

  return {
    title: `Best ${leagueDisplay} Picks Today | +EV Analysis | SharpSpots`,
    description: `Today's data-driven ${leagueDisplay} betting picks (${today}).`,
    alternates: { canonical: `${SITE_URL}/${league.toLowerCase()}` },
  };
}

function StarRating({ score }: { score: number }) {
  return (
    <div style={{ color: 'var(--gold)', fontSize: 14, letterSpacing: 3 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= score ? 'var(--gold)' : 'var(--star-empty)' }}>★</span>
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

function buildGameUrl(pick: any, leagueSlug: string): string {
  const date = new Date(pick.fields.gameDate);
  const dateStr = date.toISOString().split('T')[0];
  return `/${leagueSlug}/picks/${dateStr}/${pick.fields.slug}`;
}

function getGameTimeDisplay(gameDate: string): string {
  if (!gameDate) return '';
  return new Date(gameDate).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York', timeZoneName: 'short',
  });
}

export default async function LeaguePage({ params }: PageProps) {
  const { league } = await params;
  const leagueSlug = league.toLowerCase();
  const leagueDisplay = ALLOWED_LEAGUES[leagueSlug];
  if (!leagueDisplay) notFound();

  const now = new Date();
  const etDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const startOfDay = new Date(etDate.getFullYear(), etDate.getMonth(), etDate.getDate(), 0, 0, 0);
  const endOfDay = new Date(etDate.getFullYear(), etDate.getMonth(), etDate.getDate(), 23, 59, 59);

  const entries = await client.getEntries({
    content_type: 'gamePick',
    'fields.league': leagueDisplay,
    'fields.status': 'live',
    'fields.gameDate[gte]': startOfDay.toISOString(),
    'fields.gameDate[lte]': endOfDay.toISOString(),
    order: ['fields.gameDate'],
  });

  const picks = entries.items;
  const todayDisplay = etDate.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <>
      <style>{`
        .league-header { padding: 64px 48px 40px; border-bottom: 1px solid var(--border-subtle); }
        .league-eyebrow { font-size: 11px; color: var(--gold); font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 12px; }
        .league-h1 { font-family: var(--font-brand); font-weight: 400; font-size: 64px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--jade); line-height: 1; margin-bottom: 12px; }
        .league-sub { font-size: 13px; color: var(--gray-muted); letter-spacing: 0.04em; }
        .empty-state { padding: 100px 48px; text-align: center; color: var(--gray-muted); font-family: var(--font-display); font-style: italic; font-size: 20px; line-height: 1.5; }
        .card-list { padding: 0 48px; }
        .card { padding: 28px 0 28px 28px; border-bottom: 1px solid var(--border-subtle); border-left: 1px solid var(--jade); display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; color: inherit; }
        .card:hover { background: rgba(74, 222, 128, 0.04); }
        .card-left { flex: 1; min-width: 0; }
        .edge-no { font-size: 10px; font-weight: 600; color: var(--jade); text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 10px; }
        .card-time { font-size: 10px; font-weight: 600; color: var(--gray-muted); text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 4px; }
        .card-title { font-family: var(--font-display); font-style: italic; font-weight: 700; font-size: 22px; line-height: 1.22; margin-bottom: 12px; color: var(--fg); }
        .card-teaser { font-family: var(--font-prose); font-size: 13px; color: var(--gray-muted); line-height: 1.6; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .card-play { display: inline-block; font-size: 10px; font-weight: 600; color: var(--jade); border-top: 2px solid var(--jade); border-bottom: 2px solid var(--jade); padding: 6px 14px; letter-spacing: 0.1em; text-transform: uppercase; }
        .card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; flex-shrink: 0; }
        .ev-badge { color: var(--jade); font-size: 11px; font-weight: 600; padding: 5px 12px; border: 1px solid var(--jade); white-space: nowrap; letter-spacing: 0.08em; text-transform: uppercase; }
        .view-link { font-size: 11px; color: var(--gold); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 500; }
        @media (max-width: 768px) {
          .league-header { padding: 40px 20px 24px; }
          .league-h1 { font-size: 44px; }
          .card-list { padding: 0 20px; }
          .card { padding: 22px 0 22px 18px; flex-direction: column; gap: 14px; }
          .card-teaser { display: none; }
          .card-title { font-size: 19px; }
          .card-right { align-items: flex-start; flex-direction: row; flex-wrap: wrap; gap: 10px; }
          .empty-state { padding: 80px 20px; font-size: 17px; }
        }
      `}</style>

      <div className="league-header">
        <div className="league-eyebrow">Today&apos;s Picks</div>
        <h1 className="league-h1">{leagueDisplay}</h1>
        <div className="league-sub">{todayDisplay}</div>
      </div>

      {picks.length === 0 && (
        <div className="empty-state">
          No {leagueDisplay} picks available today. Check back tomorrow morning.
        </div>
      )}

      <div className="card-list">
        {picks.map((pick: any, idx: number) => (
          <Link key={pick.sys.id} href={buildGameUrl(pick, leagueSlug)} className="card">
            <div className="card-left">
              <div className="edge-no">Edge No. {String(idx + 1).padStart(3, '0')}</div>
              <div className="card-time">{getGameTimeDisplay(pick.fields.gameDate)}</div>
              <div className="card-title">{(pick.fields as any).title}</div>
              {(pick.fields as any).analysisParagraph1 && (
                <div className="card-teaser">{getTeaserFromRichText((pick.fields as any).analysisParagraph1)}</div>
              )}
              <span className="card-play">{(pick.fields as any).playToLine}</span>
            </div>
            <div className="card-right">
              <span className="ev-badge">{(pick.fields as any).evPercentage} EV</span>
              <StarRating score={(pick.fields as any).confidenceScore} />
              <span className="view-link">View Analysis</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
