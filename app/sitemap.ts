import type { MetadataRoute } from 'next';
import client from './contentful';

const SITE_URL = 'https://sharpspots.com';

// Active league slugs that have wired league index pages.
// Add new leagues here once the pipeline supports them.
const ACTIVE_LEAGUES = [
  'nba',
  'mlb',
  'nfl',
  'nhl',
  'mls',
  'epl',
  'ufc',
  'champions-league',
  'college-basketball',
  'college-football',
  'wc',
];

interface GamePickEntry {
  sys: { id: string; updatedAt: string };
  fields: {
    slug?: string;
    league?: string;
    gameDate?: string;
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static / hand-curated routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/how-it-works`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/track-record`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/parlay`,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/responsible-gambling`,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/results`,
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  // League index pages — one per active league
  const leagueRoutes: MetadataRoute.Sitemap = ACTIVE_LEAGUES.map((league) => ({
    url: `${SITE_URL}/${league}`,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Blog index + individual post pages
  const blogStaticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/blog`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const blogRes = await client.getEntries({
      content_type: 'blogPost',
      'fields.status': 'live',
      limit: 200,
      select: ['sys.id', 'sys.updatedAt', 'fields.slug', 'fields.publishedDate'] as any,
    });
    blogRoutes = (blogRes.items as any[])
      .filter((entry) => entry.fields.slug)
      .map((entry) => ({
        url: `${SITE_URL}/blog/${entry.fields.slug}`,
        lastModified: new Date(entry.sys.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
  } catch (err) {
    console.error('Sitemap: failed to fetch blogPost entries', err);
  }

  // Game pick pages — pulled live from Contentful so every published entry
  // appears in the sitemap on next Vercel rebuild.
  let gameRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await client.getEntries({
      content_type: 'gamePick',
      'fields.status[in]': 'live,archived',
      limit: 1000,
      select: ['sys.id', 'sys.updatedAt', 'fields.slug', 'fields.league', 'fields.gameDate'] as any,
    });

    gameRoutes = (res.items as unknown as GamePickEntry[])
      .filter((entry) => entry.fields.slug && entry.fields.league && entry.fields.gameDate)
      .map((entry) => {
        const dateStr = entry.fields.gameDate!.split('T')[0];
        const leagueSlug = entry.fields.league!.toLowerCase();
        return {
          url: `${SITE_URL}/${leagueSlug}/picks/${dateStr}/${entry.fields.slug}`,
          lastModified: new Date(entry.sys.updatedAt),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        };
      });
  } catch (err) {
    // If Contentful is unreachable at build time, ship a sitemap with just
    // static + league routes rather than failing the whole build.
    console.error('Sitemap: failed to fetch gamePick entries', err);
  }

  return [...staticRoutes, ...leagueRoutes, ...blogStaticRoutes, ...blogRoutes, ...gameRoutes];
}
