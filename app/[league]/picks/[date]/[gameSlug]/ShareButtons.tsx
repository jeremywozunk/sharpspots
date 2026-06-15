'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  url: string;        // clean sharpspots.com URL of this pick
  play: string;       // e.g. "St. Louis Cardinals ML"
  ev: string;         // e.g. "+12.4%"
  title: string;      // pick title (fallback for email subject)
}

export default function ShareButtons({ url, play, ev, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  // Data-forward share text — advertises the model's actual read.
  const tweetText = `SharpSpots model likes ${play} \u2014 ${ev} edge. full breakdown:`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`;

  const emailSubject = `SharpSpots pick: ${play}`;
  const emailBody = `Thought you\u2019d want to see this SharpSpots pick:\n\n${play} \u2014 ${ev} edge\n\n${url}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API blocked — fall back to selecting nothing gracefully.
      setCopied(false);
    }
  };

  return (
    <div className="share-row">
      <span className="share-label">Share</span>

      <a
        className="share-btn"
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span>X</span>
      </a>

      <button className="share-btn" onClick={copyLink} aria-label="Copy link">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span>{copied ? 'Copied!' : 'Copy link'}</span>
      </button>

      <a className="share-btn" href={mailtoUrl} aria-label="Share via email">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-10 5L2 7" />
        </svg>
        <span>Email</span>
      </a>

      <style>{`
        .share-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin: 36px 0 8px; padding-top: 24px; border-top: 1px solid var(--border-subtle); }
        .share-label { font-size: 10px; color: var(--gray-muted); letter-spacing: 0.18em; text-transform: uppercase; font-weight: 600; }
        .share-btn { display: inline-flex; align-items: center; gap: 7px; background: var(--bg-2); border: 1px solid var(--gray-border); color: var(--fg); padding: 8px 14px; font-family: var(--font-ui); font-size: 13px; font-weight: 500; cursor: pointer; transition: color 0.15s, border-color 0.15s; text-decoration: none; }
        .share-btn:hover { color: var(--jade); border-color: var(--jade); }
        .share-btn svg { display: block; }
      `}</style>
    </div>
  );
}
