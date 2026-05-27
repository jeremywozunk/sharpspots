import client from './contentful';
import Link from 'next/link';

interface GamePick {
  sys: { id: string };
  fields: {
    title: string;
    slug: string;
    league: string;
    teams: string;
    playToLine: string;
    evPercentage: string;
    gameDate: string;
    tipoffIso?: string;
    pageType?: 'pick' | 'no-pick';
    confidenceScore: number;
    analysisParagraph1: any;
  };
}

function StarRating({ score }: { score: number }) {
  return (
    <div className="star-rating" style={{ color: 'var(--jade)', fontSize: 14, letterSpacing: 3 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= score ? 'var(--jade)' : 'var(--star-empty)' }}>
          ★
        </span>
      ))}
      <div className="metric-tip">
        <strong>Confidence</strong> measures how many of our three independent pillars (statistical, sharp money, situational) agree on the same side. More stars = more pillars firing together. <strong>5★</strong> = 3u, <strong>4★</strong> = 2u, <strong>3★</strong> = 1u, <strong>2★</strong> = 0.5u, <strong>1★</strong> = informational only.
      </div>
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

function buildGameUrl(pick: GamePick): string {
  // Prefer plain gameDate (YYYY-MM-DD) since the URL date should match
  // the same value the n8n slug builder used. Fall back to deriving from
  // tipoffIso if gameDate is missing.
  const dateStr = (pick.fields.gameDate || '').slice(0, 10)
    || (pick.fields.tipoffIso ? new Date(pick.fields.tipoffIso).toISOString().split('T')[0] : '');
  const league = pick.fields.league.toLowerCase();
  return `/${league}/picks/${dateStr}/${pick.fields.slug}`;
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

async function getTodaysGames(): Promise<GamePick[]> {
  // Compute today's ET calendar window so yesterday's picks fall off
  // automatically when the date rolls over. Same Intl-based offset probe
  // as /[league]/page.tsx — handles DST without hardcoding.
  const now = new Date();
  const etParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const etYear = etParts.find(p => p.type === 'year')!.value;
  const etMonth = etParts.find(p => p.type === 'month')!.value;
  const etDay = etParts.find(p => p.type === 'day')!.value;

  const probe = new Date(`${etYear}-${etMonth}-${etDay}T12:00:00Z`);
  const probeHourET = parseInt(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', hour: '2-digit', hour12: false,
  }).format(probe), 10);
  const etOffsetHours = 12 - probeHourET;

  // Use exact-date equality on the ET calendar day. The Contentful gameDate
  // field is a DATE type (YYYY-MM-DD), and [gte]/[lte] range queries against
  // ISO timestamps do lexical string comparison, which produces wrong results
  // ("2026-05-21" < "2026-05-21T04:00:00Z"). See [league]/page.tsx for full
  // diagnosis. May 21, 2026 fix.
  const todayEtCalendar = `${etYear}-${etMonth}-${etDay}`;
  // Suppress the now-unused offset-derived UTC bounds — kept for parity in
  // case we ever need ISO timestamps for non-date filters.
  void etOffsetHours;

  const res = await client.getEntries({
    content_type: 'gamePick',
    'fields.status': 'live',
    'fields.gameDate': todayEtCalendar,
    order: ['fields.tipoffIso'],
    limit: 50,
  });
  return res.items as unknown as GamePick[];
}

