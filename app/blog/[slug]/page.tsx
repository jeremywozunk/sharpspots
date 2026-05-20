import { createClient } from 'contentful';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, MARKS, INLINES } from '@contentful/rich-text-types';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import React from 'react';

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
});

const SITE_URL = 'https://sharpspots.vercel.app';

export const dynamic = 'force-dynamic';

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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const entries = await client.getEntries({
      content_type: 'blogPost',
      'fields.slug': slug,
      limit: 1,
    });
    if (!entries.items.length) return { title: 'Post Not Found | SharpSpots' };
    const f = entries.items[0].fields as any;
    return {
      title: f.metaTitle || `${f.title} | SharpSpots`,
      description: f.metaDescription || f.excerpt || '',
      alternates: { canonical: `${SITE_URL}/blog/${slug}` },
      openGraph: {
        title: f.metaTitle || f.title,
        description: f.metaDescription || f.excerpt || '',
        url: `${SITE_URL}/blog/${slug}`,
        siteName: 'SharpSpots',
        type: 'article',
      },
    };
  } catch {
    return { title: 'Blog | SharpSpots' };
  }
}

const richTextOptions = {
  renderMark: {
    [MARKS.BOLD]: (text: React.ReactNode) => (
      <strong style={{ color: 'var(--fg)', fontWeight: 700 }}>{text}</strong>
    ),
    [MARKS.ITALIC]: (text: React.ReactNode) => <em>{text}</em>,
    [MARKS.CODE]: (text: React.ReactNode) => (
      <code style={{
        background: 'var(--bg-2)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 4,
        padding: '2px 6px',
        fontSize: '0.9em',
        fontFamily: 'monospace',
        color: 'var(--jade)',
      }}>{text}</code>
    ),
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node: any, children: React.ReactNode) => (
      <p className="post-p">{children}</p>
    ),
    [BLOCKS.HEADING_1]: (_node: any, children: React.ReactNode) => (
      <h1 className="post-h1">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (_node: any, children: React.ReactNode) => (
      <h2 className="post-h2">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (_node: any, children: React.ReactNode) => (
      <h3 className="post-h3">{children}</h3>
    ),
    [BLOCKS.HEADING_4]: (_node: any, children: React.ReactNode) => (
      <h4 className="post-h4">{children}</h4>
    ),
    [BLOCKS.UL_LIST]: (_node: any, children: React.ReactNode) => (
      <ul className="post-ul">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (_node: any, children: React.ReactNode) => (
      <ol className="post-ol">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (_node: any, children: React.ReactNode) => (
      <li className="post-li">{children}</li>
    ),
    [BLOCKS.QUOTE]: (_node: any, children: React.ReactNode) => (
      <blockquote className="post-blockquote">{children}</blockquote>
    ),
    [BLOCKS.HR]: () => <hr className="post-hr" />,
    [INLINES.HYPERLINK]: (node: any, children: React.ReactNode) => (
      <a
        href={node.data.uri}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'var(--jade)', textDecoration: 'underline', textUnderlineOffset: 3 }}
      >
        {children}
      </a>
    ),
  },
};

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  let post: any = null;
  try {
    const entries = await client.getEntries({
      content_type: 'blogPost',
      'fields.slug': slug,
      limit: 1,
    });
    if (entries.items.length) post = entries.items[0];
  } catch {
    notFound();
  }

  if (!post) notFound();

  const f = post.fields as any;
  const catColor = CATEGORY_COLORS[f.category] || 'var(--gray-muted)';

  // Fetch related posts if any
  let relatedPosts: any[] = [];
  if (f.relatedPosts && Array.isArray(f.relatedPosts) && f.relatedPosts.length > 0) {
    try {
      const related = await client.getEntries({
        content_type: 'blogPost',
        'sys.id[in]': f.relatedPosts.map((r: any) => r.sys.id).join(','),
        limit: 3,
      });
      relatedPosts = related.items;
    } catch {
      relatedPosts = [];
    }
  }

  const shareUrl = `${SITE_URL}/blog/${slug}`;
  const shareText = encodeURIComponent(f.title || '');

  return (
    <>
      <style>{`
        .post-hero {
          padding: 64px 48px 48px;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-2);
          max-width: 800px;
          margin: 0 auto;
        }
        .post-breadcrumb {
          font-size: 11px;
          color: var(--gray-muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 24px;
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .post-breadcrumb a { color: var(--jade); }
        .post-breadcrumb span { color: var(--border-subtle); }
        .post-meta {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .post-category {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .post-date {
          font-size: 12px;
          color: var(--gray-muted);
        }
        .post-readtime {
          font-size: 12px;
          color: var(--gray-muted);
        }
        .post-byline {
          font-size: 12px;
          color: var(--gray-muted);
        }
        .post-title {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 900;
          font-size: 42px;
          line-height: 1.12;
          color: var(--fg);
          margin-bottom: 20px;
        }
        .post-excerpt {
          font-family: var(--font-prose);
          font-size: 18px;
          color: var(--gray-muted);
          line-height: 1.6;
          border-left: 3px solid var(--jade);
          padding-left: 20px;
        }

        .post-body {
          max-width: 720px;
          margin: 0 auto;
          padding: 56px 48px;
          font-family: var(--font-prose);
        }
        .post-p {
          font-size: 17px;
          color: var(--fg);
          line-height: 1.75;
          margin-bottom: 20px;
        }
        .post-p:last-child { margin-bottom: 0; }
        .post-h1 {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 900;
          font-size: 36px;
          color: var(--fg);
          margin: 48px 0 16px;
          line-height: 1.15;
        }
        .post-h2 {
          font-family: var(--font-brand);
          font-weight: 400;
          font-size: 28px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--jade);
          margin: 48px 0 16px;
          line-height: 1.1;
        }
        .post-h3 {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 700;
          font-size: 22px;
          color: var(--cream);
          margin: 36px 0 12px;
          line-height: 1.2;
        }
        .post-h4 {
          font-size: 14px;
          font-weight: 700;
          color: var(--jade);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 28px 0 10px;
        }
        .post-hr {
          border: none;
          border-top: 1px solid var(--border-subtle);
          margin: 40px 0;
        }
        .post-ul, .post-ol {
          margin: 16px 0 20px 24px;
        }
        .post-ul { list-style: disc; }
        .post-ol { list-style: decimal; }
        .post-li {
          font-size: 16px;
          color: var(--fg);
          line-height: 1.7;
          margin-bottom: 8px;
        }
        .post-li p { margin-bottom: 0; }
        .post-blockquote {
          border-left: 3px solid var(--jade);
          padding: 16px 20px;
          margin: 24px 0;
          background: var(--bg-2);
          border-radius: 0 4px 4px 0;
        }
        .post-blockquote p {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 18px;
          color: var(--cream);
          line-height: 1.6;
          margin-bottom: 0;
        }

        .post-share {
          max-width: 720px;
          margin: 0 auto;
          padding: 32px 48px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }
        .share-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--gray-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .share-btn {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 6px 14px;
          border: 1px solid var(--border-subtle);
          color: var(--fg);
          background: none;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }
        .share-btn:hover { border-color: var(--jade); color: var(--jade); }

        .post-related {
          max-width: 720px;
          margin: 0 auto;
          padding: 48px 48px;
          border-top: 1px solid var(--border-subtle);
        }
        .related-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--jade);
          text-transform: uppercase;
          letter-spacing: 0.14em;
          margin-bottom: 24px;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        .related-card {
          display: block;
          padding: 20px;
          border: 1px solid var(--border-subtle);
          border-left: 3px solid var(--jade);
          color: inherit;
          text-decoration: none;
        }
        .related-card:hover { background: rgba(74,222,128,0.04); }
        .rc-category {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--jade);
          margin-bottom: 8px;
        }
        .rc-title {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 700;
          font-size: 16px;
          color: var(--fg);
          line-height: 1.3;
        }

        .post-footer-nav {
          max-width: 720px;
          margin: 0 auto;
          padding: 32px 48px 0;
          border-top: 1px solid var(--border-subtle);
        }
        .back-to-blog {
          font-size: 12px;
          color: var(--jade);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 600;
        }
        .back-to-blog:hover { color: var(--cream); }

        .post-disclaimer {
          max-width: 720px;
          margin: 32px auto 0;
          padding: 24px 48px;
          font-size: 12px;
          color: var(--gray-muted);
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .post-hero { padding: 32px 20px 32px; }
          .post-title { font-size: 28px; }
          .post-excerpt { font-size: 16px; }
          .post-body { padding: 32px 20px; }
          .post-p { font-size: 16px; }
          .post-h2 { font-size: 22px; }
          .post-h3 { font-size: 19px; }
          .post-share { padding: 24px 20px; }
          .post-related { padding: 32px 20px; }
          .post-footer-nav { padding: 24px 20px 0; }
          .post-disclaimer { padding: 20px 20px; }
        }
      `}</style>

      <article>
        <div className="post-hero">
          <div className="post-breadcrumb">
            <Link href="/blog">Blog</Link>
            <span>/</span>
            <span>{f.category || 'Article'}</span>
          </div>
          <div className="post-meta">
            {f.category && (
              <span className="post-category" style={{ color: catColor }}>{f.category}</span>
            )}
            {f.publishedDate && (
              <span className="post-date">{formatDate(f.publishedDate)}</span>
            )}
            {f.readingTimeMinutes && (
              <span className="post-readtime">{f.readingTimeMinutes} min read</span>
            )}
            <span className="post-byline">By The SharpSpots Team</span>
          </div>
          <h1 className="post-title">{f.title}</h1>
          {f.excerpt && <div className="post-excerpt">{f.excerpt}</div>}
        </div>

        <div className="post-body">
          {f.body
            ? documentToReactComponents(f.body, richTextOptions as any)
            : <p className="post-p">No content yet.</p>
          }
        </div>

        <div className="post-share">
          <span className="share-label">Share:</span>
          <a
            className="share-btn"
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            X / Twitter
          </a>
          <a
            className="share-btn"
            href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Reddit
          </a>
          <a
            className="share-btn"
            href={`https://news.ycombinator.com/submitlink?u=${encodeURIComponent(shareUrl)}&t=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            HN
          </a>
        </div>

        {relatedPosts.length > 0 && (
          <div className="post-related">
            <div className="related-label">Related Articles</div>
            <div className="related-grid">
              {relatedPosts.map((rp: any) => {
                const rf = rp.fields as any;
                const rcColor = CATEGORY_COLORS[rf.category] || 'var(--jade)';
                return (
                  <Link key={rp.sys.id} href={`/blog/${rf.slug}`} className="related-card">
                    {rf.category && (
                      <div className="rc-category" style={{ color: rcColor }}>{rf.category}</div>
                    )}
                    <div className="rc-title">{rf.title}</div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="post-footer-nav">
          <Link href="/blog" className="back-to-blog">← All Articles</Link>
        </div>

        <div className="post-disclaimer">
          SharpSpots provides educational content about sports betting. This is not financial advice or a guarantee of outcomes. 21+ only. Bet responsibly. Problem gambling? Call 1-800-GAMBLER.
        </div>
      </article>
    </>
  );
}
