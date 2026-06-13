'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Logo from './Logo';
import SportsDropdown from './SportsDropdown';

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  // Close the mobile menu on resize back to desktop so state never gets stuck.
  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 768 && open) setOpen(false);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open]);

  // Prevent body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <nav className="nav">
      <Link href="/" className="logo" onClick={() => setOpen(false)}>
        <Logo size={48} />
        <span className="logo-wordmark">
          <span className="sharp">SHARP</span>
          <span className="spots">SPOTS</span>
        </span>
      </Link>

      {/* Desktop links (hidden < 768px via CSS) */}
      <div className="nav-links nav-links-desktop">
        <Link href="/">Home</Link>
        <SportsDropdown />
        <Link href="/how-it-works">How It Works</Link>
        <Link href="/track-record">Track Record</Link>
        <Link href="/blog">Blog</Link>
      </div>

      {/* Hamburger button (shown only < 768px via CSS) */}
      <button
        className="nav-hamburger"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <span className={`hb-line ${open ? 'hb-line-1-open' : ''}`} />
        <span className={`hb-line ${open ? 'hb-line-2-open' : ''}`} />
        <span className={`hb-line ${open ? 'hb-line-3-open' : ''}`} />
      </button>

      {/* Mobile slide-down menu */}
      {open && (
        <div className="nav-mobile-menu">
          <Link href="/" onClick={() => setOpen(false)}>Home</Link>
          <Link href="/sports" onClick={() => setOpen(false)}>Sports</Link>
          <Link href="/how-it-works" onClick={() => setOpen(false)}>How It Works</Link>
          <Link href="/track-record" onClick={() => setOpen(false)}>Track Record</Link>
          <Link href="/blog" onClick={() => setOpen(false)}>Blog</Link>
        </div>
      )}

      <style>{`
        .nav-hamburger { display: none; }
        .nav-mobile-menu { display: none; }
        @media (max-width: 768px) {
          .nav-links-desktop { display: none; }
          .nav-hamburger {
            display: flex; flex-direction: column; justify-content: center; gap: 5px;
            width: 40px; height: 40px; padding: 8px; background: none; border: none;
            cursor: pointer; -webkit-tap-highlight-color: transparent;
          }
          .hb-line {
            display: block; width: 24px; height: 2px; background: var(--fg);
            transition: transform 0.2s ease, opacity 0.2s ease;
          }
          .hb-line-1-open { transform: translateY(7px) rotate(45deg); }
          .hb-line-2-open { opacity: 0; }
          .hb-line-3-open { transform: translateY(-7px) rotate(-45deg); }
          .nav-mobile-menu {
            display: flex; flex-direction: column;
            position: absolute; top: 100%; left: 0; right: 0; z-index: 200;
            background: var(--bg-2); border-bottom: 1px solid var(--border-subtle);
            padding: 8px 20px 16px;
          }
          .nav-mobile-menu a {
            font-family: var(--font-ui); font-size: 16px; color: var(--fg);
            font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase;
            padding: 14px 0; border-bottom: 1px solid var(--border-subtle);
          }
          .nav-mobile-menu a:last-child { border-bottom: none; }
          .nav-mobile-menu a:active { color: var(--jade); }
          /* nav must be positioned so the absolute menu anchors to it */
          .nav { position: relative; }
        }
      `}</style>
    </nav>
  );
}
