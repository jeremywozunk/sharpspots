import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Responsible Gambling | SharpSpots',
  description:
    'Sports betting should be entertainment. Find national and state helplines, warning signs of problem gambling, and self-exclusion resources.',
  alternates: { canonical: 'https://sharpspots.com/responsible-gambling' },
  robots: { index: true, follow: true },
};

const STATE_HELPLINES = [
  {
    state: 'New Jersey',
    abbr: 'NJ',
    phone: '1-800-GAMBLER',
    phoneHref: 'tel:18004262537',
    org: 'Council on Compulsive Gambling of NJ',
    url: 'https://www.800gambler.org',
  },
  {
    state: 'Pennsylvania',
    abbr: 'PA',
    phone: '1-800-GAMBLER',
    phoneHref: 'tel:18004262537',
    org: 'PA Council on Compulsive Gambling',
    url: 'https://www.pacouncil.com',
  },
  {
    state: 'New York',
    abbr: 'NY',
    phone: '1-877-846-7369',
    phoneHref: 'tel:18778467369',
    org: 'NY Council on Problem Gambling',
    url: 'https://nyproblemgamblinghelp.org',
  },
  {
    state: 'Michigan',
    abbr: 'MI',
    phone: '1-800-270-7117',
    phoneHref: 'tel:18002707117',
    org: 'MI Department of Health',
    url: 'https://www.michigan.gov/mdhhs',
  },
  {
    state: 'Colorado',
    abbr: 'CO',
    phone: '1-800-522-4700',
    phoneHref: 'tel:18005224700',
    org: 'Problem Gambling Coalition of Colorado',
    url: 'https://problemgamblingcolorado.org',
  },
  {
    state: 'Illinois',
    abbr: 'IL',
    phone: '1-800-426-2537',
    phoneHref: 'tel:18004262537',
    org: 'Illinois Are You Really Winning',
    url: 'https://www.areyoureallywinning.com',
  },
  {
    state: 'Massachusetts',
    abbr: 'MA',
    phone: '1-800-327-5050',
    phoneHref: 'tel:18003275050',
    org: 'MA Council on Gaming and Health',
    url: 'https://masscompulsivegambling.org',
  },
];

const WARNING_SIGNS = [
  'Spending more time or money on betting than you intended',
  'Chasing losses by placing larger or riskier bets to recover',
  'Lying to family or friends about how much you bet',
  'Betting with money meant for bills, rent, or essentials',
  'Feeling restless, anxious, or irritable when not betting',
  'Borrowing money or selling possessions to fund bets',
  'Letting betting interfere with work, school, or relationships',
  'Repeatedly trying to cut back without success',
];

const SPORTSBOOK_TOOLS = [
  {
    title: 'Deposit limits',
    body: 'Cap how much you can deposit per day, week, or month. Once set, lowering the cap is instant; raising it usually takes 24+ hours.',
  },
  {
    title: 'Time limits',
    body: 'Set a maximum amount of time you can be logged in. The app will lock you out when the limit is reached.',
  },
  {
    title: 'Cooling-off period',
    body: 'A short, voluntary break (typically 24 hours to 30 days) where you cannot place bets but your account stays open.',
  },
  {
    title: 'Self-exclusion',
    body: 'A formal, longer-term ban (often 1 year, 5 years, or lifetime) enforced by the sportsbook and, in regulated states, across all licensed operators.',
  },
];

