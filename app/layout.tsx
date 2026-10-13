import type { Metadata } from 'next';
import Link from 'next/link';
import Topbar from './Topbar';
import './globals.css';

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://beregnarbejdsskade.dk')
  .replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Arbejdsskadeforsikring – beregn prisen på 2 minutter | beregnarbejdsskade.dk',
  description:
    'Beregn prisen på arbejdsskadeforsikring til din virksomhed. Indtast CVR-nummer, ' +
    'så henter vi branchekode og årsværk og giver dig et vejledende prisestimat med det samme.',
  metadataBase: new URL(BASE),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'da_DK',
    siteName: 'beregnarbejdsskade.dk',
    title: 'Arbejdsskadeforsikring – beregn prisen på 2 minutter',
    description:
      'Indtast CVR-nummer og få et vejledende prisestimat på arbejdsskadeforsikring. ' +
      'Gratis og uforpligtende.',
  },
  // Uden den her viser X og flere mailklienter kun et lille miniaturebillede.
  // LinkedIn og Facebook bruger Open Graph-billedet ovenfor af sig selv.
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

/**
 * Så søgemaskiner og AI-søgetjenester kan forstå, hvad siden er —
 * og lige så vigtigt, hvad den ikke er. Vi sælger ikke forsikringer.
 */
const sitedata = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${BASE}/#website`,
      url: `${BASE}/`,
      name: 'beregnarbejdsskade.dk',
      inLanguage: 'da-DK',
      description:
        'Beregn prisen på lovpligtig arbejdsskadeforsikring og få tilbud fra ' +
        'flere forsikringsselskaber.',
    },
    {
      '@type': 'Service',
      '@id': `${BASE}/#service`,
      name: 'Prisberegning og tilbudsindhentning på arbejdsskadeforsikring',
      serviceType: 'Arbejdsskadeforsikring',
      areaServed: { '@type': 'Country', name: 'Danmark' },
      audience: { '@type': 'BusinessAudience', name: 'Små og mellemstore virksomheder' },
      url: `${BASE}/`,
      description:
        'Virksomheden indtaster sit CVR-nummer og får et vejledende prisestimat. ' +
        'Forespørgslen kan sendes til flere forsikringsselskaber, som svarer med ' +
        'deres pris. Forsikringsaftalen indgås direkte mellem virksomheden og det ' +
        'valgte selskab.',
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body>
        <Topbar />
        {children}

        <footer className="bund">
          <div className="c">
            <div>
              <h4>beregn arbejdsskade.dk</h4>
              <p>
                Arbejdsskadeforsikring til små og mellemstore virksomheder.
                Alle priser på siden er vejledende estimater.
              </p>
              <p>
                Vi sælger ikke selv forsikringer. Vi indhenter priser og sender jeres valg
                videre, og aftalen indgås direkte mellem jer og forsikringsselskabet.
              </p>
            </div>
            <div>
              <h4>Om siden</h4>
              <ul>
                <li><Link href="/arbejdsskadeforsikring">Om arbejdsskadeforsikring</Link></li>
                <li><Link href="/hvad-koster-arbejdsskadeforsikring">Hvad koster den?</Link></li>
                <li><Link href="/saadan-virker-det">Sådan virker siden</Link></li>
                <li><Link href="/privatlivspolitik">Privatlivspolitik</Link></li>
                <li><Link href="/privatlivspolitik#cookies">Cookies</Link></li>
              </ul>
            </div>
          </div>

          <div className="bundbund">
            <div className="c">
              Siden er uafhængig af forsikringsselskaberne og er ikke en myndighed.
              Har du brug for rådgivning om en konkret arbejdsskade, skal du kontakte
              dit forsikringsselskab, din fagforening eller{' '}
              <a href="https://www.aes.dk" rel="noopener">
                Arbejdsmarkedets Erhvervssikring
              </a>.
            </div>
          </div>
        </footer>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sitedata) }}
        />
      </body>
    </html>
  );
}
