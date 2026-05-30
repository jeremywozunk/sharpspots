'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const LEAGUES = [
  { slug: 'nba', name: 'NBA' },
  { slug: 'mlb', name: 'MLB' },
  { slug: 'nfl', name: 'NFL' },
  { slug: 'nhl', name: 'NHL' },
  { slug: 'mls', name: 'MLS' },
  { slug: 'epl', name: 'EPL' },
  { slug: 'champions-league', name: 'Champions League' },
  { slug: 'college-basketball', name: 'College Basketball' },
  { slug: 'college-football', name: 'College Football' },
  { slug: 'ufc', name: 'UFC' },
  { slug: 'wc', name: 'World Cup' },
];

export default function SportsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="sports-dropdown-wrapper" ref={dropdownRef}>
      <button
        className="sports-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Sports
      </button>
      {isOpen && (
        <div className="sports-dropdown-menu">
          {LEAGUES.map((league) => (
            <Link
              key={league.slug}
              href={`/${league.slug}`}
              className="sports-dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              {league.name}
            </Link>
          ))}
        </div>
      )}
      <style>{`
        .sports-dropdown-wrapper { position: relative; display: inline-block; }
        .sports-dropdown-menu { position: absolute; top: calc(100% + 12px); right: 0; background: var(--bg-2); border: 1px solid var(--border-subtle); min-width: 220px; padding: 8px; z-index: 100; }
        .sports-dropdown-item { display: block; padding: 10px 14px; font-family: var(--font-ui); font-size: 12px; font-weight: 500; color: var(--fg); letter-spacing: 0.05em; text-transform: uppercase; }
        .sports-dropdown-item:hover { background: var(--border-subtle); color: var(--jade); }
      `}</style>
    </div>
  );
}
