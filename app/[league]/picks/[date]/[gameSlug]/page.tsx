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
  params: Promise<{
    league: string;
    date: string;
    gameSlug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { gameSlug, league, date } = await params;

  const entries = await client.getEntries({
    content_type: 'gamePick',
    'fields.slug': gameSlug,
    'fields.league': league.toUpperCase(),
    limit: 1,
  });

  if (entries.items.length === 0) {
    return { title: 'Pick Not Found | SharpSpots' };
  }

  const pick = entries.items[0].fields as any;
  const canonicalUrl = `${SITE_URL}/${league}/picks/${date}/${gameSlug}`;
  const description = pick.metaDescription || `${pick.evPercentage} edge on ${pick.playToLine}. Data-driven betting analysis.`;

  return {
    title: `${pick.title} | SharpSpots`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pick.title,
      description,
      url: canonicalUrl,
      siteName: 'SharpSpots',
      type: 'article',
      publishedTime: pick.gameDate,
    },
    twitter: {
      card: 'summary_large_image',
      title: pick.title,
      description,
    },
  };
}

export default async function GamePage({ params }: PageProps) {
  const { league, date, gameSlug } = await params;

  const entries = await client.getEntries({
    content_type: 'gamePick',
    'fields.slug': gameSlug,
    'fields.league': league.toUpperCase(),
    limit: 1,
  });

  if (entries.items.length === 0) {
    notFound();
  }

  const pick = entries.items[0].fields as any;

  const gameDate = new Date(pick.gameDate);
  const dateDisplay = gameDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York',
  });
  const timeDisplay = gameDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
    timeZoneName: 'short',
  });

  const score = pick.confidenceScore || 0;
  const stars = '★'.repeat(score) + '☆'.repeat(5 - score);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AnalysisArticle',
    headline: pick.title,
    description: pick.metaDescription,
    datePublished: pick.gameDate,
    author: { '@type': 'Organization', name: 'SharpSpots' },
    sportEvent: {
      '@type': 'SportsEvent',
      sport: pick.league,
      league: pick.league,
      startDate: pick.gameDate,
    },
    bettingAnalysis: {
      recommendedPlay: pick.playToLine,
      expectedValue: pick.evPercentage,
      impliedOdds: pick.fairOdds,
      marketOdds: pick.marketOdds,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 20px', fontFamily: 'Georgia, serif' }}>
        <nav style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
          <Link href="/" style={{ color: '#666', textDecoration: 'none' }}>Home</Link>
          {' › '}
          <Link href={`/${league}`} style={{ color: '#666', textDecoration: 'none' }}>{pick.league}</Link>
          {' › '}
          <span>{dateDisplay}</span>
          {' › '}
          <span style={{ color: '#000' }}>
            {Array.isArray(pick.teams) ? pick.teams.join(' vs ') : ''}
          </span>
        </nav>

        <header style={{ borderBottom: '2px solid #2d8c3e', paddingBottom: '20px', marginBottom: '32px' }}>
          <div style={{ fontSize: '13px', color: '#b8860b', fontWeight: 600, letterSpacing: '1px', marginBottom: '8px' }}>
            {pick.league} · {dateDisplay} · {timeDisplay}
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 16px 0', fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {pick.title}
          </h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ background: '#2d8c3e', color: '#fff', padding: '6px 14px', borderRadius: '999px', fontSize: '14px', fontWeight: 700 }}>
              {pick.evPercentage} EV
            </span>
            <span style={{ color: '#b8860b', fontSize: '20px', letterSpacing: '2px' }}>{stars}</span>
            <span style={{ background: '#000', color: '#fff', padding: '6px 14px', borderRadius: '4px', fontSize: '14px', fontWeight: 600 }}>
              {pick.playToLine}
            </span>
          </div>
        </header>

        <section style={{ background: '#f0f7f1', border: '2px solid #2d8c3e', borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', color: '#2d8c3e', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>THE PICK</div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px', fontFamily: 'Barlow Condensed, sans-serif' }}>
            {pick.playToLine}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', fontSize: '14px' }}>
            <div>
              <div style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expected Value</div>
              <div style={{ fontWeight: 700, fontSize: '18px' }}>{pick.evPercentage}</div>
            </div>
            <div>
              <div style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fair Odds</div>
              <div style={{ fontWeight: 700, fontSize: '18px' }}>{pick.fairOdds}</div>
            </div>
            <div>
              <div style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Market Odds</div>
              <div style={{ fontWeight: 700, fontSize: '18px' }}>{pick.marketOdds}</div>
            </div>
            <div>
              <div style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sportsbook</div>
              <div style={{ fontWeight: 700, fontSize: '18px' }}>{pick.sportsbook}</div>
            </div>
          </div>
        </section>

        <article style={{ fontSize: '17px', lineHeight: 1.7, color: '#222' }}>
          {pick.analysisParagraph1 && (
            <div style={{ marginBottom: '24px' }}>
              {documentToReactComponents(pick.analysisParagraph1)}
            </div>
          )}
          {pick.analysisParagraph2 && (
            <div style={{ marginBottom: '32px' }}>
              {documentToReactComponents(pick.analysisParagraph2)}
            </div>
          )}
        </article>

        <footer style={{ borderTop: '1px solid #e5e5e5', paddingTop: '24px', marginTop: '40px', fontSize: '13px', color: '#666', lineHeight: 1.6 }}>
          <p style={{ margin: '0 0 12px 0' }}>
            <strong>Disclaimer:</strong> This analysis is educational and intended to supplement your own thinking. Past performance does not guarantee future results. 21+ only.
          </p>
          <p style={{ margin: 0 }}>
            Problem gambling? Call <strong>1-800-GAMBLER</strong> or visit{' '}
            <a href="https://www.ncpg.org" style={{ color: '#b8860b' }}>ncpg.org</a>.
          </p>
        </footer>
      </main>
    </>
  );
}