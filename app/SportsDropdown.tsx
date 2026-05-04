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
];

export default function SportsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
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
        .sports-dropdown-wrapper {
          position: relative;
          display: inline-block;
        }

        .sports-dropdown-menu {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04);
          min-width: 220px;
          padding: 8px;
          z-index: 100;
          animation: dropdownFade 0.15s ease-out;
        }

        @keyframes dropdownFade {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .sports-dropdown-item {
          display: block;
          padding: 10px 14px;
          font-size: 15px;
          font-weight: 600;
          color: #111;
          text-decoration: none;
          border-radius: 6px;
          transition: background 0.1s, color 0.1s;
        }

        .sports-dropdown-item:hover {
          background: #f0faf2;
          color: #2d8c3e;
        }

        @media (max-width: 768px) {
          .sports-dropdown-menu {
            right: 0;
            min-width: 200px;
          }

          .sports-dropdown-item {
            padding: 12px 14px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}