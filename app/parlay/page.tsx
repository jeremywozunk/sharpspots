import { createClient } from 'contentful';
import Link from 'next/link';

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
});

const SITE_URL = 'https://sharpspots.vercel.app';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Parlay of the Day | Best +EV Sports Parlay | SharpSpots',
  description: 'Today\'s top parlay built from the highest-confidence +EV picks across all major leagues. Combined odds and payout breakdown inside.',
  alternates: { canonical: `${SITE_URL}/parlay` },
  openGraph: {
    title: 'Parlay of the Day | SharpSpots',
    description: 'Today\'s top parlay built from the highest-confidence +EV picks.',
    url: `${SITE_URL}/parlay`,
    siteName: 'SharpSpots',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Parlay of the Day | SharpSpots',
    description: 'Today\'s top parlay built from the highest-confidence +EV picks.',
  },
};

// --- Odds conversion utilities ---
function americanToDecimal(american: number): number {
  if (american > 0) return (american / 100) + 1;
  return (100 / Math.abs(american)) + 1;
}

function decimalToAmerican(decimal: number): string {
  if (decimal >= 2) {
    const american = Math.round((decimal - 1) * 100);
    return `+${american}`;
  } else {
    const american = Math.round(-100 / (decimal - 1));
    return `${american}`;
  }
}

function parseOdds(odds: string | number | undefined): number | null {
  if (odds === undefined || odds === null) return null;
  const str = String(odds).trim().replace('+', '');
  const num = parseFloat(str);
  if (isNaN(num)) return null;
  return num;
}

// --- Parlay logic ---
function getGameKey(pick: any): string {
  const teams = Array.isArray(pick.fields.teams) ? [...pick.fields.teams].sort().join('-') : '';
  const date = pick.fields.gameDate?.split('T')[0] || '';
  return `${teams}-${date}`;
}

function selectParlayLegs(picks: any[]): any[] {
  const sorted = [...picks].sort(
    (a, b) => (b.fields.confidenceScore || 0) - (a.fields.confidenceScore || 0)
  );
  const selected: any[] = [];
  const usedGames = new Set<string>();

  for (const pick of sorted) {
    if (selected.length === 3) break;
    const gameKey = getGameKey(pick);
    if (usedGames.has(gameKey)) continue;
    selected.push(pick);
    usedGames.add(gameKey);
  }

  return selected;
}

function StarRating({ score }: { score: number }) {
  return (
    <div style={{ color: '#b8860b', fontSize: 14, letterSpacing: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= score ? '#b8860b' : '#d1d5db' }}>★</span>
      ))}
    </div>
  );
}

function buildGameUrl(pick: any): string {
  const date = new Date(pick.fields.gameDate);
  const dateStr = date.toISOString().split('T')[0];
  const league = pick.fields.league.toLowerCase();
  return `/${league}/picks/${dateStr}/${pick.fields.slug}`;
}

