export const metadata = {
  title: 'SharpSpots - +EV Sports Betting Analysis',
  description: 'Daily algorithmic +EV analysis across all major sports leagues',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}