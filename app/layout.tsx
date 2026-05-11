import Link from 'next/link';
import SportsDropdown from './SportsDropdown';
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
          .topbar { height: 3px; background: linear-gradient(to right, var(--jade) 50%, var(--gold) 50%); }
          .nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 48px; background: var(--bg-2); border-bottom: 1px solid var(--border-subtle); position: relative; }
          .logo { display: flex; gap: 0; line-height: 1; font-family: var(--font-brand); font-weight: 400; font-size: 32px; text-transform: uppercase; letter-spacing: 0.14em; text-decoration: none; }
          .logo .sharp { color: var(--jade); }
          .logo .spots { color: var(--gold); }
          .nav-links { display: flex; gap: 32px; align-items: center; }
          .nav-links a { font-family: var(--font-ui); font-size: 13px; color: var(--fg); text-decoration: none; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; transition: color 0.15s; }
          .nav-links a:hover { color: var(--jade); }
          .sports-btn { font-family: var(--font-ui); font-size: 13px; color: var(--fg); background: none; border: none; cursor: pointer; font-weight: 500; padding: 0; letter-spacing: 0.05em; text-transform: uppercase; }
          .sports-btn:after { content: ' \\25BE'; font-size: 10px; color: var(--jade); }
          .sports-btn:hover { color: var(--jade); }
          .footer { padding: 24px 48px; background: var(--bg-2); border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-top: 80px; }
          .footer-links { display: flex; gap: 24px; flex-wrap: wrap; }
          .footer-links a { font-family: var(--font-ui); font-size: 11px; color: var(--gray-muted); text-decoration: none; letter-spacing: 0.06em; text-transform: uppercase; }
          .footer-links a:hover { color: var(--jade); }
          .footer-disc { font-family: var(--font-ui); font-size: 10px; color: var(--gray-muted); letter-spacing: 0.04em; }
          @media (max-width: 768px) {
            .nav { padding: 14px 20px; }
            .logo { font-size: 24px; letter-spacing: 0.12em; }
            .nav-links { gap: 18px; }
            .nav-links a { font-size: 11px; }
            .sports-btn { font-size: 11px; }
            .footer { padding: 18px 20px; }
            .footer-links { gap: 16px; }
          }
        `}</style>

        <div className="topbar" />

        <nav className="nav">
          <Link href="/" className="logo">
            <span className="sharp">SHARP</span>
            <span className="spots">SPOTS</span>
          </Link>
          <div className="nav-links">
            <SportsDropdown />
            <Link href="/how-it-works">How It Works</Link>
            <Link href="/blog">Blog</Link>
          </div>
        </nav>

        {children}

        <footer className="footer">
          <div className="footer-links">
            <Link href="/sports">Sports</Link>
            <Link href="/how-it-works">How It Works</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/responsible-gambling">Responsible Gambling</Link>
          </div>
          <div className="footer-disc">21+ only. Bet responsibly.</div>
        </footer>
      </body>
    </html>
  );
}
