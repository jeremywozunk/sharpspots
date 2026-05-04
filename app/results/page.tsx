'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
} from 'recharts';

// ============================================================================
// TYPES
// ============================================================================

type ResultPick = {
  slug: string;
  league: string;
  gameDate: string;
  result: 'win' | 'loss' | 'push' | 'pending';
  unitsWonLost: number;
  confidenceScore: number;
  gradedAt: string | null;
};

type AggregateStats = {
  total: number;
  wins: number;
  losses: number;
  pushes: number;
  units: number;
  roi: number;
  winRate: number;
};

type ChartPoint = { date: string; units: number };

// ============================================================================
// PLACEHOLDER DATA (delete once Contentful is wired)
// ============================================================================
// Returns an empty array so the page renders the empty-state at launch.
// When n8n grades picks and writes results back to Contentful, replace
// this with a real fetch from Contentful.
async function fetchGradedPicks(): Promise<ResultPick[]> {
  // TODO: Replace with Contentful query for picks where result != 'pending'
  return [];
}

// ============================================================================
// HELPERS
// ============================================================================

function getCurrentQuarter(): { label: string; start: Date; end: Date } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const q = Math.floor(month / 3) + 1;
  const startMonth = (q - 1) * 3;
  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 0, 23, 59, 59);
  return { label: `Q${q} ${year}`, start, end };
}

function filterByDateRange(
  picks: ResultPick[],
  start: Date,
  end: Date
): ResultPick[] {
  return picks.filter((p) => {
    const d = new Date(p.gameDate);
    return d >= start && d <= end;
  });
}

function calculateStats(picks: ResultPick[]): AggregateStats {
  const graded = picks.filter((p) => p.result !== 'pending');
  const wins = graded.filter((p) => p.result === 'win').length;
  const losses = graded.filter((p) => p.result === 'loss').length;
  const pushes = graded.filter((p) => p.result === 'push').length;
  const units = graded.reduce((sum, p) => sum + (p.unitsWonLost || 0), 0);
  const decided = wins + losses;
  const winRate = decided > 0 ? (wins / decided) * 100 : 0;
  const totalRisked = graded.length;
  const roi = totalRisked > 0 ? (units / totalRisked) * 100 : 0;
  return {
    total: graded.length,
    wins,
    losses,
    pushes,
    units: Math.round(units * 100) / 100,
    roi: Math.round(roi * 10) / 10,
    winRate: Math.round(winRate * 10) / 10,
  };
}

function buildCumulativeCurve(picks: ResultPick[]): ChartPoint[] {
  const sorted = [...picks]
    .filter((p) => p.result !== 'pending')
    .sort(
      (a, b) =>
        new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime()
    );
  let running = 0;
  const points: ChartPoint[] = [{ date: 'Start', units: 0 }];
  sorted.forEach((p) => {
    running += p.unitsWonLost || 0;
    const d = new Date(p.gameDate);
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    points.push({ date: label, units: Math.round(running * 100) / 100 });
  });
  return points;
}

function statsByConfidence(
  picks: ResultPick[]
): { tier: string; roi: number; n: number }[] {
  const tiers = [1, 2, 3, 4, 5];
  return tiers.map((t) => {
    const subset = picks.filter(
      (p) => p.confidenceScore === t && p.result !== 'pending'
    );
    const stats = calculateStats(subset);
    return { tier: `${t}\u2605`, roi: stats.roi, n: stats.total };
  });
}

function statsByLeague(
  picks: ResultPick[]
): { league: string; winRate: number; n: number }[] {
  const leagues = [...new Set(picks.map((p) => p.league))];
  return leagues
    .map((l) => {
      const subset = picks.filter((p) => p.league === l);
      const stats = calculateStats(subset);
      return { league: l, winRate: stats.winRate, n: stats.total };
    })
    .filter((x) => x.n > 0)
    .sort((a, b) => b.winRate - a.winRate);
}

// ============================================================================
// PAGE
// ============================================================================

