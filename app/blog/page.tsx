import { createClient } from 'contentful';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
});

const SITE_URL = 'https://sharpspots.vercel.app';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Blog | SharpSpots — Sports Betting Analysis & Strategy',
  description: 'Deep dives on sports betting strategy, methodology, bankroll management, and the psychology behind beating the market.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: 'Blog | SharpSpots',
    description: 'Sports betting strategy, methodology, and market analysis from the SharpSpots team.',
    url: `${SITE_URL}/blog`,
    siteName: 'SharpSpots',
    type: 'website',
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  Methodology: 'var(--jade)',
  Glossary: 'var(--cream)',
  Psychology: '#a78bfa',
  Concept: '#60a5fa',
  Bankroll: '#fbbf24',
};

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

export default async function BlogPage() {
  let posts: any[] = [];
  try {
    const entries = await client.getEntries({
      content_type: 'blogPost',
      'fields.status': 'live',
      order: ['-fields.publishedDate'],
      limit: 50,
    });
    posts = entries.items;
  } catch (e) {
    // On error, render empty state rather than crash
    posts = [];
  }

  return (
    <>
      <style>{`
        .blog-hero {
          padding: 64px 48px 48px;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-2);
        }
        .blog-eyebrow {
          font-size: 11px;
          color: var(--jade);
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 14px;
        }
        .blog-h1 {
          font-family: var(--font-brand);
          font-weight: 400;
          font-size: 64px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--fg);
          line-height: 1;
          margin-bottom: 16px;
        }
        .blog-hero-sub {
          font-size: 15px;
          color: var(--gray-muted);
          max-width: 540px;
          line-height: 1.6;
        }
        .blog-grid {
          max-width: 900px;
          margin: 0 auto;
          padding: 56px 48px;
        }
        .blog-post-row {
          display: flex;
          gap: 32px;
          padding: 32px 0;
          border-bottom: 1px solid var(--border-subtle);
          text-decoration: none;
          color: inherit;
          align-items: flex-start;
        }
        .blog-post-row:first-child {
          padding-top: 0;
        }
        .blog-post-row:hover .bpr-title {
          color: var(--jade);
        }
        .bpr-left {
          flex: 1;
          min-width: 0;
        }
        .bpr-meta {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 12px;
        }
        .bpr-category {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .bpr-date {
          font-size: 11px;
          color: var(--gray-muted);
          letter-spacing: 0.04em;
        }
        .bpr-readtime {
          font-size: 11px;
          color: var(--gray-muted);
          letter-spacing: 0.04em;
        }
        .bpr-title {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 700;
          font-size: 24px;
          line-height: 1.22;
          margin-bottom: 12px;
          color: var(--fg);
          transition: color 0.15s;
        }
        .bpr-excerpt {
          font-family: var(--font-prose);
          font-size: 14px;
          color: var(--gray-muted);
          line-height: 1.65;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .bpr-right {
          flex-shrink: 0;
          padding-top: 4px;
        }
        .bpr-arrow {
          font-size: 11px;
          color: var(--jade);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 600;
          border-top: 2px solid var(--jade);
          border-bottom: 2px solid var(--jade);
          padding: 5px 12px;
          white-space: nowrap;
        }
        .blog-empty {
          padding: 100px 48px;
          text-align: center;
          color: var(--gray-muted);
          font-family: var(--font-display);
          font-style: italic;
          font-size: 20px;
        }
        @media (max-width: 768px) {
          .blog-hero { padding: 40px 20px 32px; }
          .blog-h1 { font-size: 44px; }
          .blog-grid { padding: 32px 20px; }
          .blog-post-row { flex-direction: column; gap: 16px; }
          .bpr-title { font-size: 20px; }
          .bpr-right { display: none; }
          .blog-empty { padding: 60px 20px; font-size: 17px; }
        }
      `}</style>

      <div className="blog-hero">
        <div className="blog-eyebrow">From the SharpSpots Team</div>
        <h1 className="blog-h1">The Blog</h1>
        <p className="blog-hero-sub">
          Deep dives on methodology, bankroll management, market dynamics, and the psychology of sports betting.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="blog-empty">No posts yet. Check back soon.</div>
      ) : (
        <div className="blog-grid">
          {posts.map((post: any) => {
            const f = post.fields as any;
            const catColor = CATEGORY_COLORS[f.category] || 'var(--gray-muted)';
            return (
              <Link
                key={post.sys.id}
                href={`/blog/${f.slug}`}
                className="blog-post-row"
              >
                <div className="bpr-left">
                  <div className="bpr-meta">
                    {f.category && (
                      <span className="bpr-category" style={{ color: catColor }}>
                        {f.category}
                      </span>
                    )}
                    {f.publishedDate && (
                      <span className="bpr-date">{formatDate(f.publishedDate)}</span>
                    )}
                    {f.readingTimeMinutes && (
                      <span className="bpr-readtime">{f.readingTimeMinutes} min read</span>
                    )}
                  </div>
                  <div className="bpr-title">{f.title}</div>
                  {f.excerpt && <div className="bpr-excerpt">{f.excerpt}</div>}
                </div>
                <div className="bpr-right">
                  <span className="bpr-arrow">Read →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
