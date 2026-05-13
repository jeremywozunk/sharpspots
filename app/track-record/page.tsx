import client from '../contentful';
import Link from 'next/link';

// noindex'd until 60+ graded picks accumulate (per Track Record Spec v2.0)
export const metadata = {
  title: 'Track Record | SharpSpots',
  description: 'Public W/L record for every SharpSpots algorithmic pick, broken down by league and confidence tier.',
  robots: { index: false, follow: true },
};

export const dynamic = 'force-dynamic';

const MIN_PICKS_TO_INDEX = 60;

interface GradedPick {
  sys: { id: string; createdAt: string };
  fields: {
    title?: string;
    slug?: string;
    league?: string;
    gameDate?: string;
    confidenceScore?: number;
    evPercentage?: string;
    playToLine?: string;
    result?: 'W' | 'L' | 'Push' | 'Void' | 'win' | 'loss' | 'push' | 'void';
    unitsWonLost?: number;
  };
}

// Unit-sizing per Spec §4 (Option A — Star-Implied)
const UNITS_BY_STAR: Record<number, number> = {
  5: 3,
  4: 2,
  3: 1,
  2: 0.5,
  1: 0,
};

function normResult(r?: string): 'W' | 'L' | 'Push' | 'Void' | null {
  if (!r) return null;
  const s = r.toLowerCase();
  if (s === 'w' || s === 'win') return 'W';
  if (s === 'l' || s === 'loss') return 'L';
  if (s === 'push') return 'Push';
  if (s === 'void') return 'Void';
  return null;
}

async function getGradedPicks(): Promise<GradedPick[]> {
  // Contentful 'exists' query to pull every entry with `result` set.
  try {
    const res = await client.getEntries({
      content_type: 'gamePick',
      'fields.result[exists]': true,
      order: ['-fields.gameDate'],
      limit: 1000,
    });
    return res.items as unknown as GradedPick[];
  } catch {
    return [];
  }
}

interface Bucket {
  w: number;
  l: number;
  p: number;
  units: number;
  count: number;
}

function emptyBucket(): Bucket {
  return { w: 0, l: 0, p: 0, units: 0, count: 0 };
}

function addToBucket(b: Bucket, pick: GradedPick) {
  const r = normResult(pick.fields.result);
  if (!r) return;
  if (r === 'Void') return;
  b.count += 1;
  if (r === 'W') b.w += 1;
  else if (r === 'L') b.l += 1;
  else if (r === 'Push') b.p += 1;

  if (typeof pick.fields.unitsWonLost === 'number') {
    b.units += pick.fields.unitsWonLost;
  } else {
    // Derive from stars at standard -110 if unitsWonLost not yet stored
    const star = pick.fields.confidenceScore ?? 0;
    const stake = UNITS_BY_STAR[star] ?? 0;
    if (r === 'W') b.units += stake * (100 / 110); // -110 payout
    else if (r === 'L') b.units -= stake;
  }
}

function roi(b: Bucket): number {
  // total staked across non-push, non-void picks (push returns stake)
  let staked = 0;
  // We approximate staked from confidence-derived units; pushes contribute 0 to ROI calc denominator
  // For ROI display we use units / staked; if staked is 0, ROI is 0
  return b.units; // displayed as units, not %; ROI % computed in component if needed
}

function winPct(b: Bucket): number {
  const denom = b.w + b.l;
  return denom > 0 ? Math.round((b.w / denom) * 1000) / 10 : 0;
}

function quarterKey(date: Date): string {
  const y = date.getUTCFullYear();
  const q = Math.floor(date.getUTCMonth() / 3) + 1;
  return `Q${q} ${y}`;
}

