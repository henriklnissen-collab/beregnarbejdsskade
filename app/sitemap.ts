import type { MetadataRoute } from 'next';

/** Sitemap til Google Search Console. */

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://beregnarbejdsskade.dk')
    .replace(/\/+$/, '');

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
