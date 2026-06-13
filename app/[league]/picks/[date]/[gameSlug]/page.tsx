import { createClient } from 'contentful';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
});

const SITE_URL = 'https://sharpspots.vercel.app';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ league: string; date: string; gameSlug: string; }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { gameSlug, league, date } = await params;
  const entries = await client.getEntries({
    content_type: 'gamePick',
    'fields.slug': gameSlug,
    'fields.league': league.toLowerCase(),
    limit: 1,
  });
  if (entries.items.length === 0) return { title: 'Pick Not Found | SharpSpots' };
  const pick = entries.items[0].fields as any;
  const canonicalUrl = `${SITE_URL}/${league}/picks/${date}/${gameSlug}`;
  return {
    title: `${pick.title} | SharpSpots`,
    description: pick.metaDescription || `${pick.evPercentage} edge on ${pick.playToLine}.`,
    alternates: { canonical: canonicalUrl },
  };
}

export default async function GamePage({ params }: PageProps) {
  const { league, date, gameSlug } = await params;
  const entries = await client.getEntries({
    content_type: 'gamePick',
    'fields.slug': gameSlug,
    'fields.league': league.toLowerCase(),
    limit: 1,
  });
  if (entries.items.length === 0) notFound();
  const pick = entries.items[0].fields as any;

  // Use tipoffIso (full datetime, populated since May 22, 2026) for accurate
  // ET-local display. Fall back to gameDate parsed at noon ET so the date
  // doesn't UTC-shift back a day (off-by-one bug when gameDate is plain
  // YYYY-MM-DD — JS parses it as UTC midnight, which is the previous day
  // in any westward timezone).
  const gameInstant = pick.tipoffIso
    ? new Date(pick.tipoffIso)
    : new Date(`${pick.gameDate}T12:00:00-04:00`);
  const dateDisplay = gameInstant.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' });
  const timeDisplay = gameInstant.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York', timeZoneName: 'short' });
  const score = pick.confidenceScore || 0;

  return (
    <>
      <style>{`
        .pick-main { max-width: 760px; margin: 0 auto; padding: 48px 24px 24px; }
        .breadcrumb { font-size: 11px; color: var(--gray-muted); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 32px; }
        .breadcrumb a { color: var(--gray-muted); }
        .breadcrumb a:hover { color: var(--jade); }
        .breadcrumb .crumb-current { color: var(--fg); }
        .pick-header { border-bottom: 1px solid var(--border-subtle); padding-bottom: 28px; margin-bottom: 36px; }
        .pick-meta { font-size: 11px; color: var(--gold); font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 14px; }
        .pick-h1 { font-family: var(--font-display); font-style: italic; font-weight: 900; font-size: 38px; line-height: 1.15; margin: 0 0 22px 0; color: var(--fg); }
        .pick-badges { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
        .pick-ev-pill { border: 1px solid var(--jade); color: var(--jade); padding: 7px 14px; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
        .pick-stars { color: var(--gold); font-size: 18px; letter-spacing: 4px; }
        .pick-stars-empty { color: var(--star-empty); }
        .pick-play-tag { background: var(--bg-2); border: 1px solid var(--gray-border); color: var(--fg); padding: 7px 14px; font-size: 12px; font-weight: 500; }
        .pick-card { background: var(--bg-2); border: 1px solid var(--jade); padding: 28px; margin-bottom: 36px; }
        .pick-card-label { font-size: 10px; color: var(--jade); font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 10px; }
        .pick-play-stripe { font-weight: 600; font-size: 16px; color: var(--jade); border-top: 2px solid var(--jade); border-bottom: 2px solid var(--jade); padding: 10px 0; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 24px; display: inline-block; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 18px; }
        .metric-label { color: var(--gray-muted); font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 6px; }
        .metric-value { font-family: var(--font-display); font-weight: 700; font-size: 22px; color: var(--fg); }
        .pick-prose { font-family: var(--font-prose); font-size: 16px; line-height: 1.75; color: var(--fg); }
        .pick-prose p { margin: 0 0 22px 0; }
        .pick-footer { border-top: 1px solid var(--border-subtle); padding-top: 28px; margin-top: 48px; font-size: 12px; color: var(--gray-muted); line-height: 1.65; }
        .pick-footer strong { color: var(--fg); }
        .pick-footer a { color: var(--gold); }
        @media (max-width: 768px) {
          .pick-main { padding: 28px 20px 24px; }
          .pick-h1 { font-size: 28px; }
          .pick-card { padding: 22px 20px; }
          .metric-value { font-size: 19px; }
          .pick-prose { font-size: 14px; }
          /* Fix #4: reliable 2-col metric grid (auto-fit minmax collapsed to 1). */
          .metric-grid { grid-template-columns: repeat(2, 1fr); gap: 14px 18px; }
        }
      `}</style>

      <main className="pick-main">
        <nav className="breadcrumb">
          <Link href="/">Home</Link>
          {' / '}
          <Link href={`/${league}`}>{pick.league}</Link>
          {' / '}
          <span>{dateDisplay}</span>
          {' / '}
          <span className="crumb-current">{pick.teams || ''}</span>
        </nav>

        <header className="pick-header">
          <div className="pick-meta">{pick.league} - {dateDisplay} - {timeDisplay}</div>
          <h1 className="pick-h1">{pick.title}</h1>
          {pick.pageType === 'pick' ? (
            <div className="pick-badges">
              <span className="pick-ev-pill">{pick.evPercentage} EV</span>
              <span className="pick-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < score ? '' : 'pick-stars-empty'}>★</span>
                ))}
              </span>
              <span className="pick-play-tag">{pick.playToLine}</span>
            </div>
          ) : (
            <div className="pick-badges">
              <span className="pick-play-tag" style={{ borderColor: 'var(--gray-muted)', color: 'var(--gray-muted)' }}>No Edge — Market Priced Fairly</span>
            </div>
          )}
        </header>

        {pick.pageType === 'pick' && (
          <section className="pick-card">
            <div className="pick-card-label">The Pick</div>
            <div className="pick-play-stripe">{pick.playToLine}</div>
            <div className="metric-grid">
              <div>
                <div className="metric-label">Expected Value</div>
                <div className="metric-value">{pick.evPercentage}</div>
              </div>
              <div>
                <div className="metric-label">Fair Odds</div>
                <div className="metric-value">{pick.fairOdds}</div>
              </div>
              <div>
                <div className="metric-label">Market Odds</div>
                <div className="metric-value">{pick.marketOdds}</div>
              </div>
              <div>
                <div className="metric-label">Sportsbook</div>
                <div className="metric-value">{pick.sportsbook}</div>
              </div>
            </div>
          </section>
        )}

        <article className="pick-prose">
          {pick.analysisParagraph1 && documentToReactComponents(pick.analysisParagraph1)}
          {pick.analysisParagraph2 && documentToReactComponents(pick.analysisParagraph2)}
        </article>

        <footer className="pick-footer">
          <p style={{ marginBottom: 12 }}>
            <strong>Disclaimer:</strong> This analysis is educational. Past performance does not guarantee future results. 21+ only.
          </p>
          <p>
            Problem gambling? Call <strong>1-800-GAMBLER</strong> or visit <a href="https://www.ncpg.org">ncpg.org</a>.
          </p>
        </footer>
      </main>
    </>
  );
}