export default function ResultsPage() {
  const [picks, setPicks] = useState<ResultPick[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGradedPicks().then((data) => {
      setPicks(data);
      setLoading(false);
    });
  }, []);

  const quarter = getCurrentQuarter();
  const quarterPicks = filterByDateRange(picks, quarter.start, quarter.end);
  const quarterStats = calculateStats(quarterPicks);
  const lifetimeStats = calculateStats(picks);
  const curve = buildCumulativeCurve(quarterPicks);
  const confData = statsByConfidence(quarterPicks);
  const leagueData = statsByLeague(quarterPicks);

  const hasData = quarterStats.total > 0;

  return (
    <main style={{ background: '#fff', color: '#1a1a1a' }}>
      {/* HERO */}
      <section
        style={{
          background: '#f9f6f0',
          padding: '64px 24px 48px',
          borderBottom: '1px solid #e8e0d0',
        }}
      >
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: 2,
              color: '#2d8c3e',
              textTransform: 'uppercase',
              margin: 0,
              marginBottom: 12,
            }}
          >
            Track Record &middot; {quarter.label}
          </p>
          <h1
            style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(36px, 6vw, 56px)',
              lineHeight: 1.05,
              margin: 0,
              marginBottom: 20,
              textTransform: 'uppercase',
            }}
          >
            Every Pick. Every Result.
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.6,
              color: '#3d3d3d',
              margin: 0,
              maxWidth: 720,
            }}
          >
            Algorithmic models go through cold streaks. Honest tracking shows
            you the full picture, including the rough patches. Current quarter
            performance below, with lifetime totals and historical quarters
            preserved further down the page.
          </p>
        </div>
      </section>

      {/* QUARTER HERO STATS + CHART */}
      <section style={{ padding: '48px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#888', padding: '60px 0' }}>
              Loading results...
            </p>
          ) : !hasData ? (
            <EmptyState />
          ) : (
            <>
              <StatRow stats={quarterStats} label={quarter.label} />
              <div style={{ marginTop: 40 }}>
                <ChartTitle>Cumulative Units &middot; {quarter.label}</ChartTitle>
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid #e8e0d0',
                    borderRadius: 8,
                    padding: 20,
                    height: 360,
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={curve}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: '#666' }}
                      />
                      <YAxis tick={{ fontSize: 12, fill: '#666' }} />
                      <Tooltip
                        contentStyle={{
                          background: '#1a1a1a',
                          border: 'none',
                          borderRadius: 6,
                          color: '#fff',
                        }}
                        labelStyle={{ color: '#b8860b' }}
                      />
                      <ReferenceLine y={0} stroke="#999" strokeDasharray="3 3" />
                      <Line
                        type="monotone"
                        dataKey="units"
                        stroke="#2d8c3e"
                        strokeWidth={3}
                        dot={{ fill: '#2d8c3e', r: 3 }}
                        activeDot={{ r: 6, fill: '#b8860b' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* BREAKDOWN CHARTS */}
      {hasData && (
        <section
          style={{
            padding: '48px 24px',
            background: '#f9f6f0',
            borderTop: '1px solid #e8e0d0',
            borderBottom: '1px solid #e8e0d0',
          }}
        >
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>
            <h2
              style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 800,
                fontSize: 32,
                margin: 0,
                marginBottom: 24,
                textTransform: 'uppercase',
              }}
            >
              Breakdown
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                gap: 20,
              }}
            >
              <ChartCard title="ROI by Confidence Tier">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={confData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                    <XAxis dataKey="tier" tick={{ fontSize: 13, fill: '#666' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#666' }} unit="%" />
                    <Tooltip
                      contentStyle={{
                        background: '#1a1a1a',
                        border: 'none',
                        borderRadius: 6,
                        color: '#fff',
                      }}
                      formatter={(value: number, _name, props) => [
                        `${value}% ROI (n=${props.payload.n})`,
                        'Return',
                      ]}
                    />
                    <Bar dataKey="roi" radius={[4, 4, 0, 0]}>
                      {confData.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={entry.roi >= 0 ? '#2d8c3e' : '#c44545'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Win Rate by League">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={leagueData}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12, fill: '#666' }}
                      unit="%"
                      domain={[0, 100]}
                    />
                    <YAxis
                      type="category"
                      dataKey="league"
                      tick={{ fontSize: 12, fill: '#666' }}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#1a1a1a',
                        border: 'none',
                        borderRadius: 6,
                        color: '#fff',
                      }}
                      formatter={(value: number, _name, props) => [
                        `${value}% (n=${props.payload.n})`,
                        'Win Rate',
                      ]}
                    />
                    <Bar dataKey="winRate" radius={[0, 4, 4, 0]} fill="#b8860b" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>
        </section>
      )}

      {/* LIFETIME BLOCK */}
      <section style={{ padding: '48px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: 2,
              color: '#b8860b',
              textTransform: 'uppercase',
              margin: 0,
              marginBottom: 8,
            }}
          >
            Since Launch
          </p>
          <h2
            style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800,
              fontSize: 32,
              margin: 0,
              marginBottom: 24,
              textTransform: 'uppercase',
            }}
          >
            Lifetime Performance
          </h2>
          {lifetimeStats.total === 0 ? (
            <p style={{ color: '#888', fontSize: 16 }}>
              Lifetime stats appear once results begin posting.
            </p>
          ) : (
            <CompactStatRow stats={lifetimeStats} />
          )}
        </div>
      </section>

      {/* HISTORICAL QUARTERS */}
      <section
        style={{
          padding: '48px 24px',
          background: '#f9f6f0',
          borderTop: '1px solid #e8e0d0',
        }}
      >
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800,
              fontSize: 32,
              margin: 0,
              marginBottom: 12,
              textTransform: 'uppercase',
            }}
          >
            Historical Quarters
          </h2>
          <p
            style={{
              fontSize: 15,
              color: '#3d3d3d',
              marginBottom: 24,
              maxWidth: 720,
            }}
          >
            Past quarters are preserved here permanently. Each quarter starts
            fresh on the chart above so cold or hot streaks can be evaluated in
            context, while the lifetime totals never reset.
          </p>
          <div
            style={{
              background: '#fff',
              border: '1px solid #e8e0d0',
              borderRadius: 8,
              padding: '32px 24px',
              textAlign: 'center',
              color: '#888',
            }}
          >
            <p style={{ margin: 0, fontSize: 15 }}>
              No completed quarters yet. The first archive will appear after{' '}
              {quarter.label} closes.
            </p>
          </div>
        </div>
      </section>

      {/* METHODOLOGY FOOTNOTE */}
      <section
        style={{
          padding: '40px 24px 64px',
          background: '#fff',
          borderTop: '1px solid #e8e0d0',
        }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: 2,
              color: '#888',
              textTransform: 'uppercase',
              margin: 0,
              marginBottom: 12,
            }}
          >
            How to read this page
          </p>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: '#666',
              margin: 0,
            }}
          >
            Units assume a flat 1-unit risk per pick. ROI is total units
            won/lost divided by total picks placed, expressed as a percentage.
            Win rate excludes pushes. Past performance does not indicate future
            results. SharpSpots provides algorithmic analysis for entertainment
            purposes only.
          </p>
        </div>
      </section>
    </main>
  );
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