export default async function TrackRecordPage() {
  const picks = await getGradedPicks();

  // Filter out 1-star picks per Spec §4 + §5
  const graded = picks.filter((p) => (p.fields.confidenceScore ?? 0) >= 2 && normResult(p.fields.result));

  // Lifetime
  const lifetime = emptyBucket();
  graded.forEach((p) => addToBucket(lifetime, p));

  // By league
  const byLeague: Record<string, Bucket> = {};
  graded.forEach((p) => {
    const lg = p.fields.league ?? 'UNK';
    if (!byLeague[lg]) byLeague[lg] = emptyBucket();
    addToBucket(byLeague[lg], p);
  });
  const leagueRows = Object.entries(byLeague).sort((a, b) => b[1].count - a[1].count);

  // By confidence tier
  const byTier: Record<number, Bucket> = { 5: emptyBucket(), 4: emptyBucket(), 3: emptyBucket(), 2: emptyBucket() };
  graded.forEach((p) => {
    const star = p.fields.confidenceScore ?? 0;
    if (star >= 2 && star <= 5) addToBucket(byTier[star], p);
  });

  // Quarterly
  const byQuarter: Record<string, Bucket> = {};
  graded.forEach((p) => {
    const d = p.fields.gameDate ? new Date(p.fields.gameDate) : new Date(p.sys.createdAt);
    const qk = quarterKey(d);
    if (!byQuarter[qk]) byQuarter[qk] = emptyBucket();
    addToBucket(byQuarter[qk], p);
  });
  const quarterRows = Object.entries(byQuarter).sort((a, b) => (a[0] < b[0] ? 1 : -1));

  // Last 30 days individual picks
  const now = Date.now();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const recent = graded.filter((p) => {
    const d = p.fields.gameDate ? new Date(p.fields.gameDate).getTime() : 0;
    return now - d <= THIRTY_DAYS;
  });

  const showPlaceholder = graded.length < MIN_PICKS_TO_INDEX;
  const lastUpdated = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short',
  });

  return (
    <>
      <style>{`
        .tr-hero { padding: 64px 48px 32px; border-bottom: 1px solid var(--border-subtle); text-align: center; }
        .tr-hero h1 { font-family: var(--font-display); font-style: italic; font-size: 40px; line-height: 1.2; margin-bottom: 14px; color: var(--fg); }
        .tr-hero h1 em { color: var(--jade); font-style: italic; }
        .tr-hero p { font-size: 13px; color: var(--gray-muted); max-width: 560px; margin: 0 auto; line-height: 1.65; }
        .tr-meta { font-family: var(--font-ui); font-size: 11px; color: var(--gray-muted); letter-spacing: 0.08em; text-transform: uppercase; margin-top: 18px; }
        .tr-section { padding: 48px; }
        .tr-section-label { font-size: 11px; font-weight: 600; letter-spacing: 0.18em; color: var(--gray-muted); text-transform: uppercase; margin-bottom: 18px; }
        .tr-section-title { font-family: var(--font-display); font-style: italic; font-size: 26px; color: var(--fg); margin-bottom: 28px; }
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
        .summary-card { background: var(--bg-2); border: 1px solid var(--border-subtle); border-top: 2px solid var(--jade); padding: 24px 22px; }
        .summary-label { font-size: 10px; font-weight: 600; letter-spacing: 0.16em; color: var(--gray-muted); text-transform: uppercase; margin-bottom: 10px; }
        .summary-value { font-family: var(--font-display); font-style: italic; font-weight: 700; font-size: 32px; color: var(--fg); line-height: 1.1; }
        .summary-value.jade { color: var(--jade); }
        .summary-value.gold { color: var(--gold); }
        .summary-sub { font-size: 11px; color: var(--gray-muted); margin-top: 6px; letter-spacing: 0.04em; }
        .tr-table { width: 100%; border-collapse: collapse; font-family: var(--font-ui); }
        .tr-table th { font-size: 10px; font-weight: 600; letter-spacing: 0.14em; color: var(--gray-muted); text-transform: uppercase; text-align: left; padding: 12px 16px; border-bottom: 1px solid var(--border-subtle); }
        .tr-table td { padding: 16px; border-bottom: 1px solid var(--border-subtle); font-size: 14px; color: var(--fg); }
        .tr-table tr:hover td { background: rgba(74, 222, 128, 0.04); }
        .tr-table .units-pos { color: var(--jade); font-weight: 600; }
        .tr-table .units-neg { color: #d97766; font-weight: 600; }
        .tier-label { font-family: var(--font-brand); letter-spacing: 0.12em; color: var(--gold); font-size: 14px; }
        .placeholder { padding: 64px 48px; text-align: center; font-style: italic; color: var(--gray-muted); font-family: var(--font-prose); font-size: 16px; line-height: 1.7; }
        .placeholder em { color: var(--jade); font-style: italic; }
        .recent-list { padding: 0; }
        .recent-row { padding: 18px 0 18px 22px; border-left: 1px solid var(--jade); border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; gap: 22px; }
        .recent-row .meta { font-size: 11px; color: var(--gray-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
        .recent-row .title { font-family: var(--font-display); font-style: italic; font-weight: 700; font-size: 17px; color: var(--fg); }
        .result-pill { padding: 4px 12px; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; border: 1px solid; align-self: center; flex-shrink: 0; }
        .result-pill.W { color: var(--jade); border-color: var(--jade); }
        .result-pill.L { color: #d97766; border-color: #d97766; }
        .result-pill.Push { color: var(--gold); border-color: var(--gold); }
        .result-pill.Void { color: var(--gray-muted); border-color: var(--gray-muted); }
        .disclaimer { padding: 24px 48px; font-size: 11px; color: var(--gray-muted); font-style: italic; max-width: 720px; margin: 0 auto; text-align: center; line-height: 1.7; }
        @media (max-width: 768px) {
          .tr-hero { padding: 48px 20px 28px; }
          .tr-hero h1 { font-size: 28px; }
          .tr-section { padding: 36px 20px; }
          .summary-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
          .summary-value { font-size: 26px; }
          .tr-table th, .tr-table td { padding: 10px 8px; font-size: 12px; }
          .recent-row { flex-direction: column; gap: 8px; }
          .disclaimer { padding: 18px 20px; }
        }
      `}</style>

      <div className="tr-hero">
        <h1>The <em>Track Record.</em></h1>
        <p>
          Every recommended pick, scored against the closing line and graded against the final result. No retroactive edits. No cherry-picking.
        </p>
        <div className="tr-meta">Last updated · {lastUpdated} ET</div>
      </div>

      {showPlaceholder ? (
        <div className="placeholder">
          <p>
            Our track record will appear here once we&apos;ve published our first <em>{MIN_PICKS_TO_INDEX} graded picks</em>.
          </p>
          <p style={{ marginTop: 12 }}>
            We&apos;re currently at <em>{graded.length}</em> graded {graded.length === 1 ? 'pick' : 'picks'}. Check back soon.
          </p>
          <p style={{ marginTop: 18, fontSize: 13 }}>
            <Link href="/" style={{ color: 'var(--gold)' }}>→ See today&apos;s picks</Link>
          </p>
        </div>
      ) : (
        <>
          <div className="tr-section">
            <div className="tr-section-label">Lifetime</div>
            <div className="tr-section-title">Cumulative performance</div>
            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-label">Record</div>
                <div className="summary-value">{lifetime.w}<span style={{color:'var(--gray-muted)',fontSize:18}}>-</span>{lifetime.l}<span style={{color:'var(--gray-muted)',fontSize:18}}>-</span>{lifetime.p}</div>
                <div className="summary-sub">W-L-Push</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Win Rate</div>
                <div className="summary-value jade">{winPct(lifetime)}%</div>
                <div className="summary-sub">on decisions</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Units</div>
                <div className={`summary-value ${lifetime.units >= 0 ? 'jade' : ''}`} style={lifetime.units < 0 ? {color:'#d97766'} : {}}>
                  {lifetime.units >= 0 ? '+' : ''}{lifetime.units.toFixed(2)}
                </div>
                <div className="summary-sub">net units</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Graded Picks</div>
                <div className="summary-value gold">{lifetime.count}</div>
                <div className="summary-sub">2★ and above</div>
              </div>
            </div>
          </div>

          <div className="tr-section" style={{ paddingTop: 0 }}>
            <div className="tr-section-label">By Confidence</div>
            <div className="tr-section-title">Do higher-star picks actually win more?</div>
            <table className="tr-table">
              <thead>
                <tr>
                  <th>Tier</th>
                  <th>Picks</th>
                  <th>W-L-Push</th>
                  <th>Win %</th>
                  <th>Units</th>
                </tr>
              </thead>
              <tbody>
                {[5, 4, 3, 2].map((star) => {
                  const b = byTier[star];
                  return (
                    <tr key={star}>
                      <td><span className="tier-label">{'★'.repeat(star)}</span> <span style={{color:'var(--gray-muted)',fontSize:12,marginLeft:8}}>({UNITS_BY_STAR[star]}u)</span></td>
                      <td>{b.count}</td>
                      <td>{b.w}-{b.l}-{b.p}</td>
                      <td>{winPct(b)}%</td>
                      <td className={b.units >= 0 ? 'units-pos' : 'units-neg'}>{b.units >= 0 ? '+' : ''}{b.units.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="tr-section" style={{ paddingTop: 0 }}>
            <div className="tr-section-label">By League</div>
            <div className="tr-section-title">Performance across sports</div>
            <table className="tr-table">
              <thead>
                <tr>
                  <th>League</th>
                  <th>Picks</th>
                  <th>W-L-Push</th>
                  <th>Win %</th>
                  <th>Units</th>
                </tr>
              </thead>
              <tbody>
                {leagueRows.map(([lg, b]) => (
                  <tr key={lg}>
                    <td style={{fontWeight:600}}>{lg}</td>
                    <td>{b.count}</td>
                    <td>{b.w}-{b.l}-{b.p}</td>
                    <td>{winPct(b)}%</td>
                    <td className={b.units >= 0 ? 'units-pos' : 'units-neg'}>{b.units >= 0 ? '+' : ''}{b.units.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="tr-section" style={{ paddingTop: 0 }}>
            <div className="tr-section-label">Quarterly</div>
            <div className="tr-section-title">90-day windows</div>
            <table className="tr-table">
              <thead>
                <tr>
                  <th>Quarter</th>
                  <th>Picks</th>
                  <th>W-L-Push</th>
                  <th>Win %</th>
                  <th>Units</th>
                </tr>
              </thead>
              <tbody>
                {quarterRows.map(([qk, b]) => (
                  <tr key={qk}>
                    <td style={{fontWeight:600}}>{qk}</td>
                    <td>{b.count}</td>
                    <td>{b.w}-{b.l}-{b.p}</td>
                    <td>{winPct(b)}%</td>
                    <td className={b.units >= 0 ? 'units-pos' : 'units-neg'}>{b.units >= 0 ? '+' : ''}{b.units.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {recent.length > 0 && (
            <div className="tr-section" style={{ paddingTop: 0 }}>
              <div className="tr-section-label">Last 30 Days</div>
              <div className="tr-section-title">Individual picks</div>
              <div className="recent-list">
                {recent.map((p) => {
                  const r = normResult(p.fields.result)!;
                  const date = p.fields.gameDate ? new Date(p.fields.gameDate).toLocaleDateString('en-US', { month:'short', day:'numeric', timeZone:'America/New_York' }) : '';
                  return (
                    <div key={p.sys.id} className="recent-row">
                      <div>
                        <div className="meta">{p.fields.league} · {date} · {'★'.repeat(p.fields.confidenceScore ?? 0)}</div>
                        <div className="title">{p.fields.title}</div>
                        {p.fields.playToLine && (
                          <div style={{fontSize:12, color:'var(--gray-muted)', marginTop:4}}>{p.fields.playToLine}</div>
                        )}
                      </div>
                      <div className={`result-pill ${r}`}>{r}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <div className="disclaimer">
        Unit sizing per the Track Record Spec (Option A): 5★ = 3u, 4★ = 2u, 3★ = 1u, 2★ = 0.5u. 1★ picks are informational only and not counted. Voids are excluded. ROI is for record-keeping; not investment advice.
      </div>
    </>
  );
}
