import client from '../../contentful';
import Link from 'next/link';

export async function generateMetadata() {
  return {
    title: 'All Picks — Track Record | SharpSpots',
    description: 'Every SharpSpots algorithmic pick since launch. Filterable by sport and date range, paginated.',
    robots: { index: true, follow: true },
  };
}

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

const UNITS_BY_STAR: Record<number, number> = { 5: 3, 4: 2, 3: 1, 2: 0.5, 1: 0 };

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
    line?: string;
    marketOdds?: string;
    result?: 'W' | 'L' | 'Push' | 'Void' | 'win' | 'loss' | 'push' | 'void';
    unitsWonLost?: number;
  };
}

interface PageProps {
  searchParams: Promise<{ sport?: string; range?: string; page?: string }>;
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
  return null;
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

function emptyBucket(): Bucket { return { w: 0, l: 0, p: 0, units: 0, count: 0, staked: 0 }; }

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

export default async function AllPicksPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const sportFilter = (sp.sport || 'all').toLowerCase();
  const rangeFilter: DateRange = (sp.range as DateRange) || '12m';
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);

  const allPicks = await getGradedPicks();
  const graded = allPicks.filter((p) => (p.fields.confidenceScore ?? 0) >= 2 && normResult(p.fields.result));

  // Sport counts for chip labels (against full sample, not filtered)
  const sportCounts: Record<string, number> = { all: graded.length };
  graded.forEach((p) => {
    const lg = (p.fields.league || 'unk').toLowerCase();
    sportCounts[lg] = (sportCounts[lg] || 0) + 1;
  });

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

  // Summary stats (full filtered set)
  const summary = emptyBucket();
  visible.forEach((p) => addToBucket(summary, p));

  // ROI by confidence tier (filtered)
  const byTier: Record<number, Bucket> = { 5: emptyBucket(), 4: emptyBucket(), 3: emptyBucket(), 2: emptyBucket() };
  visible.forEach((p) => {
    const s = p.fields.confidenceScore ?? 0;
    if (s >= 2 && s <= 5) addToBucket(byTier[s], p);
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const rows = visible.slice(startIdx, startIdx + PAGE_SIZE);

  const sportChips: Array<{ key: string; label: string; count: number }> = [
    { key: 'all', label: 'All', count: sportCounts.all || 0 },
    ...Object.entries(sportCounts)
      .filter(([k]) => k !== 'all' && k !== 'unk')
      .sort((a, b) => b[1] - a[1])
      .map(([k, count]) => ({ key: k, label: k.toUpperCase(), count })),
  ];

  const chipHref = (sport: string) => {
    const params = new URLSearchParams();
    if (sport !== 'all') params.set('sport', sport);
    if (rangeFilter !== '12m') params.set('range', rangeFilter);
    // Reset to page 1 on filter change
    const q = params.toString();
    return q ? `/track-record/all?${q}` : '/track-record/all';
  };

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (sportFilter !== 'all') params.set('sport', sportFilter);
    if (rangeFilter !== '12m') params.set('range', rangeFilter);
    if (p !== 1) params.set('page', String(p));
    const q = params.toString();
    return q ? `/track-record/all?${q}` : '/track-record/all';
  };

  const startCount = visible.length === 0 ? 0 : startIdx + 1;
  const endCount = Math.min(startIdx + PAGE_SIZE, visible.length);

  // Pagination window: show up to 5 page numbers centered on current
  const pageNumbers: number[] = [];
  const half = 2;
  let from = Math.max(1, safePage - half);
  let to = Math.min(totalPages, from + 4);
  from = Math.max(1, to - 4);
  for (let i = from; i <= to; i++) pageNumbers.push(i);

  return (
    <>
      <style>{`
        .ap-backbar { padding: 28px 48px 0; }
        .ap-backbar a { font-size: 12px; color: var(--jade); text-decoration: none; }
        .ap-backbar a:hover { color: var(--gold); }

        .ap-hero { padding: 28px 48px 28px; text-align: center; }
        .ap-headline { font-family: var(--font-display); font-style: italic; font-weight: 700; font-size: 54px; line-height: 1.02; color: var(--jade); letter-spacing: -0.01em; }
        .ap-meta { font-size: 12px; color: var(--gray-muted); margin-top: 14px; }

        .ap-summary { padding: 0 48px 20px; }
        .summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
        .summary-card { background: var(--bg-2); border: 1px solid var(--border-subtle); padding: 16px 14px; text-align: center; }
        .summary-label { font-size: 10px; font-weight: 600; letter-spacing: 0.14em; color: var(--gray-muted); text-transform: uppercase; margin-bottom: 8px; }
        .summary-value { font-family: var(--font-display); font-style: italic; font-weight: 700; font-size: 24px; color: var(--fg); line-height: 1; }
        .summary-value.jade { color: var(--jade); }
        .summary-value.neg { color: #d97766; }

        .tier-card { background: var(--bg-2); border: 1px solid var(--border-subtle); padding: 16px 18px; margin: 0 48px 24px; }
        .tier-card-label { font-size: 10px; font-weight: 600; letter-spacing: 0.14em; color: var(--gray-muted); text-transform: uppercase; margin-bottom: 14px; }
        .tier-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .tier-cell { text-align: left; }
        .tier-head { font-size: 11px; color: var(--gold); margin-bottom: 4px; letter-spacing: 1px; }
        .tier-roi { font-family: var(--font-display); font-style: italic; font-weight: 700; font-size: 20px; line-height: 1.1; }
        .tier-roi.jade { color: var(--jade); }
        .tier-roi.neg { color: #d97766; }
        .tier-roi.flat { color: var(--fg); }
        .tier-sub { font-size: 11px; color: var(--gray-muted); margin-top: 3px; }

        .ap-filters { padding: 0 48px 12px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .filter-label { font-size: 10px; color: var(--gray-muted); letter-spacing: 0.14em; text-transform: uppercase; }
        .chip { font-family: var(--font-ui); font-size: 12px; padding: 6px 14px; border-radius: 16px; border: 1px solid var(--border-subtle); color: var(--gray-muted); cursor: pointer; text-decoration: none; transition: color 0.15s, border-color 0.15s; }
        .chip:hover { color: var(--fg); border-color: var(--jade); }
        .chip.active { background: rgba(74, 222, 128, 0.12); color: var(--jade); border-color: var(--jade); }
        .range-select { margin-left: auto; background: var(--bg-2); color: var(--fg); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 6px 14px; font-size: 12px; font-family: var(--font-ui); cursor: pointer; }

        .ap-meta-row { padding: 4px 48px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--gray-muted); }

        .ap-table-wrap { padding: 0 48px 24px; }
        .ap-table { width: 100%; border-collapse: collapse; font-family: var(--font-ui); border: 1px solid var(--border-subtle); }
        .ap-table th { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; color: var(--gray-muted); text-transform: uppercase; text-align: left; padding: 10px 14px; background: var(--bg-2); border-bottom: 1px solid var(--border-subtle); }
        .ap-table td { padding: 11px 14px; border-bottom: 1px solid var(--border-subtle); font-size: 12px; color: var(--fg); vertical-align: middle; }
        .ap-table tr:last-child td { border-bottom: none; }
        .ap-table tr:hover td { background: rgba(74, 222, 128, 0.04); }
        .ap-table .col-date { color: var(--gray-muted); white-space: nowrap; width: 72px; }
        .ap-table .col-sport { color: var(--gray-muted); width: 54px; text-transform: uppercase; }
        .ap-table .col-pick a { color: var(--fg); text-decoration: none; }
        .ap-table .col-pick a:hover { color: var(--jade); }
        .ap-table .col-line { color: var(--gray-muted); white-space: nowrap; width: 100px; }
        .ap-table .col-stars { color: var(--gold); font-size: 11px; letter-spacing: 1px; width: 60px; white-space: nowrap; }
        .ap-table .col-result { width: 60px; }
        .ap-table .col-units { font-weight: 600; white-space: nowrap; width: 60px; text-align: right; }
        .ap-table .units-pos { color: var(--jade); }
        .ap-table .units-neg { color: #d97766; }
        .ap-table .units-flat { color: var(--gray-muted); }

        .result-pill { display: inline-block; padding: 2px 9px; font-size: 10px; font-weight: 600; letter-spacing: 0.08em; }
        .result-pill.W { background: rgba(74, 222, 128, 0.14); color: var(--jade); }
        .result-pill.L { background: rgba(217, 119, 102, 0.14); color: #d97766; }
        .result-pill.Push { background: rgba(180, 180, 180, 0.14); color: var(--cream); }

        .pagination { padding: 18px 48px 36px; display: flex; justify-content: center; align-items: center; gap: 6px; }
        .pagination a, .pagination span { font-family: var(--font-ui); font-size: 12px; padding: 6px 12px; color: var(--gray-muted); text-decoration: none; border-radius: 6px; }
        .pagination a:hover { color: var(--fg); background: var(--bg-2); }
        .pagination .current { background: rgba(74, 222, 128, 0.14); color: var(--jade); font-weight: 600; }
        .pagination .ellipsis { color: var(--gray-muted); }

        .empty-state { padding: 80px 48px; text-align: center; font-style: italic; color: var(--gray-muted); font-family: var(--font-prose); font-size: 16px; line-height: 1.7; }

        .disclaimer { padding: 12px 48px 48px; font-size: 11px; color: var(--gray-muted); font-style: italic; max-width: 760px; margin: 0 auto; text-align: center; line-height: 1.7; }

        @media (max-width: 768px) {
          .ap-backbar { padding: 20px 20px 0; }
          .ap-hero { padding: 18px 20px 22px; }
          .ap-headline { font-size: 38px; }
          .ap-summary { padding: 0 20px 16px; }
          .summary-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .summary-value { font-size: 20px; }
          .tier-card { margin: 0 20px 18px; }
          .tier-grid { grid-template-columns: repeat(2, 1fr); }
          .ap-filters { padding: 0 20px 10px; }
          .range-select { margin-left: 0; }
          .ap-meta-row { padding: 4px 20px 10px; }
          .ap-table-wrap { padding: 0 16px 18px; }
          .pagination { padding: 14px 20px 32px; }
          .disclaimer { padding: 8px 20px 36px; }

          /* --- Mobile: render each row as a stacked card (no more clipped columns) --- */
          .ap-table { border: none; }
          .ap-table thead { display: none; }
          .ap-table tr {
            display: block;
            position: relative;
            background: var(--bg-2);
            border: 1px solid var(--border-subtle);
            border-radius: 10px;
            padding: 14px 16px;
            margin-bottom: 12px;
          }
          .ap-table tr:hover td { background: transparent; }
          .ap-table td {
            display: block;
            padding: 0;
            border-bottom: none;
            font-size: 13px;
            white-space: normal;
            width: auto !important;
          }
          .ap-table tr:last-child td { border-bottom: none; }

          /* Pick (the game-title link) is the card headline */
          .ap-table .col-pick { font-size: 16px; font-weight: 600; line-height: 1.25; padding-right: 56px; margin-bottom: 8px; }
          .ap-table .col-pick a { color: var(--fg); }

          /* Line/odds + stars come back as a small meta line */
          .ap-table .col-line { font-size: 12px; color: var(--gray-muted); display: inline; }
          .ap-table .col-stars { font-size: 13px; display: inline; margin-left: 8px; }

          /* Bottom meta row */
          .ap-table .col-date,
          .ap-table .col-sport { display: inline; font-size: 12px; }
          .ap-table .col-date::after { content: ' · '; color: var(--border-subtle); }

          /* Result pill top-right; Units below the meta line */
          .ap-table .col-result { position: absolute; top: 14px; right: 16px; }
          .ap-table .col-units { display: block; text-align: left; margin-top: 8px; font-size: 14px; }
          .ap-table .col-units::before { content: 'Net: '; color: var(--gray-muted); font-weight: 400; font-size: 12px; }
        }
      `}</style>

      <div className="ap-backbar"><Link href="/track-record">← Track Record</Link></div>

      <div className="ap-hero">
        <h1 className="ap-headline">All Picks.</h1>
        <div className="ap-meta">{graded.length} graded picks · since launch</div>
      </div>

      <div className="ap-summary">
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-label">Record</div>
            <div className="summary-value">{summary.w}-{summary.l}-{summary.p}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Units</div>
            <div className={`summary-value ${summary.units >= 0 ? 'jade' : 'neg'}`}>{summary.units >= 0 ? '+' : ''}{summary.units.toFixed(2)}u</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">ROI</div>
            <div className={`summary-value ${roiPct(summary) >= 0 ? 'jade' : 'neg'}`}>{roiPct(summary) >= 0 ? '+' : ''}{roiPct(summary).toFixed(1)}%</div>
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

      <div className="tier-card">
        <div className="tier-card-label">ROI by confidence tier</div>
        <div className="tier-grid">
          {[5, 4, 3, 2].map((s) => {
            const b = byTier[s];
            const r = roiPct(b);
            const cls = b.count === 0 ? 'flat' : (r >= 0 ? 'jade' : 'neg');
            return (
              <div key={s} className="tier-cell">
                <div className="tier-head">{'★'.repeat(s)} · {UNITS_BY_STAR[s]}u</div>
                <div className={`tier-roi ${cls}`}>{b.count === 0 ? '—' : `${r >= 0 ? '+' : ''}${r.toFixed(1)}%`}</div>
                <div className="tier-sub">{b.count > 0 ? `${b.w}-${b.l}${b.p ? `-${b.p}` : ''}` : 'no picks yet'}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="ap-filters">
        <span className="filter-label">Sport</span>
        {sportChips.map((c) => (
          <Link key={c.key} href={chipHref(c.key)} className={`chip ${sportFilter === c.key ? 'active' : ''}`}>
            {c.label}
          </Link>
        ))}
        <form method="get" id="ap-range-form" style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          {sportFilter !== 'all' && <input type="hidden" name="sport" value={sportFilter} />}
          <span className="filter-label">Date</span>
          <select name="range" defaultValue={rangeFilter} className="range-select" id="ap-range-select">
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
            __html: `(function(){var s=document.getElementById('ap-range-select');if(s){s.addEventListener('change',function(){var f=document.getElementById('ap-range-form');if(f)f.submit();});}})();`,
          }}
        />
      </div>

      {visible.length === 0 ? (
        <div className="empty-state">
          <p>No graded picks match these filters yet.</p>
          <p style={{ marginTop: 12, fontSize: 13 }}><Link href="/track-record/all" style={{ color: 'var(--gold)' }}>→ Clear filters</Link></p>
        </div>
      ) : (
        <>
          <div className="ap-meta-row">
            <span>Showing {startCount}–{endCount} of {visible.length}</span>
            <span>Sort: <span style={{ color: 'var(--jade)' }}>Most recent ↓</span></span>
          </div>

          <div className="ap-table-wrap">
            <table className="ap-table">
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
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              {safePage > 1 ? <Link href={pageHref(safePage - 1)}>←</Link> : <span style={{ opacity: 0.3 }}>←</span>}
              {from > 1 && <><Link href={pageHref(1)}>1</Link>{from > 2 && <span className="ellipsis">…</span>}</>}
              {pageNumbers.map((n) => (
                n === safePage
                  ? <span key={n} className="current">{n}</span>
                  : <Link key={n} href={pageHref(n)}>{n}</Link>
              ))}
              {to < totalPages && <>{to < totalPages - 1 && <span className="ellipsis">…</span>}<Link href={pageHref(totalPages)}>{totalPages}</Link></>}
              {safePage < totalPages ? <Link href={pageHref(safePage + 1)}>→</Link> : <span style={{ opacity: 0.3 }}>→</span>}
            </div>
          )}
        </>
      )}

      <div className="disclaimer">
        Unit sizing per Track Record Spec: 5★=3u · 4★=2u · 3★=1u · 2★=0.5u · 1★ informational only. CLV column coming once closing-line capture ships. Voids excluded. ROI is for record-keeping; not investment advice.
      </div>
    </>
  );
}
