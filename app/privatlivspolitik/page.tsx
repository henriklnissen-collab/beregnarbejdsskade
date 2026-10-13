import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privatlivspolitik og cookies',
  description:
    'Hvilke oplysninger vi gemmer, hvorfor, hvor længe, hvem de deles med, og hvilke ' +
    'rettigheder I har. Siden bruger én nødvendig cookie og ingen sporing.',
  alternates: { canonical: '/privatlivspolitik' },
  robots: { index: true, follow: true },
};

export default function Side() {
  return (
    <main className="c">
      <article className="artikel">
        <h1>Privatlivspolitik og cookies</h1>

        <p className="lead">
          Her står, hvilke oplysninger vi gemmer, hvorfor vi gør det, hvem de sendes til,
          og hvordan I får dem slettet igen.
        </p>

        <p className="opdat">Version 1 · oktober 2026</p>

        <div className="fakta">
          <p>
            <b>Udkast under juridisk gennemgang.</b> Teksten beskriver korrekt, hvad siden
            rent faktisk gør, men er endnu ikke gennemset af en jurist. Afsnittet om
            dataansvarlig udfyldes, når selskabet bag siden er på plads.
          </p>
        </div>

        <h2 id="ansvarlig">Hvem er dataansvarlig?</h2>
        <p>
          beregnarbejdsskade.dk. Kontaktoplysninger og CVR-nummer indsættes her, når
          selskabet bag siden er registreret. Indtil da kan henvendelser om personoplysninger
          sendes til den mailadresse, I har fået jeres kvittering fra.
        </p>

        <h2 id="hvad">Hvilke oplysninger gemmer vi?</h2>

        <h3>Når I kun bruger beregneren</h3>
        <p>
          Ingen. Slår I et CVR-nummer op og ser en pris uden at sende en forespørgsel, gemmer
          vi ikke noget om jer. Opslaget sker på vores server, og svaret vises i jeres browser.
        </p>

        <h3>Når I sender en forespørgsel</h3>
        <p>Så gemmer vi det, der skal til for at indhente og vise tilbuddene:</p>
        <ul>
          <li>CVR-nummer, firmanavn, branchekode og branchetekst</li>
          <li>Antal årsværk, I har bekræftet, samt tallet fra CVR og hvilken periode det dækker</li>
          <li>Ønsket startdato, hvis I har angivet en</li>
          <li>Vores eget prisestimat, som det så ud den dag</li>
          <li>Kontaktperson: navn, e-mail og eventuelt telefonnummer</li>
          <li>Tidspunktet for jeres to samtykker samt den IP-adresse, de blev givet fra</li>
          <li>De tilbud, selskaberne svarer med, og hvilket I eventuelt vælger</li>
        </ul>

        <p>
          Vi beder aldrig om oplysninger om løn, cpr-numre eller navngivne medarbejdere, og
          vi gemmer ingen helbredsoplysninger.
        </p>

        <h2 id="hvorfor">Hvorfor gemmer vi det?</h2>
        <ul>
          <li>
            <b>For at kunne levere det, I har bedt om.</b> Uden oplysningerne kan
            selskaberne ikke give en pris, og I kan ikke se tilbuddene bagefter.
          </li>
          <li>
            <b>For at kunne dokumentere jeres samtykke.</b> Derfor gemmer vi tidspunkt og
            IP-adresse — ikke for at følge jer rundt, men for at kunne vise, hvornår I sagde ja.
          </li>
        </ul>

        <h2 id="hvem">Hvem får oplysningerne?</h2>

        <h3>Forsikringsselskaberne</h3>
        <p>
          Kun dem, I selv har krydset af. De modtager virksomhedens oplysninger og jeres
          kontaktoplysninger, så de kan give en pris og kontakte jer. De får ikke at vide,
          hvilke andre selskaber I har spurgt.
        </p>

        <h3>Vores leverandører</h3>
        <ul>
          <li><b>Supabase</b> — database, hostet i Frankfurt inden for EU</li>
          <li><b>Vercel</b> — hosting af selve siden, med drift i EU</li>
          <li><b>Resend</b> — udsendelse af mails</li>
          <li><b>DanskCVRAPI</b> — opslag af virksomhedsoplysninger i CVR</li>
        </ul>

        <p>
          Vi sælger ikke oplysninger videre, og vi bruger dem ikke til markedsføring af
          andet end den forespørgsel, I selv har sendt.
        </p>

        <h2 id="hvorlaenge">Hvor længe gemmer vi det?</h2>
        <ul>
          <li>
            <b>Links til selskabernes svarskemaer</b> udløber automatisk efter 14 dage.
          </li>
          <li>
            <b>Engangskoder til login</b> slettes efter 5 minutter.
          </li>
          <li>
            <b>Selve sagen</b> gemmes, så længe den er relevant for jer og for at kunne
            dokumentere samtykket. Den konkrete slettefrist fastlægges i den juridiske
            gennemgang og skrives ind her.
          </li>
        </ul>

        <p>
          I kan til enhver tid bede om at få jeres sag slettet. Skriv til os, så gør vi det.
        </p>

        <h2 id="rettigheder">Jeres rettigheder</h2>
        <p>Efter databeskyttelsesforordningen har I ret til at:</p>
        <ul>
          <li>få at vide, hvilke oplysninger vi har om jer, og få en kopi</li>
          <li>få rettet forkerte oplysninger</li>
          <li>få oplysningerne slettet</li>
          <li>trække et samtykke tilbage — det gælder fremadrettet og rører ikke ved det,
            der allerede er sendt</li>
          <li>klage til <a href="https://www.datatilsynet.dk" rel="noopener">Datatilsynet</a></li>
        </ul>

        <h2 id="sikkerhed">Sikkerhed</h2>
        <p>
          Al trafik til siden er krypteret. Databasen er lukket for direkte adgang udefra —
          kun vores server kan læse og skrive i den. Links til selskabernes svarskemaer er
          lange, tilfældige og engangsagtige, og de udløber af sig selv.
        </p>
        <p>
          Når I logger ind for at se jeres tilbud, svarer vi altid det samme, uanset om der
          findes en sag på mailadressen eller ej. Ellers kunne man afprøve adresser og finde
          ud af, hvilke virksomheder der søger forsikring.
        </p>

        <h2 id="cookies">Cookies</h2>

        <p>
          Siden bruger <b>én cookie</b>, og den sættes først, når I logger ind for at se
          jeres tilbud:
        </p>

        <div className="tabelboks">
          <table>
            <thead>
              <tr><th>Navn</th><th>Levetid</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>kunde</b><br />
                  Holder jer logget ind, så I ikke skal bede om en ny kode hver gang.
                  Kan ikke læses af scripts i browseren.
                </td>
                <td>30 dage</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Den er teknisk nødvendig for den funktion, I selv har bedt om, og kræver derfor
          ikke samtykke. Derfor er der ikke noget cookiebanner.
        </p>

        <p>
          <b>Vi bruger ingen sporing.</b> Ingen Google Analytics, ingen Facebook-pixel,
          ingen reklamecookies, intet der følger jer videre til andre sider.
        </p>

        <h2 id="aendringer">Ændringer</h2>
        <p>
          Ændrer vi i politikken, opdaterer vi versionsnummeret øverst. Er ændringen
          væsentlig for en sag, I har hos os, får I besked på mail.
        </p>

        <div className="slutcta">
          <h2>Vil I vide, hvad der sendes videre?</h2>
          <p>Det står skridt for skridt på siden om, hvordan det hele fungerer.</p>
          <Link href="/saadan-virker-det" className="alink">Sådan virker siden</Link>
        </div>
      </article>
    </main>
  );
}
