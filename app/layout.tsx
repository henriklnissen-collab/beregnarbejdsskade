import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Arbejdsskadeforsikring – beregn prisen på 2 minutter | beregnarbejdsskade.dk',
  description:
    'Beregn prisen på arbejdsskadeforsikring til din virksomhed. Indtast CVR-nummer, ' +
    'så henter vi branchekode og årsværk og giver dig et vejledende prisestimat med det samme.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
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
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body>
        {children}
        <footer className="bund">
          <div className="c">
            <div>
              <h4>beregn arbejdsskade.dk</h4>
              <p>
                Arbejdsskadeforsikring til små og mellemstore virksomheder.
                Siden er under opbygning, og alle priser er vejledende estimater.
              </p>
              <p>
                Vi sælger ikke selv forsikringer. Vi indhenter priser og sender jeres valg
                videre, og aftalen indgås direkte mellem jer og forsikringsselskabet.
              </p>
            </div>
            <div>
              <h4>Om siden</h4>
              <p>
                Forsikringsbetingelser (kommer)<br />
                Privatlivspolitik (kommer)<br />
                Cookies (kommer)
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
