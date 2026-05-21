import client from '../contentful';
import Link from 'next/link';

// Public from day one (per design decision May 20, 2026). No 60-pick gate.
export async function generateMetadata() {
  return {
    title: 'Track Record | SharpSpots',
    description: 'Public W/L record for every SharpSpots algorithmic pick, broken down by league and confidence tier.',
    robots: { index: true, follow: true },
  };
}

export const dynamic = 'force-dynamic';

const RENDER_CAP = 75; // max rows shown inline on main wall; link out to /all for more

// Unit-sizing per Spec §4 (Option A — Star-Implied)
const UNITS_BY_STAR: Record<number, number> = {
  5: 3,
  4: 2,
  3: 1,
  2: 0.5,
  1: 0,
};

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
    recommendedPlay?: string;
    line?: string;
    marketOdds?: string;
    result?: 'W' | 'L' | 'Push' | 'Void' | 'win' | 'loss' | 'push' | 'void';
    unitsWonLost?: number;
  };
}

interface PageProps {
  searchParams: Promise<{ sport?: string; range?: string }>;
}

type DateRange = '30d' | '90d' | 'ytd' | '12m' | 'all';

const RANGE_LABELS: Record<DateRange, string> = {
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  'ytd': 'This year',
  '12m': 'Last 12 months',
  'all': 'All-time',
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

function rangeCutoffMs(range: DateRange): number | null {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  if (range === '30d') return now - 30 * DAY;
  if (range === '90d') return now - 90 * DAY;
  if (range === '12m') return now - 365 * DAY;
  if (range === 'ytd') {
    // Start of current year in ET. Probe ET-vs-UTC offset (same pattern as /[league]/page.tsx fix).
    const etParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/New_York',
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date());
    const etYear = etParts.find(p => p.type === 'year')!.value;
    const probe = new Date(`${etYear}-01-01T12:00:00Z`);
    const probeHourET = parseInt(new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', hour: '2-digit', hour12: false,
    }).format(probe), 10);
    const etOffsetHours = 12 - probeHourET;
    return new Date(`${etYear}-01-01T00:00:00Z`).getTime() + etOffsetHours * 60 * 60 * 1000;
  }
  return null; // 'all'
}

async function getGradedPicks(): Promise<GradedPick[]> {
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
  staked: number;
}

function emptyBucket(): Bucket {
  return { w: 0, l: 0, p: 0, units: 0, count: 0, staked: 0 };
}

function addToBucket(b: Bucket, pick: GradedPick) {
  const r = normResult(pick.fields.result);
  if (!r || r === 'Void') return;
  b.count += 1;
  if (r === 'W') b.w += 1;
  else if (r === 'L') b.l += 1;
  else if (r === 'Push') b.p += 1;

  const star = pick.fields.confidenceScore ?? 0;
  const stake = UNITS_BY_STAR[star] ?? 0;
  if (r !== 'Push') b.staked += stake;

  if (typeof pick.fields.unitsWonLost === 'number') {
    b.units += pick.fields.unitsWonLost;
  } else {
    // Derive from stars at standard -110 if unitsWonLost not yet stored
    if (r === 'W') b.units += stake * (100 / 110);
    else if (r === 'L') b.units -= stake;
  }
}

function roiPct(b: Bucket): number {
  return b.staked > 0 ? Math.round((b.units / b.staked) * 1000) / 10 : 0;
}

function winPct(b: Bucket): number {
  const denom = b.w + b.l;
  return denom > 0 ? Math.round((b.w / denom) * 1000) / 10 : 0;
}

function fmtDate(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', timeZone: 'America/New_York',
  });
}

function formatLineSummary(p: GradedPick): string {
  const parts: string[] = [];
  if (p.fields.line) parts.push(p.fields.line);
  if (p.fields.marketOdds) parts.push(p.fields.marketOdds);
  return parts.join(' · ');
}

function pickGameUrl(p: GradedPick): string {
  const lg = (p.fields.league || '').toLowerCase();
  const date = p.fields.gameDate ? new Date(p.fields.gameDate).toISOString().split('T')[0] : '';
  const slug = p.fields.slug || '';
  if (!lg || !date || !slug) return '#';
  return `/${lg}/picks/${date}/${slug}`;
}

