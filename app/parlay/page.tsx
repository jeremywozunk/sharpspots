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
  description: "Today's top parlay built from the highest-confidence +EV picks across all major leagues. Combined odds and payout breakdown inside.",
  alternates: { canonical: `${SITE_URL}/parlay` },
};

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
    <div style={{ color: 'var(--gold)', fontSize: 13, letterSpacing: 3 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= score ? 'var(--gold)' : 'var(--star-empty)' }}>★</span>
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
    'fields.status': 'live',
    'fields.gameDate[gte]': startOfDay.toISOString(),
    'fields.gameDate[lte]': endOfDay.toISOString(),
    order: ['-fields.confidenceScore'],
  });

  const allPicks = entries.items;
  const legs = selectParlayLegs(allPicks);

  const todayDisplay = etDate.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  let combinedDecimal = 1;
  let allLegsHaveOdds = true;
  for (const leg of legs) {
    const american = parseOdds(leg.fields.sportsbookOdds);
    if (american === null) { allLegsHaveOdds = false; break; }
    combinedDecimal *= americanToDecimal(american);
  }

  const combinedAmerican = allLegsHaveOdds && legs.length > 0 ? decimalToAmerican(combinedDecimal) : null;
  const payout100 = allLegsHaveOdds && legs.length > 0 ? (combinedDecimal * 100).toFixed(2) : null;
  const payout50 = allLegsHaveOdds && legs.length > 0 ? (combinedDecimal * 50).toFixed(2) : null;
  const insufficientPicks = legs.length < 2;

  return (
    <>
      <style>{`
        .pl-hero { padding: 64px 48px 36px; border-bottom: 1px solid var(--border-subtle); text-align: center; }
        .pl-eyebrow { font-size: 11px; color: var(--jade); font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 14px; }
        .pl-h1 { font-family: var(--font-display); font-style: italic; font-weight: 700; font-size: 44px; line-height: 1.1; margin-bottom: 12px; color: var(--fg); }
        .pl-h1 em { color: var(--gold); font-style: italic; }
        .pl-sub { font-size: 13px; color: var(--gray-muted); letter-spacing: 0.06em; text-transform: uppercase; }
        .empty-state { padding: 80px 48px; text-align: center; color: var(--fg); font-family: var(--font-display); font-style: italic; font-size: 22px; line-height: 1.5; }
        .empty-state-sub { display: block; margin-top: 12px; font-size: 14px; font-style: normal; color: var(--gray-muted); font-family: var(--font-ui); }
        .summary-box { max-width: 720px; margin: 40px auto; padding: 32px 36px; background: var(--bg-2); border: 1px solid var(--border-subtle); border-top: 2px solid var(--gold); text-align: center; }
        .summary-label { font-size: 11px; color: var(--gold); font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 14px; }
        .summary-odds { font-family: var(--font-display); font-style: italic; font-size: 56px; font-weight: 700; color: var(--fg); line-height: 1; margin-bottom: 24px; }
        .summary-payouts { display: flex; justify-content: center; gap: 56px; flex-wrap: wrap; }
        .payout-block { text-align: center; }
        .payout-label { font-size: 10px; color: var(--gray-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
        .payout-value { font-size: 22px; font-weight: 600; color: var(--jade); font-family: var(--font-ui); }
        .legs-section { max-width: 820px; margin: 0 auto; padding: 16px 48px 64px; }
        .legs-title { font-size: 11px; font-weight: 600; color: var(--gray-muted); text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 18px; }
        .leg { display: flex; gap: 22px; padding: 22px 24px 22px 22px; border-bottom: 1px solid var(--border-subtle); border-left: 1px solid var(--jade); color: inherit; }
        .leg:hover { background: rgba(74, 222, 128, 0.04); }
        .leg-number { font-family: var(--font-display); font-style: italic; font-size: 32px; font-weight: 700; color: var(--jade); line-height: 1; min-width: 40px; }
        .leg-content { flex: 1; min-width: 0; }
        .leg-eyebrow { font-size: 10px; font-weight: 600; color: var(--gray-muted); text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 6px; }
        .leg-title { font-family: var(--font-display); font-style: italic; font-size: 18px; font-weight: 700; margin-bottom: 10px; line-height: 1.3; color: var(--fg); }
        .leg-meta { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
        .leg-play { display: inline-block; font-size: 10px; font-weight: 600; color: var(--jade); border-top: 2px solid var(--jade); border-bottom: 2px solid var(--jade); padding: 4px 10px; letter-spacing: 0.08em; text-transform: uppercase; }
        .leg-odds { font-size: 13px; font-weight: 600; color: var(--fg); font-family: 'Courier New', monospace; }
        .leg-ev { background: var(--jade); color: var(--bg); font-size: 10px; font-weight: 600; padding: 4px 10px; letter-spacing: 0.06em; text-transform: uppercase; }
        .cta-section { padding: 24px 48px 64px; text-align: center; }
        .cta-btn { display: inline-block; font-size: 11px; font-weight: 600; color: var(--gold); background: transparent; border: 1px dashed var(--gold); padding: 14px 32px; letter-spacing: 0.14em; text-transform: uppercase; }
        .cta-btn:hover { background: rgba(212, 175, 55, 0.06); }
        .cta-disclaimer { margin-top: 18px; font-size: 11px; color: var(--gray-muted); font-style: italic; }
        @media (max-width: 768px) {
          .pl-hero { padding: 48px 20px 24px; }
          .pl-h1 { font-size: 32px; }
          .summary-box { margin: 24px 16px; padding: 24px 18px; }
          .summary-odds { font-size: 40px; }
          .summary-payouts { gap: 28px; }
          .legs-section { padding: 16px 20px 40px; }
          .leg { padding: 16px 12px; gap: 14px; }
          .leg-number { font-size: 26px; min-width: 30px; }
          .cta-section { padding: 18px 20px 48px; }
          .empty-state { padding: 60px 20px; font-size: 18px; }
        }
      `}</style>

      <div className="pl-hero">
        <div className="pl-eyebrow">Today&apos;s Best Combined Bet</div>
        <h1 className="pl-h1">Parlay of the <em>Day.</em></h1>
        <div className="pl-sub">{todayDisplay}</div>
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
                <div className="leg-number">{String(idx + 1).padStart(2, '0')}</div>
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
