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

  if (!leagueDisplay) {
    return { title: 'League Not Found | SharpSpots' };
  }

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York',
  });

  return {
    title: `Best ${leagueDisplay} Picks Today | +EV Analysis | SharpSpots`,
    description: `Today's data-driven ${leagueDisplay} betting picks (${today}). Mathematical edges, expected value, and best bets for every game.`,
    alternates: {
      canonical: `${SITE_URL}/${league.toLowerCase()}`,
    },
    openGraph: {
      title: `Best ${leagueDisplay} Picks Today | SharpSpots`,
      description: `Today's data-driven ${leagueDisplay} betting picks. Mathematical edges and best bets.`,
      url: `${SITE_URL}/${league.toLowerCase()}`,
      siteName: 'SharpSpots',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Best ${leagueDisplay} Picks Today | SharpSpots`,
      description: `Today's data-driven ${leagueDisplay} betting picks. Mathematical edges and best bets.`,
    },
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

function buildGameUrl(pick: any, leagueSlug: string): string {
  const date = new Date(pick.fields.gameDate);
  const dateStr = date.toISOString().split('T')[0];
  return `/${leagueSlug}/picks/${dateStr}/${pick.fields.slug}`;
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

export default async function LeaguePage({ params }: PageProps) {
  const { league } = await params;
  const leagueSlug = league.toLowerCase();
  const leagueDisplay = ALLOWED_LEAGUES[leagueSlug];

  if (!leagueDisplay) {
    notFound();
  }

  const now = new Date();
  const etDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const startOfDay = new Date(etDate.getFullYear(), etDate.getMonth(), etDate.getDate(), 0, 0, 0);
  const endOfDay = new Date(etDate.getFullYear(), etDate.getMonth(), etDate.getDate(), 23, 59, 59);

  const entries = await client.getEntries({
    content_type: 'gamePick',
    'fields.league': leagueDisplay,
    'fields.status': 'published',
    'fields.gameDate[gte]': startOfDay.toISOString(),
    'fields.gameDate[lte]': endOfDay.toISOString(),
    order: ['fields.gameDate'],
  });

  const picks = entries.items;

  const todayDisplay = etDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <style>{`
        .league-header { padding: 48px 48px 32px; border-bottom: 1px solid #e5e7eb; }
        .league-eyebrow { font-size: 13px; color: #b8860b; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
        .league-h1 { font-family: 'Barlow Condensed', Arial Black, sans-serif; font-weight: 800; font-size: 56px; text-transform: uppercase; letter-spacing: 2px; color: #2d8c3e; line-height: 1; margin-bottom: 8px; }
        .league-sub { font-size: 16px; color: #6b7280; }

        .empty-state { padding: 80px 48px; text-align: center; color: #111; font-size: 22px; font-weight: 700; line-height: 1.5; }

        .card { padding: 20px 48px 20px 44px; border-bottom: 0.5px solid #e5e7eb; border-left: 4px solid #2d8c3e; display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; cursor: pointer; transition: background 0.15s; text-decoration: none; color: inherit; }
        .card:hover { background: #f9fafb; }
        .card-left { flex: 1; min-width: 0; }
        .card-time { font-size: 11px; font-weight: 700; color: #2d8c3e; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
        .card-title { font-size: 17px; font-weight: 600; margin-bottom: 6px; }
        .card-teaser { font-size: 13px; color: #6b7280; line-height: 1.5; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .card-play { display: inline-block; font-size: 11px; font-weight: 700; color: #1a6b2a; background: #f0faf2; border: 0.5px solid #a8d8b0; border-radius: 20px; padding: 2px 10px; }
        .card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
        .ev-badge { background: #f0faf2; color: #1a6b2a; font-size: 13px; font-weight: 600; padding: 4px 12px; border-radius: 20px; border: 0.5px solid #a8d8b0; white-space: nowrap; }
        .view-link { font-size: 13px; color: #b8860b; }

        @media (max-width: 768px) {
          .league-header { padding: 32px 20px 20px; }
          .league-h1 { font-size: 40px; }
          .card { padding: 16px 20px 16px 16px; flex-direction: column; gap: 12px; }
          .card-right { align-items: flex-start; flex-direction: row; flex-wrap: wrap; gap: 10px; }
          .empty-state { padding: 60px 20px; font-size: 18px; }
        }
      `}</style>

      <div className="league-header">
        <div className="league-eyebrow">Today's Picks</div>
        <h1 className="league-h1">{leagueDisplay}</h1>
        <div className="league-sub">{todayDisplay}</div>
      </div>

      {picks.length === 0 && (
        <div className="empty-state">
          No {leagueDisplay} picks available today. Check back tomorrow morning.
        </div>
      )}

      {picks.map((pick: any) => (
        <Link key={pick.sys.id} href={buildGameUrl(pick, leagueSlug)} className="card">
          <div className="card-left">
            <div className="card-time">{getGameTimeDisplay(pick.fields.gameDate)}</div>
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
    </>
  );
}