export default async function ParlayPage() {
  const now = new Date();
  const etDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const startOfDay = new Date(etDate.getFullYear(), etDate.getMonth(), etDate.getDate(), 0, 0, 0);
  const endOfDay = new Date(etDate.getFullYear(), etDate.getMonth(), etDate.getDate(), 23, 59, 59);

  const entries = await client.getEntries({
    content_type: 'gamePick',
    'fields.status': 'published',
    'fields.gameDate[gte]': startOfDay.toISOString(),
    'fields.gameDate[lte]': endOfDay.toISOString(),
    order: ['-fields.confidenceScore'],
  });

  const allPicks = entries.items;
  const legs = selectParlayLegs(allPicks);

  const todayDisplay = etDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate combined parlay odds
  let combinedDecimal = 1;
  let allLegsHaveOdds = true;

  for (const leg of legs) {
    const american = parseOdds(leg.fields.sportsbookOdds);
    if (american === null) {
      allLegsHaveOdds = false;
      break;
    }
    combinedDecimal *= americanToDecimal(american);
  }

  const combinedAmerican = allLegsHaveOdds && legs.length > 0 ? decimalToAmerican(combinedDecimal) : null;
  const payout100 = allLegsHaveOdds && legs.length > 0 ? (combinedDecimal * 100).toFixed(2) : null;
  const payout50 = allLegsHaveOdds && legs.length > 0 ? (combinedDecimal * 50).toFixed(2) : null;

  const insufficientPicks = legs.length < 2;

  return (
    <>
      <style>{`
        .parlay-header { padding: 48px 48px 32px; border-bottom: 1px solid #e5e7eb; text-align: center; background: #f9f6f0; }
        .parlay-eyebrow { font-size: 13px; color: #b8860b; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
        .parlay-h1 { font-family: 'Barlow Condensed', Arial Black, sans-serif; font-weight: 800; font-size: 56px; text-transform: uppercase; letter-spacing: 2px; color: #2d8c3e; line-height: 1; margin-bottom: 8px; }
        .parlay-sub { font-size: 16px; color: #6b7280; }

        .empty-state { padding: 80px 48px; text-align: center; color: #111; font-size: 22px; font-weight: 700; line-height: 1.5; }
        .empty-state-sub { display: block; margin-top: 12px; font-size: 16px; font-weight: 400; color: #6b7280; }

        .summary-box { max-width: 700px; margin: 32px auto; padding: 28px 32px; background: #f0f7f1; border: 2px solid #2d8c3e; border-radius: 10px; text-align: center; }
        .summary-label { font-size: 12px; color: #2d8c3e; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }
        .summary-odds { font-family: 'Barlow Condensed', sans-serif; font-size: 56px; font-weight: 800; color: #111; line-height: 1; margin-bottom: 20px; }
        .summary-payouts { display: flex; justify-content: center; gap: 48px; flex-wrap: wrap; }
        .payout-block { text-align: center; }
        .payout-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .payout-value { font-size: 22px; font-weight: 700; color: #111; }

        .legs-section { max-width: 800px; margin: 0 auto; padding: 16px 24px 48px; }
        .legs-title { font-size: 13px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; padding-left: 24px; }

        .leg { display: flex; gap: 20px; padding: 20px 24px; border-bottom: 0.5px solid #e5e7eb; border-left: 4px solid #2d8c3e; background: #fff; text-decoration: none; color: inherit; transition: background 0.15s; }
        .leg:hover { background: #f9fafb; }
        .leg-number { font-family: 'Barlow Condensed', sans-serif; font-size: 32px; font-weight: 800; color: #2d8c3e; line-height: 1; min-width: 40px; }
        .leg-content { flex: 1; min-width: 0; }
        .leg-eyebrow { font-size: 11px; font-weight: 700; color: #2d8c3e; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
        .leg-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; line-height: 1.3; }
        .leg-meta { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .leg-play { display: inline-block; font-size: 11px; font-weight: 700; color: #1a6b2a; background: #f0faf2; border: 0.5px solid #a8d8b0; border-radius: 20px; padding: 2px 10px; }
        .leg-odds { font-size: 13px; font-weight: 700; color: #111; font-family: 'Courier New', monospace; }
        .leg-ev { background: #f0faf2; color: #1a6b2a; font-size: 12px; font-weight: 600; padding: 2px 10px; border-radius: 20px; border: 0.5px solid #a8d8b0; }

        .cta-section { padding: 32px 48px 64px; text-align: center; }
        .cta-btn { display: inline-block; font-size: 17px; font-weight: 700; color: #b8860b; background: #fdf8ee; border: 1.5px solid #d4aa50; border-radius: 30px; padding: 16px 40px; text-decoration: none; transition: all 0.15s; }
        .cta-btn:hover { background: #f7eed7; }
        .cta-disclaimer { margin-top: 16px; font-size: 12px; color: #9ca3af; }

        @media (max-width: 768px) {
          .parlay-header { padding: 32px 20px 20px; }
          .parlay-h1 { font-size: 40px; }
          .summary-box { margin: 20px 16px; padding: 20px 16px; }
          .summary-odds { font-size: 40px; }
          .summary-payouts { gap: 24px; }
          .legs-section { padding: 16px 0 32px; }
          .legs-title { padding-left: 20px; }
          .leg { padding: 16px 20px; }
          .leg-number { font-size: 28px; min-width: 32px; }
          .cta-section { padding: 24px 20px 48px; }
          .empty-state { padding: 60px 20px; font-size: 18px; }
        }
      `}</style>

      <div className="parlay-header">
        <div className="parlay-eyebrow">🎯 Today's Best Combined Bet</div>
        <h1 className="parlay-h1">Parlay of the Day</h1>
        <div className="parlay-sub">{todayDisplay}</div>
      </div>

      {insufficientPicks && (
        <div className="empty-state">
          No parlay available today.
          <span className="empty-state-sub">Not enough +EV opportunities to build a parlay. Check back tomorrow.</span>
        </div>
      )}

      {!insufficientPicks && combinedAmerican && (
        <>
          <div className="summary-box">
            <div className="summary-label">Combined Parlay Odds</div>
            <div className="summary-odds">{combinedAmerican}</div>
            <div className="summary-payouts">
              <div className="payout-block">
                <div className="payout-label">$100 Bet Pays</div>
                <div className="payout-value">${payout100}</div>
              </div>
              <div className="payout-block">
                <div className="payout-label">$50 Bet Pays</div>
                <div className="payout-value">${payout50}</div>
              </div>
            </div>
          </div>

          <div className="legs-section">
            <div className="legs-title">{legs.length} Legs</div>
            {legs.map((leg: any, idx: number) => (
              <Link key={leg.sys.id} href={buildGameUrl(leg)} className="leg">
                <div className="leg-number">{idx + 1}</div>
                <div className="leg-content">
                  <div className="leg-eyebrow">{leg.fields.league}</div>
                  <div className="leg-title">{leg.fields.title}</div>
                  <div className="leg-meta">
                    <span className="leg-play">{leg.fields.playToLine}</span>
                    <span className="leg-odds">{leg.fields.sportsbookOdds}</span>
                    <span className="leg-ev">{leg.fields.evPercentage} EV</span>
                    <StarRating score={leg.fields.confidenceScore} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="cta-section">
            <a href="#" className="cta-btn">Build Parlay on FanDuel →</a>
            <div className="cta-disclaimer">21+ only. Bet responsibly. Odds and lines may vary by sportsbook.</div>
          </div>
        </>
      )}
    </>
  );
}