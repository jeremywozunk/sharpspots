interface GamePick {
  sys: { id: string };
  fields: {
    title: string;
    league: string;
    recommended_play: string;
    line: string;
    ev_percentage: string;
    analysis_para_1: string;
    analysis_para_2: string;
  };
}

async function getGames(): Promise<GamePick[]> {
  const res = await fetch(
    `https://cdn.contentful.com/spaces/6cd4xbc83y0o/entries?content_type=gamePick&access_token=iekmhltXFZZsk0EsprbeUWr00w1druindsAGlxVz9Ls`,
    { cache: 'no-store' }
  );
  const data = await res.json();
  return data.items || [];
}

export default async function Home() {
  const games = await getGames();

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
        SharpSpots
      </h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Today's +EV Analysis
      </p>

      {games.length === 0 && <p>No games found.</p>}

      {games.map((game: GamePick) => (
        <div key={game.sys.id} style={{
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
              {game.fields.title}
            </h2>
            <span style={{
              background: '#dcfce7',
              color: '#166534',
              padding: '2px 10px',
              borderRadius: 20,
              fontSize: '0.85rem',
              fontWeight: '600'
            }}>
              +{game.fields.ev_percentage} EV
            </span>
          </div>
          <p style={{ color: '#6b7280', margin: '0.5rem 0' }}>
            {game.fields.league?.toUpperCase()} · Play: {game.fields.recommended_play} {game.fields.line}
          </p>
          <p style={{ marginTop: '1rem', lineHeight: 1.6 }}>
            {game.fields.analysis_para_1}
          </p>
        </div>
      ))}
    </main>
  );
}