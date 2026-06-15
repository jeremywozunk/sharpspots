import Link from 'next/link';
import SiteNav from './SiteNav';
import './globals.css';

export const metadata = {
  title: 'SharpSpots - +EV Sports Betting Analysis',
  description: 'Daily algorithmic +EV analysis across all major sports leagues',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <style>{`
          .topbar { height: 3px; background: linear-gradient(to right, var(--jade) 50%, var(--cream) 50%); }
          .nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 48px; background: var(--bg-2); border-bottom: 1px solid var(--border-subtle); }
          .logo { display: flex; align-items: center; gap: 14px; line-height: 1; font-family: var(--font-brand); font-weight: 400; font-size: 38px; text-transform: uppercase; letter-spacing: 0.14em; }
          .logo-wordmark { display: flex; gap: 0; line-height: 1; }
          .logo .sharp { color: var(--jade); }
          .logo .spots { color: var(--cream); }
          .nav-links { display: flex; gap: 36px; align-items: center; }
          .nav-links a { font-family: var(--font-ui); font-size: 15px; color: var(--fg); font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; }
          .nav-links a:hover { color: var(--jade); }
          .sports-btn { font-family: var(--font-ui); font-size: 15px; color: var(--fg); background: none; border: none; cursor: pointer; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; }
          .sports-btn:hover { color: var(--jade); }
          .footer { padding: 24px 48px; background: var(--bg-2); border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-top: 80px; }
          .footer-links { display: flex; gap: 24px; flex-wrap: wrap; }
          .footer-links a { font-family: var(--font-ui); font-size: 11px; color: var(--gray-muted); letter-spacing: 0.06em; text-transform: uppercase; }
          .footer-links a:hover { color: var(--jade); }
          .footer-social { display: inline-flex; align-items: center; }
          .footer-social a { display: inline-flex; align-items: center; gap: 7px; color: var(--jade); font-family: var(--font-ui); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; }
          .footer-social a:hover { color: var(--cream); }
          .footer-social svg { display: block; }
          .footer-disc { font-family: var(--font-ui); font-size: 10px; color: var(--gray-muted); }
          @media (max-width: 768px) {
            .nav { padding: 14px 20px; }
            .logo { font-size: 28px; gap: 10px; }
            .nav-links { gap: 18px; }
            .nav-links a { font-size: 13px; }
            .sports-btn { font-size: 13px; }
          }
        `}</style>
        <div className="topbar" />
        <SiteNav />
        {children}
        <footer className="footer">
          <div className="footer-links">
            <Link href="/sports">Sports</Link>
            <Link href="/how-it-works">How It Works</Link>
            <Link href="/track-record">Track Record</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/responsible-gambling">Responsible Gambling</Link>
          </div>
          <div className="footer-social">
            <a href="https://x.com/sharpspots" target="_blank" rel="noopener noreferrer" aria-label="Follow SharpSpots on X">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>@sharpspots</span>
            </a>
          </div>
          <div className="footer-disc">21+ only. Bet responsibly.</div>
        </footer>
      </body>
    </html>
  );
}
