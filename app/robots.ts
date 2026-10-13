import type { MetadataRoute } from 'next';

/**
 * Hvad søgemaskiner må indeksere.
 *
 * Forsiden skal findes. Kundens overblik og selskabernes svarsider
 * indeholder virksomhedsoplysninger og må aldrig havne i Google.
 */

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://beregnarbejdsskade.dk')
    .replace(/\/+$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/svar/', '/mine-tilbud'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