export default async function Home() {
  const picks = await getTodaysGames();

  return (
    <>
      <style>{`
        .hero { padding: 80px 48px 64px; border-bottom: 1px solid var(--border-subtle); text-align: center; }
        .hero h1 { font-family: var(--font-display); font-style: italic; font-size: 44px; line-height: 1.18; margin-bottom: 18px; color: var(--fg); }
        .hero h1 em { font-style: italic; color: var(--jade); }
        .hero p { font-size: 14px; color: var(--gray-muted); line-height: 1.65; max-width: 580px; margin: 0 auto; }
        .section-header { display: flex; flex-direction: column; align-items: center; padding: 40px 48px 24px; gap: 10px; }
        .section-label { font-size: 11px; font-weight: 600; letter-spacing: 0.18em; color: var(--gray-muted); text-transform: uppercase; }
        .card-list { padding: 0 48px; }
        .card { padding: 28px 0 28px 28px; border-bottom: 1px solid var(--border-subtle); border-left: 1px solid var(--jade); display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; color: inherit; }
        .card:hover { background: rgba(74, 222, 128, 0.04); }
        .card-left { flex: 1; min-width: 0; }
        .edge-no { font-size: 10px; font-weight: 600; color: var(--jade); text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 10px; }
        .card-league { font-size: 10px; font-weight: 600; color: var(--gray-muted); text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 4px; }
        .card-title { font-family: var(--font-display); font-style: italic; font-weight: 700; font-size: 22px; line-height: 1.22; margin-bottom: 12px; color: var(--fg); }
        .card-teaser { font-family: var(--font-prose); font-size: 13px; color: var(--gray-muted); line-height: 1.6; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .play-stripe { display: inline-block; font-size: 10px; font-weight: 600; color: var(--jade); border-top: 2px solid var(--jade); border-bottom: 2px solid var(--jade); padding: 6px 14px; letter-spacing: 0.1em; text-transform: uppercase; }
        .card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; flex-shrink: 0; }
        .ev-badge { background: var(--jade); color: var(--bg); font-size: 11px; font-weight: 600; padding: 5px 12px; white-space: nowrap; letter-spacing: 0.08em; text-transform: uppercase; cursor: help; position: relative; }
        .no-edge-badge { background: transparent; color: var(--gray-muted); border: 1px solid var(--gray-muted); font-size: 11px; font-weight: 600; padding: 4px 11px; white-space: nowrap; letter-spacing: 0.08em; text-transform: uppercase; }
        .card.no-pick { border-left-color: var(--gray-muted); opacity: 0.92; }
        .no-pick-label { display: inline-block; font-size: 10px; font-weight: 600; color: var(--gray-muted); border-top: 2px solid var(--gray-muted); border-bottom: 2px solid var(--gray-muted); padding: 6px 14px; letter-spacing: 0.1em; text-transform: uppercase; }
        .star-rating { cursor: help; position: relative; }
        .metric-tip { position: absolute; right: 0; top: calc(100% + 8px); background: var(--bg); border: 1px solid var(--jade); padding: 10px 14px; width: 240px; z-index: 20; font-size: 11px; font-style: normal; color: var(--fg); line-height: 1.5; letter-spacing: 0.02em; text-transform: none; font-weight: 400; text-align: left; opacity: 0; pointer-events: none; transition: opacity 0.15s; }
        .metric-tip strong { color: var(--jade); font-weight: 600; }
        .ev-badge:hover .metric-tip, .star-rating:hover .metric-tip { opacity: 1; pointer-events: auto; }
        .view-link { font-size: 11px; color: var(--cream); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 500; }
        .empty { padding: 48px; font-family: var(--font-prose); font-style: italic; color: var(--gray-muted); font-size: 15px; text-align: center; }
        .hiw { padding: 80px 48px; background: var(--bg-2); border-top: 1px solid var(--border-subtle); margin-top: 60px; }
        .hiw-title { font-family: var(--font-display); font-style: italic; font-weight: 700; font-size: 28px; margin-bottom: 36px; color: var(--fg); text-align: center; }
        .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1100px; margin: 0 auto; }
        .step { background: var(--bg); border: 1px solid var(--border-subtle); border-top: 2px solid var(--jade); padding: 32px 28px; }
        .step-num { font-family: var(--font-brand); font-size: 22px; color: var(--jade); margin-bottom: 14px; letter-spacing: 0.12em; }
        .step-text { font-family: var(--font-prose); font-size: 14px; color: var(--fg); line-height: 1.65; }
        .confidence-scale { padding: 36px 48px 32px; border-bottom: 1px solid var(--border-subtle); background: var(--bg); }
        .cs-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 18px; max-width: 1100px; margin-left: auto; margin-right: auto; }
        .cs-eyebrow { font-size: 10px; color: var(--fg); letter-spacing: 0.18em; text-transform: uppercase; font-weight: 600; }
        .cs-hint { font-family: var(--font-display); font-style: italic; font-size: 12px; color: var(--fg); }
        .cs-bar { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; margin: 0 auto 16px; max-width: 1100px; }
        .cs-bar-seg { height: 4px; }
        .cs-bar-seg.s1 { background: rgba(200, 169, 106, 0.22); }
        .cs-bar-seg.s2 { background: rgba(200, 169, 106, 0.42); }
        .cs-bar-seg.s3 { background: rgba(200, 169, 106, 0.62); }
        .cs-bar-seg.s4 { background: rgba(200, 169, 106, 0.82); }
        .cs-bar-seg.s5 { background: var(--gold); }
        .cs-labels { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; max-width: 1100px; margin: 0 auto; }
        .cs-cell { text-align: left; }
        .cs-stars { font-size: 13px; letter-spacing: 3px; margin-bottom: 6px; color: var(--gold); }
        .cs-stars .empty { color: var(--star-empty); }
        .cs-tier { font-size: 10px; color: var(--fg); letter-spacing: 0.08em; text-transform: uppercase; line-height: 1.4; }
        .cs-cell.high .cs-tier { color: var(--fg); font-weight: 600; }
        .ev-scale { padding: 36px 48px 32px; border-bottom: 1px solid var(--border-subtle); background: var(--bg); }
        .ev-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 18px; max-width: 1100px; margin-left: auto; margin-right: auto; }
        .ev-eyebrow { font-size: 10px; color: var(--fg); letter-spacing: 0.18em; text-transform: uppercase; font-weight: 600; }
        .ev-hint { font-family: var(--font-display); font-style: italic; font-size: 12px; color: var(--fg); }
        .ev-bar { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; margin: 0 auto 16px; max-width: 1100px; }
        .ev-bar-seg { height: 4px; }
        .ev-bar-seg.e1 { background: rgba(74, 222, 128, 0.22); }
        .ev-bar-seg.e2 { background: rgba(74, 222, 128, 0.42); }
        .ev-bar-seg.e3 { background: rgba(74, 222, 128, 0.62); }
        .ev-bar-seg.e4 { background: rgba(74, 222, 128, 0.82); }
        .ev-bar-seg.e5 { background: var(--jade); }
        .ev-labels { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; max-width: 1100px; margin: 0 auto; }
        .ev-cell { text-align: left; }
        .ev-range { font-size: 13px; letter-spacing: 0.02em; margin-bottom: 6px; color: var(--jade); font-weight: 600; }
        .ev-tier { font-size: 10px; color: var(--fg); letter-spacing: 0.08em; text-transform: uppercase; line-height: 1.4; }
        .ev-cell.high .ev-tier { font-weight: 600; }
        .scale-bridge { padding: 22px 48px; text-align: center; background: var(--bg-2); border-bottom: 1px solid var(--border-subtle); }
        .scale-bridge p { font-family: var(--font-display); font-style: italic; font-size: 14px; color: var(--fg); max-width: 760px; margin: 0 auto; line-height: 1.6; }
        .scale-bridge strong { color: var(--jade); font-style: normal; font-weight: 600; }
        @media (max-width: 768px) {
          .hero { padding: 52px 20px 40px; }
          .hero h1 { font-size: 30px; }
          .section-header { padding: 28px 20px 16px; }
          .card-list { padding: 0 20px; }
          .card { padding: 22px 0 22px 18px; flex-direction: column; gap: 14px; }
          .card-title { font-size: 19px; }
          .card-teaser { display: none; }
          .card-right { align-items: flex-start; flex-direction: row; flex-wrap: wrap; gap: 10px; }
          .hiw { padding: 56px 20px; }
          .steps { grid-template-columns: 1fr; gap: 18px; }
          .confidence-scale { padding: 28px 20px 24px; }
          .cs-header { margin-bottom: 14px; }
          .cs-hint { display: none; }
          .cs-tier { font-size: 9px; letter-spacing: 0.04em; }
          .cs-stars { font-size: 11px; letter-spacing: 2px; }
          .ev-scale { padding: 28px 20px 24px; }
          .ev-header { margin-bottom: 14px; }
          .ev-hint { display: none; }
          .ev-tier { font-size: 9px; letter-spacing: 0.04em; }
          .ev-range { font-size: 11px; }
          .scale-bridge { padding: 18px 20px; }
          .scale-bridge p { font-size: 12px; }
        }
      `}</style>

      <div className="hero">
        <h1>
          Sports betting analysis,
          <br />
          driven by <em>artificial intelligence.</em>
        </h1>
        <p>Every game on today&apos;s slate is analyzed and listed below in chronological order.</p>
      </div>

      <section className="confidence-scale" aria-label="How to read confidence ratings">
        <div className="cs-header">
          <div className="cs-eyebrow">Confidence Scale</div>
          <div className="cs-hint">More stars = more signals agreeing</div>
        </div>
        <div className="cs-bar" aria-hidden="true">
          <div className="cs-bar-seg s1"></div>
          <div className="cs-bar-seg s2"></div>
          <div className="cs-bar-seg s3"></div>
          <div className="cs-bar-seg s4"></div>
          <div className="cs-bar-seg s5"></div>
        </div>
        <div className="cs-labels">
          <div className="cs-cell">
            <div className="cs-stars">★</div>
            <div className="cs-tier">Lowest<br/>Confidence</div>
          </div>
          <div className="cs-cell">
            <div className="cs-stars">★★</div>
            <div className="cs-tier">Low</div>
          </div>
          <div className="cs-cell">
            <div className="cs-stars">★★★</div>
            <div className="cs-tier">Moderate</div>
          </div>
          <div className="cs-cell">
            <div className="cs-stars">★★★★</div>
            <div className="cs-tier">High</div>
          </div>
          <div className="cs-cell high">
            <div className="cs-stars">★★★★★</div>
            <div className="cs-tier">Highest<br/>Confidence</div>
          </div>
        </div>
      </section>

      <section className="ev-scale" aria-label="How to read EV percentages">
        <div className="ev-header">
          <div className="ev-eyebrow">Edge Scale (EV)</div>
          <div className="ev-hint">Higher EV = larger sportsbook mispricing</div>
        </div>
        <div className="ev-bar" aria-hidden="true">
          <div className="ev-bar-seg e1"></div>
          <div className="ev-bar-seg e2"></div>
          <div className="ev-bar-seg e3"></div>
          <div className="ev-bar-seg e4"></div>
          <div className="ev-bar-seg e5"></div>
        </div>
        <div className="ev-labels">
          <div className="ev-cell">
            <div className="ev-range">+3% – 10%</div>
            <div className="ev-tier">Modest<br/>Edge</div>
          </div>
          <div className="ev-cell">
            <div className="ev-range">10% – 20%</div>
            <div className="ev-tier">Real</div>
          </div>
          <div className="ev-cell">
            <div className="ev-range">20% – 35%</div>
            <div className="ev-tier">Strong</div>
          </div>
          <div className="ev-cell">
            <div className="ev-range">35% – 50%</div>
            <div className="ev-tier">Very Strong</div>
          </div>
          <div className="ev-cell high">
            <div className="ev-range">50%+</div>
            <div className="ev-tier">Outlier<br/>Edge</div>
          </div>
        </div>
      </section>

      <div className="scale-bridge">
        <p>
          <strong>EV is the size of the edge. Stars are the strength of the signal</strong>
          {' '}— both surfaced by AI-driven Python models that re-evaluate the market every morning.
        </p>
      </div>

      <div className="section-header">
        <div className="section-label">Today&apos;s Games</div>
      </div>

      <div className="card-list">
        {picks.length === 0 && (
          <div className="empty">No games on the slate today. Check back tomorrow morning.</div>
        )}
        {picks.map((pick, idx) => {
          const isNoPick = pick.fields.pageType === 'no-pick';
          const timeStr = getGameTimeDisplay(pick.fields.tipoffIso || pick.fields.gameDate);
          return (
            <Link key={pick.sys.id} href={buildGameUrl(pick)} className={`card${isNoPick ? ' no-pick' : ''}`}>
              <div className="card-left">
                <div className="edge-no">
                  {isNoPick ? 'No Edge' : `Edge No. ${String(idx + 1).padStart(3, '0')}`}
                </div>
                <div className="card-league">{(pick.fields.league || '').toUpperCase()} - {timeStr}</div>
                <div className="card-title">{pick.fields.title}</div>
                {pick.fields.analysisParagraph1 && (
                  <div className="card-teaser">{getTeaserFromRichText(pick.fields.analysisParagraph1)}</div>
                )}
                {isNoPick ? (
                  <div className="no-pick-label">Market priced fairly</div>
                ) : (
                  <div className="play-stripe">{pick.fields.playToLine}</div>
                )}
              </div>
              <div className="card-right">
                {isNoPick ? (
                  <span className="no-edge-badge">No Edge</span>
                ) : (
                  <>
                    <span className="ev-badge">
                      {pick.fields.evPercentage} EV
                      <span className="metric-tip">
                        <strong>EV (Expected Value)</strong> is the model&apos;s edge against the sportsbook&apos;s price. <strong>+10% EV</strong> means a $100 bet returns $10 in expected profit over the long run, assuming the model is calibrated. Big underdog plays at long odds (e.g. +500 or more) tend to show very high EV but should be paired with high confidence (★) before sizing up.
                      </span>
                    </span>
                    <StarRating score={pick.fields.confidenceScore} />
                  </>
                )}
                <span className="view-link">View Analysis</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="hiw">
        <div className="hiw-title">How SharpSpots works</div>
        <div className="steps">
          <div className="step">
            <div className="step-num">01</div>
            <div className="step-text">We scan every game across all major leagues every morning.</div>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <div className="step-text">Our three-pillar model finds where the sportsbook is mispriced.</div>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <div className="step-text">You get the edge, explained in plain language.</div>
          </div>
        </div>
      </div>
    </>
  );
}