export default function ResponsibleGamblingPage() {
  return (
    <main style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      {/* HERO */}
      <section
        style={{
          background: 'var(--bg-2)',
          padding: '64px 24px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: 2,
              color: 'var(--jade)',
              textTransform: 'uppercase',
              margin: 0,
              marginBottom: 12,
            }}
          >
            Play Smart
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
            Responsible Gambling
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.6,
              color: 'var(--fg)',
              margin: 0,
              maxWidth: 720,
            }}
          >
            Sports betting is entertainment. SharpSpots is for adults 21 and
            older in jurisdictions where sports betting is legal. If betting
            stops being fun or starts affecting your life, the resources on
            this page can help.
          </p>
        </div>
      </section>

      {/* NATIONAL HELPLINE BLOCK */}
      <section style={{ padding: '56px 24px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div
            style={{
              background: 'var(--bg)',
              border: '4px solid var(--jade)',
              borderRadius: 12,
              padding: '32px 28px',
              boxShadow: '0 4px 20px rgba(45, 140, 62, 0.08)',
            }}
          >
            <p
              style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: 2,
                color: 'var(--gold)',
                textTransform: 'uppercase',
                margin: 0,
                marginBottom: 8,
              }}
            >
              Free, confidential, 24/7
            </p>
            <h2
              style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 800,
                fontSize: 32,
                margin: 0,
                marginBottom: 16,
                textTransform: 'uppercase',
              }}
            >
              National Problem Gambling Helpline
            </h2>
            <a
              href="tel:18004262537"
              style={{
                display: 'inline-block',
                fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(36px, 7vw, 52px)',
                color: 'var(--jade)',
                textDecoration: 'none',
                margin: 0,
                marginBottom: 12,
                lineHeight: 1,
              }}
            >
              1-800-GAMBLER
            </a>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--fg)', margin: 0 }}>
              Call, text, or chat with the National Council on Problem Gambling.
              Available in every U.S. state.{' '}
              <a
                href="https://www.ncpgambling.org"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--gold)', fontWeight: 600 }}
              >
                ncpgambling.org →
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* STATE HELPLINES */}
      <section
        style={{
          padding: '56px 24px',
          background: 'var(--bg-2)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800,
              fontSize: 36,
              margin: 0,
              marginBottom: 12,
              textTransform: 'uppercase',
            }}
          >
            State Helplines
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: 'var(--fg)',
              margin: 0,
              marginBottom: 32,
              maxWidth: 720,
            }}
          >
            Many states run their own dedicated problem gambling resources. If
            your state is not listed, the national helpline above can connect
            you to local services.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {STATE_HELPLINES.map((s) => (
              <div
                key={s.abbr}
                style={{
                  background: 'var(--bg)',
                  borderLeft: '4px solid var(--jade)',
                  borderRadius: 8,
                  padding: '20px 22px',
                }}
              >
                <p
                  style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontWeight: 800,
                    fontSize: 13,
                    letterSpacing: 2,
                    color: 'var(--gold)',
                    textTransform: 'uppercase',
                    margin: 0,
                    marginBottom: 4,
                  }}
                >
                  {s.abbr}
                </p>
                <h3
                  style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontWeight: 800,
                    fontSize: 22,
                    margin: 0,
                    marginBottom: 10,
                    textTransform: 'uppercase',
                  }}
                >
                  {s.state}
                </h3>
                <a
                  href={s.phoneHref}
                  style={{
                    display: 'block',
                    fontSize: 20,
                    fontWeight: 700,
                    color: 'var(--jade)',
                    textDecoration: 'none',
                    marginBottom: 8,
                  }}
                >
                  {s.phone}
                </a>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 14,
                    color: 'var(--gray-muted)',
                    textDecoration: 'none',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  {s.org} →
                </a>
              </div>
            ))}
          </div>

          <p
            style={{
              fontSize: 13,
              color: 'var(--gray-muted)',
              marginTop: 24,
              fontStyle: 'italic',
            }}
          >
            State list current as of launch. We will expand this as more states
            regulate sports betting.
          </p>
        </div>
      </section>

      {/* WARNING SIGNS */}
      <section style={{ padding: '56px 24px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800,
              fontSize: 36,
              margin: 0,
              marginBottom: 12,
              textTransform: 'uppercase',
            }}
          >
            Warning Signs
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: 'var(--fg)',
              margin: 0,
              marginBottom: 28,
            }}
          >
            Problem gambling can affect anyone. If you recognize one or more
            of these patterns in yourself or someone close to you, it may be
            time to reach out for support.
          </p>

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gap: 12,
            }}
          >
            {WARNING_SIGNS.map((sign, i) => (
              <li
                key={i}
                style={{
                  background: 'var(--bg-2)',
                  borderLeft: '4px solid var(--gold)',
                  borderRadius: 6,
                  padding: '14px 18px',
                  fontSize: 16,
                  lineHeight: 1.5,
                  color: 'var(--fg)',
                }}
              >
                {sign}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SELF-EXCLUSION */}
      <section
        style={{
          padding: '56px 24px',
          background: 'var(--bg-2)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800,
              fontSize: 36,
              margin: 0,
              marginBottom: 16,
              textTransform: 'uppercase',
            }}
          >
            Self-Exclusion
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: 'var(--fg)',
              margin: 0,
              marginBottom: 16,
            }}
          >
            Self-exclusion is a voluntary process where you ask to be barred
            from gambling at sportsbooks for a defined period. In regulated
            states, signing up for a state-administered program will block
            your access across all licensed operators in that state, not just
            one app.
          </p>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: 'var(--fg)',
              margin: 0,
              marginBottom: 24,
            }}
          >
            Most states offer 1-year, 5-year, or lifetime options. Once
            enrolled, the exclusion typically cannot be reversed before the
            term ends.
          </p>
          <a
            href="https://www.ncpgambling.org/help-treatment/self-exclusion/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: 'var(--jade)',
              color: 'var(--fg)',
              padding: '14px 28px',
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none',
              fontFamily: 'Barlow Condensed, sans-serif',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            NCPG Self-Exclusion Resources →
          </a>
        </div>
      </section>

      {/* SPORTSBOOK TOOLS */}
      <section style={{ padding: '56px 24px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800,
              fontSize: 36,
              margin: 0,
              marginBottom: 12,
              textTransform: 'uppercase',
            }}
          >
            Tools That Help
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: 'var(--fg)',
              margin: 0,
              marginBottom: 28,
            }}
          >
            Every licensed sportsbook in the U.S. is required to offer these
            controls. Find them in the responsible gaming or account settings
            section of the app.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 16,
            }}
          >
            {SPORTSBOOK_TOOLS.map((t) => (
              <div
                key={t.title}
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border-subtle)',
                  borderTop: '4px solid var(--gold)',
                  borderRadius: 8,
                  padding: '22px 20px',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontWeight: 800,
                    fontSize: 22,
                    margin: 0,
                    marginBottom: 10,
                    textTransform: 'uppercase',
                  }}
                >
                  {t.title}
                </h3>
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: 'var(--fg)',
                    margin: 0,
                  }}
                >
                  {t.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUR COMMITMENTS */}
      <section
        style={{
          padding: '56px 24px',
          background: 'var(--bg-2)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800,
              fontSize: 36,
              margin: 0,
              marginBottom: 20,
              textTransform: 'uppercase',
            }}
          >
            What SharpSpots Commits To
          </h2>

          <div style={{ display: 'grid', gap: 14 }}>
            {[
              'We publish algorithmic analysis for entertainment and informational purposes. We do not promise wins or guaranteed returns.',
              'We never describe any pick as a "lock," "must-bet," or "guaranteed."',
              'We do not target users in jurisdictions where sports betting is illegal, and we suppress affiliate links in those regions.',
              'We surface a Track Record wall publicly so you can see real results, including losing stretches, and decide if our analysis is useful to you.',
              'We display responsible gambling resources on every page that contains a betting recommendation.',
            ].map((line, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg)',
                  borderLeft: '4px solid var(--jade)',
                  borderRadius: 6,
                  padding: '16px 20px',
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: 'var(--fg)',
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER DISCLAIMER BLOCK */}
      <section
        style={{
          padding: '40px 24px 64px',
          background: 'var(--bg-2)',
          color: 'var(--gray-muted)',
        }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: 2,
              color: 'var(--gold)',
              textTransform: 'uppercase',
              margin: 0,
              marginBottom: 12,
            }}
          >
            Important Disclaimer
          </p>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              margin: 0,
              marginBottom: 12,
            }}
          >
            SharpSpots provides algorithmic analysis of publicly available
            sports and betting market data for entertainment and educational
            purposes. Nothing on this site is financial advice, gambling
            advice, or a guarantee of any outcome. Past performance does not
            indicate future results.
          </p>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              margin: 0,
              marginBottom: 12,
            }}
          >
            You must be 21 or older and physically located in a jurisdiction
            where sports betting is legal to place a wager. Only bet what you
            can afford to lose.
          </p>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              margin: 0,
              color: 'var(--gray-muted)',
            }}
          >
            If you or someone you know has a gambling problem, call{' '}
            <a
              href="tel:18004262537"
              style={{ color: 'var(--gold)', fontWeight: 600 }}
            >
              1-800-GAMBLER
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}