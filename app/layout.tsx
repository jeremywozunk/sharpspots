import Link from 'next/link';
import SportsDropdown from './SportsDropdown';

export const metadata = {
  title: 'SharpSpots - +EV Sports Betting Analysis',
  description: 'Daily algorithmic +EV analysis across all major sports leagues',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: system-ui, -apple-system, sans-serif; background: #fff; color: #111; }

          .topbar { height: 5px; background: linear-gradient(to right, #2d8c3e 50%, #b8860b 50%); }

          .nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 48px; border-bottom: 1px solid #e5e7eb; position: relative; }
          .logo { display: flex; flex-direction: column; line-height: 0.88; font-family: 'Barlow Condensed', Arial Black, sans-serif; font-weight: 800; font-size: 72px; text-transform: uppercase; letter-spacing: 2px; text-decoration: none; }
          .logo .sharp { color: #2d8c3e; }
          .logo .spots { color: #b8860b; }
          .nav-links { display: flex; gap: 36px; align-items: center; }
          .nav-links a { font-size: 16px; color: #111; text-decoration: none; font-weight: 700; }
          .sports-btn { font-size: 16px; color: #111; background: none; border: none; cursor: pointer; font-family: system-ui; font-weight: 700; padding: 0; }
          .sports-btn:after { content: ' ▾'; font-size: 12px; }

          .footer { padding: 20px 48px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-top: 60px; }
          .footer-links { display: flex; gap: 24px; flex-wrap: wrap; }
          .footer-links a { font-size: 12px; color: #9ca3af; text-decoration: none; }
          .footer-disc { font-size: 11px; color: #9ca3af; }

          @media (max-width: 768px) {
            .nav { padding: 16px 20px; }
            .logo { font-size: 48px; }
            .nav-links { gap: 20px; }
            .nav-links a { font-size: 14px; }
            .sports-btn { font-size: 14px; }
            .footer { padding: 16px 20px; }
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