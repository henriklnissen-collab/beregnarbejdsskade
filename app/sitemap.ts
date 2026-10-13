import type { MetadataRoute } from 'next';

/** Sitemap til Google Search Console. */

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://beregnarbejdsskade.dk')
    .replace(/\/+$/, '');

  const nu = new Date();

  return [
    { url: base, lastModified: nu, changeFrequency: 'weekly', priority: 1 },
    {
      url: `${base}/arbejdsskadeforsikring`,
      lastModified: nu, changeFrequency: 'monthly', priority: 0.9,
    },
    {
      url: `${base}/hvad-koster-arbejdsskadeforsikring`,
      lastModified: nu, changeFrequency: 'monthly', priority: 0.9,
    },
    {
      url: `${base}/saadan-virker-det`,
      lastModified: nu, changeFrequency: 'monthly', priority: 0.6,
    },
    {
      url: `${base}/privatlivspolitik`,
      lastModified: nu, changeFrequency: 'yearly', priority: 0.3,
    },
  ];
}