export default async function TrackRecordPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const sportFilter = (sp.sport || 'all').toLowerCase();
  const rangeFilter: DateRange = (sp.range as DateRange) || '12m';

  const allPicks = await getGradedPicks();

  // Filter out 1-star picks per Spec §4 + §5 + only graded
  const graded = allPicks.filter((p) => (p.fields.confidenceScore ?? 0) >= 2 && normResult(p.fields.result));

  // Per-sport counts (always full sample, regardless of date range — for chip labels)
  const sportCounts: Record<string, number> = { all: graded.length };
  graded.forEach((p) => {
    const lg = (p.fields.league || 'unk').toLowerCase();
    sportCounts[lg] = (sportCounts[lg] || 0) + 1;
  });

  // Apply filters for the displayed slice
  const cutoff = rangeCutoffMs(rangeFilter);
  const inRange = graded.filter((p) => {
    if (cutoff === null) return true;
    const d = p.fields.gameDate ? new Date(p.fields.gameDate).getTime() : 0;
    return d >= cutoff;
  });
  const visible = inRange.filter((p) => {
    if (sportFilter === 'all') return true;
    return (p.fields.league || '').toLowerCase() === sportFilter;
  });

  // Summary stats computed over the FILTERED slice (so numbers match what user sees)
  const summary = emptyBucket();
  visible.forEach((p) => addToBucket(summary, p));

  const rows = visible.slice(0, RENDER_CAP);
  const hiddenCount = Math.max(0, visible.length - RENDER_CAP);

  const lastUpdated = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short',
  });

  // Build filter chip hrefs preserving the other dimension
  const chipHref = (sport: string) => {
    const params = new URLSearchParams();
    if (sport !== 'all') params.set('sport', sport);
    if (rangeFilter !== '12m') params.set('range', rangeFilter);
    const q = params.toString();
    return q ? `/track-record?${q}` : '/track-record';
  };

  // Available sport chips: always show All + any sport with picks
  const sportChips: Array<{ key: string; label: string; count: number }> = [
    { key: 'all', label: 'All', count: sportCounts.all || 0 },
    ...Object.entries(sportCounts)
      .filter(([k]) => k !== 'all' && k !== 'unk')
      .sort((a, b) => b[1] - a[1])
      .map(([k, count]) => ({ key: k, label: k.toUpperCase(), count })),
  ];

  return (
    <>
      <style>{`
        .tr-hero { padding: 80px 48px 36px; text-align: center; }
        .tr-headline { font-family: var(--font-display); font-style: italic; font-weight: 700; font-size: 72px; line-height: 1.02; color: var(--jade); letter-spacing: -0.01em; }
        .tr-meta { font-family: var(--font-ui); font-size: 11px; color: var(--gray-muted); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 22px; }

        .tr-summary { padding: 8px 48px 32px; }
        .summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
        .summary-card { background: var(--bg-2); border: 1px solid var(--border-subtle); padding: 16px 14px; text-align: center; }
        .summary-label { font-size: 10px; font-weight: 600; letter-spacing: 0.14em; color: var(--gray-muted); text-transform: uppercase; margin-bottom: 8px; }
        .summary-value { font-family: var(--font-display); font-style: italic; font-weight: 700; font-size: 26px; color: var(--fg); line-height: 1; }
        .summary-value.jade { color: var(--jade); }
        .summary-value.neg { color: #d97766; }

        .tr-filters { padding: 12px 48px 14px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .filter-label { font-size: 10px; color: var(--gray-muted); letter-spacing: 0.14em; text-transform: uppercase; }
        .chip { font-family: var(--font-ui); font-size: 12px; padding: 6px 14px; border-radius: 16px; border: 1px solid var(--border-subtle); color: var(--gray-muted); cursor: pointer; text-decoration: none; transition: color 0.15s, border-color 0.15s; }
        .chip:hover { color: var(--fg); border-color: var(--jade); }
        .chip.active { background: rgba(74, 222, 128, 0.12); color: var(--jade); border-color: var(--jade); }
        .range-select { margin-left: auto; background: var(--bg-2); color: var(--fg); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 6px 14px; font-size: 12px; font-family: var(--font-ui); cursor: pointer; }

        .tr-table-wrap { padding: 0 48px 32px; }
        .tr-table { width: 100%; border-collapse: collapse; font-family: var(--font-ui); border: 1px solid var(--border-subtle); }
        .tr-table th { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; color: var(--gray-muted); text-transform: uppercase; text-align: left; padding: 12px 14px; background: var(--bg-2); border-bottom: 1px solid var(--border-subtle); }
        .tr-table td { padding: 14px; border-bottom: 1px solid var(--border-subtle); font-size: 13px; color: var(--fg); vertical-align: middle; }
        .tr-table tr:last-child td { border-bottom: none; }
        .tr-table tr:hover td { background: rgba(74, 222, 128, 0.04); }
        .tr-table .col-date { color: var(--gray-muted); white-space: nowrap; width: 80px; }
        .tr-table .col-sport { color: var(--gray-muted); width: 60px; font-size: 12px; text-transform: uppercase; }
        .tr-table .col-pick a { color: var(--fg); text-decoration: none; }
        .tr-table .col-pick a:hover { color: var(--jade); }
        .tr-table .col-line { color: var(--gray-muted); font-size: 12px; white-space: nowrap; width: 110px; }
        .tr-table .col-stars { color: var(--gold); font-size: 11px; letter-spacing: 1px; width: 70px; white-space: nowrap; }
        .tr-table .col-result { width: 70px; }
        .tr-table .col-units { font-weight: 600; white-space: nowrap; width: 70px; text-align: right; }
        .tr-table .units-pos { color: var(--jade); }
        .tr-table .units-neg { color: #d97766; }
        .tr-table .units-flat { color: var(--gray-muted); }

        .result-pill { display: inline-block; padding: 2px 10px; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; }
        .result-pill.W { background: rgba(74, 222, 128, 0.14); color: var(--jade); }
        .result-pill.L { background: rgba(217, 119, 102, 0.14); color: #d97766; }
        .result-pill.Push { background: rgba(180, 180, 180, 0.14); color: var(--cream); }

        .show-all-link { display: block; text-align: center; padding: 16px 0 4px; font-size: 13px; color: var(--jade); text-decoration: none; }
        .show-all-link:hover { color: var(--gold); }

        .empty-state { padding: 80px 48px; text-align: center; font-style: italic; color: var(--gray-muted); font-family: var(--font-prose); font-size: 16px; line-height: 1.7; }
        .empty-state .accent { color: var(--jade); font-style: italic; }

        .disclaimer { padding: 24px 48px 48px; font-size: 11px; color: var(--gray-muted); font-style: italic; max-width: 760px; margin: 0 auto; text-align: center; line-height: 1.7; }

        @media (max-width: 768px) {
          .tr-hero { padding: 56px 20px 28px; }
          .tr-headline { font-size: 44px; }
          .tr-summary { padding: 4px 20px 24px; }
          .summary-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .summary-value { font-size: 22px; }
          .tr-filters { padding: 10px 20px 12px; }
          .range-select { margin-left: 0; }
          .tr-table-wrap { padding: 0 20px 24px; }
          .tr-table th, .tr-table td { padding: 10px 8px; font-size: 12px; }
          .tr-table .col-line, .tr-table .col-stars { display: none; }
          .disclaimer { padding: 18px 20px 36px; }
        }
      `}</style>

      <div className="tr-hero">
        <h1 className="tr-headline">The Track Record.</h1>
        <div className="tr-meta">Last updated · {lastUpdated} ET</div>
      </div>

      <div className="tr-summary">
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-label">Record</div>
            <div className="summary-value">{summary.w}-{summary.l}-{summary.p}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Units</div>
            <div className={`summary-value ${summary.units >= 0 ? 'jade' : 'neg'}`}>
              {summary.units >= 0 ? '+' : ''}{summary.units.toFixed(2)}u
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">ROI</div>
            <div className={`summary-value ${roiPct(summary) >= 0 ? 'jade' : 'neg'}`}>
              {roiPct(summary) >= 0 ? '+' : ''}{roiPct(summary).toFixed(1)}%
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Win Rate</div>
            <div className="summary-value">{winPct(summary).toFixed(1)}%</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Sample</div>
            <div className="summary-value">{summary.count}</div>
          </div>
        </div>
      </div>

      <div className="tr-filters">
        <span className="filter-label">Sport</span>
        {sportChips.map((c) => (
          <Link
            key={c.key}
            href={chipHref(c.key)}
            className={`chip ${sportFilter === c.key ? 'active' : ''}`}
          >
            {c.label}
          </Link>
        ))}
        <form method="get" id="tr-range-form" style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          {sportFilter !== 'all' && <input type="hidden" name="sport" value={sportFilter} />}
          <span className="filter-label">Date</span>
          <select name="range" defaultValue={rangeFilter} className="range-select" id="tr-range-select">
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="ytd">This year</option>
            <option value="12m">Last 12 months</option>
            <option value="all">All-time</option>
          </select>
          <noscript><button type="submit" className="chip">Apply</button></noscript>
        </form>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=document.getElementById('tr-range-select');if(s){s.addEventListener('change',function(){var f=document.getElementById('tr-range-form');if(f)f.submit();});}})();`,
          }}
        />
      </div>

      {visible.length === 0 ? (
        <div className="empty-state">
          <p>
            No graded picks in the <span className="accent">{RANGE_LABELS[rangeFilter]}</span> window
            {sportFilter !== 'all' ? <> for <span className="accent">{sportFilter.toUpperCase()}</span></> : null}
            .
          </p>
          <p style={{ marginTop: 12, fontSize: 13 }}>
            <Link href="/track-record" style={{ color: 'var(--gold)' }}>→ Clear filters</Link>
          </p>
        </div>
      ) : (
        <div className="tr-table-wrap">
          <table className="tr-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Sport</th>
                <th>Pick</th>
                <th>Line · Odds</th>
                <th>★</th>
                <th>Result</th>
                <th style={{ textAlign: 'right' }}>Units</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const r = normResult(p.fields.result)!;
                const u = typeof p.fields.unitsWonLost === 'number'
                  ? p.fields.unitsWonLost
                  : (() => {
                      const star = p.fields.confidenceScore ?? 0;
                      const stake = UNITS_BY_STAR[star] ?? 0;
                      if (r === 'W') return stake * (100 / 110);
                      if (r === 'L') return -stake;
                      return 0;
                    })();
                const uClass = u > 0 ? 'units-pos' : (u < 0 ? 'units-neg' : 'units-flat');
                const stars = p.fields.confidenceScore ?? 0;
                const gameUrl = pickGameUrl(p);
                return (
                  <tr key={p.sys.id}>
                    <td className="col-date">{fmtDate(p.fields.gameDate || p.sys.createdAt)}</td>
                    <td className="col-sport">{p.fields.league || ''}</td>
                    <td className="col-pick">
                      {gameUrl !== '#' ? <Link href={gameUrl}>{p.fields.title}</Link> : (p.fields.title || '')}
                    </td>
                    <td className="col-line">{formatLineSummary(p)}</td>
                    <td className="col-stars">{'★'.repeat(stars)}</td>
                    <td className="col-result"><span className={`result-pill ${r}`}>{r}</span></td>
                    <td className={`col-units ${uClass}`}>{u > 0 ? '+' : ''}{u.toFixed(2)}u</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {hiddenCount > 0 && (
            <Link href={`/track-record/all?${new URLSearchParams({
              ...(sportFilter !== 'all' ? { sport: sportFilter } : {}),
              range: rangeFilter,
            }).toString()}`} className="show-all-link">
              Show all {visible.length} picks in this range →
            </Link>
          )}
        </div>
      )}

      <div className="disclaimer">
        Unit sizing per Track Record Spec: 5★=3u · 4★=2u · 3★=1u · 2★=0.5u · 1★ informational only. Voids excluded. ROI is for record-keeping; not investment advice.
      </div>
    </>
  );
}