function StatRow({
  stats,
  label,
}: {
  stats: AggregateStats;
  label: string;
}) {
  const unitsColor =
    stats.units > 0 ? '#2d8c3e' : stats.units < 0 ? '#c44545' : '#666';
  return (
    <div>
      <p
        style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 800,
          fontSize: 14,
          letterSpacing: 2,
          color: '#b8860b',
          textTransform: 'uppercase',
          margin: 0,
          marginBottom: 8,
        }}
      >
        Current Quarter &middot; {label}
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16,
          marginTop: 12,
        }}
      >
        <BigStat label="Record" value={`${stats.wins}-${stats.losses}-${stats.pushes}`} />
        <BigStat
          label="Units"
          value={stats.units > 0 ? `+${stats.units}` : `${stats.units}`}
          color={unitsColor}
        />
        <BigStat
          label="ROI"
          value={`${stats.roi > 0 ? '+' : ''}${stats.roi}%`}
          color={unitsColor}
        />
        <BigStat label="Win Rate" value={`${stats.winRate}%`} />
      </div>
    </div>
  );
}

function CompactStatRow({ stats }: { stats: AggregateStats }) {
  const unitsColor =
    stats.units > 0 ? '#2d8c3e' : stats.units < 0 ? '#c44545' : '#666';
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 16,
      }}
    >
      <SmallStat label="Record" value={`${stats.wins}-${stats.losses}-${stats.pushes}`} />
      <SmallStat
        label="Units"
        value={stats.units > 0 ? `+${stats.units}` : `${stats.units}`}
        color={unitsColor}
      />
      <SmallStat
        label="ROI"
        value={`${stats.roi > 0 ? '+' : ''}${stats.roi}%`}
        color={unitsColor}
      />
      <SmallStat label="Win Rate" value={`${stats.winRate}%`} />
    </div>
  );
}

function BigStat({
  label,
  value,
  color = '#1a1a1a',
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: '#fff',
        borderLeft: '4px solid #2d8c3e',
        borderRadius: 6,
        padding: '20px 22px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <p
        style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: 1.5,
          color: '#888',
          textTransform: 'uppercase',
          margin: 0,
          marginBottom: 6,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 800,
          fontSize: 36,
          margin: 0,
          color,
          lineHeight: 1,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function SmallStat({
  label,
  value,
  color = '#1a1a1a',
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e8e0d0',
        borderRadius: 6,
        padding: '14px 18px',
      }}
    >
      <p
        style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: 1.5,
          color: '#888',
          textTransform: 'uppercase',
          margin: 0,
          marginBottom: 4,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 800,
          fontSize: 24,
          margin: 0,
          color,
          lineHeight: 1,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function ChartTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: 'Barlow Condensed, sans-serif',
        fontWeight: 800,
        fontSize: 24,
        margin: 0,
        marginBottom: 16,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </h2>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e8e0d0',
        borderRadius: 8,
        padding: 20,
      }}
    >
      <h3
        style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 800,
          fontSize: 18,
          margin: 0,
          marginBottom: 12,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        background: '#f9f6f0',
        border: '2px dashed #d4c5a0',
        borderRadius: 12,
        padding: '60px 32px',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 800,
          fontSize: 14,
          letterSpacing: 2,
          color: '#b8860b',
          textTransform: 'uppercase',
          margin: 0,
          marginBottom: 12,
        }}
      >
        Track Record Begins Soon
      </p>
      <h2
        style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 800,
          fontSize: 32,
          margin: 0,
          marginBottom: 16,
          textTransform: 'uppercase',
          color: '#1a1a1a',
        }}
      >
        First Results Posting Soon
      </h2>
      <p
        style={{
          fontSize: 16,
          lineHeight: 1.6,
          color: '#3d3d3d',
          margin: 0,
          maxWidth: 520,
          marginInline: 'auto',
        }}
      >
        Every pick gets graded after the game ends. Once results start
        posting, this page will show the running record, units, ROI, and
        performance breakdowns by league and confidence tier.
      </p>
    </div>
  );
}