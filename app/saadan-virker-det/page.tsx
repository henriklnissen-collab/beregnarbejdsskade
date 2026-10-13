import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sådan virker siden — og hvad vi ikke er',
  description:
    'Vi sælger ikke forsikringer. Vi beregner et vejledende prisestimat, sender jeres ' +
    'forespørgsel til de selskaber, I vælger, og viser svarene samlet. Aftalen indgås ' +
    'direkte mellem jer og selskabet.',
  alternates: { canonical: '/saadan-virker-det' },
  openGraph: {
    type: 'article',
    locale: 'da_DK',
    title: 'Sådan virker siden — og hvad vi ikke er',
    description:
      'Fra CVR-nummer til tilbud fra flere selskaber. Hvad vi gør, hvad vi ikke gør, ' +
      'og hvilke oplysninger der sendes videre.',
  },
};

const trin = [
  {
    t: 'I skriver CVR-nummeret',
    b: 'Vi henter selv firmanavn, branchekode og det senest indberettede antal årsværk ' +
       'fra Det Centrale Virksomhedsregister. I skal ikke taste noget om løn.',
  },
  {
    t: 'I bekræfter antal årsværk',
    b: 'Tallet fra CVR er et gennemsnit for en periode og passer ikke altid på i dag. ' +
       'Derfor spørger vi, før vi regner. Det er det eneste tal, I selv skal tage stilling til.',
  },
  {
    t: 'I ser en vejledende pris',
    b: 'Beregnet på jeres branche og jeres årsværk. Den er vores egen og ikke et tilbud ' +
       'fra noget selskab. AES-bidraget vises separat, fordi det ikke går til ' +
       'forsikringsselskabet.',
  },
  {
    t: 'I vælger, hvem der må give tilbud',
    b: 'I krydser selv af, hvilke selskaber forespørgslen må sendes til. Intet sendes, ' +
       'før I har sat flueben og trykket send.',
  },
  {
    t: 'Selskaberne svarer med deres pris',
    b: 'Hvert selskab får et link til et skema, hvor de skriver pris, bindingsperiode og ' +
       'hvor længe tilbuddet gælder. Svarene lander direkte i jeres oversigt.',
  },
  {
    t: 'I sammenligner og vælger ét',
    b: 'Når der er mindst tre tilbud, sender vi jer en mail. I logger ind med en ' +
       'engangskode og ser priserne ved siden af hinanden med det laveste markeret.',
  },
  {
    t: 'Selskabet overtager',
    b: 'Vælger I et tilbud, sender vi jeres valg videre. Derfra er det selskabet, der ' +
       'udarbejder policen og kontakter jer. Aftalen indgås mellem jer og dem.',
  },
];

export default function Side() {
  return (
    <main className="c">
      <article className="artikel">
        <h1>Sådan virker siden</h1>

        <p className="lead">
          Vi sælger ikke forsikringer, og vi indgår ikke aftalen. Vi henter oplysningerne,
          regner et vejledende estimat og sender jeres forespørgsel videre til de selskaber,
          I selv vælger. Resten foregår mellem jer og selskabet.
        </p>

        <p className="opdat">Senest opdateret oktober 2026</p>

        <h2 id="trin">Fra CVR-nummer til police</h2>

        <ol>
          {trin.map((x) => (
            <li key={x.t} style={{ marginBottom: 16 }}>
              <b>{x.t}.</b> {x.b}
            </li>
          ))}
        </ol>

        <h2 id="ikke">Hvad vi ikke er</h2>

        <p>
          Det er værd at være præcis om, for det afgør, hvem I har med at gøre, hvis noget
          går galt:
        </p>

        <ul>
          <li>
            <b>Vi er ikke et forsikringsselskab.</b> Vi dækker ingenting og udbetaler ingen
            erstatning.
          </li>
          <li>
            <b>Vi indgår ikke aftalen.</b> Policen udstedes af det selskab, I vælger, og
            aftalen er mellem jer og dem. I skriver under hos dem.
          </li>
          <li>
            <b>Vi er ikke en myndighed.</b> Har I spørgsmål om en konkret arbejdsskade, skal
            I til Arbejdsmarkedets Erhvervssikring, jeres forsikringsselskab eller en jurist.
          </li>
          <li>
            <b>Vores estimat er ikke et tilbud.</b> Den endelige præmie fastsættes af
            selskabet efter en konkret vurdering og kan afvige fra vores tal.
          </li>
        </ul>

        <h2 id="oplysninger">Hvilke oplysninger sendes videre?</h2>

        <p>
          Når I sender forespørgslen, får de selskaber, I har valgt, disse oplysninger:
        </p>

        <ul>
          <li>CVR-nummer, firmanavn, branchekode og branchetekst</li>
          <li>Antal årsværk, som I har bekræftet</li>
          <li>Jeres navn, e-mail og eventuelt telefonnummer</li>
          <li>Ønsket startdato, hvis I har angivet en</li>
        </ul>

        <p>
          Der sendes ingen oplysninger om løn, og ingen oplysninger om navngivne medarbejdere.
          Selskaberne får heller ikke at vide, hvilke andre selskaber I har spurgt.
        </p>

        <p>
          I samme trin beder vi om jeres samtykke til, at selskaberne må indhente
          virksomhedens skadesoplysninger. Uden dem kan de ikke give en reel pris. Hvad vi
          gemmer, og hvor længe, står i{' '}
          <Link href="/privatlivspolitik">privatlivspolitikken</Link>.
        </p>

        <h2 id="pris">Hvad koster det jer?</h2>

        <p>
          Ingenting. I betaler ikke for at bruge beregneren eller for at få tilbud ind, og I
          forpligter jer ikke til noget ved at sende en forespørgsel. Vælger I ingen af
          tilbuddene, sker der ikke mere.
        </p>

        <h2 id="penge">Hvordan tjener vi så penge?</h2>

        <p>
          Aftalerne med forsikringsselskaberne er under indgåelse. Når de er på plads,
          beskriver vi her, hvordan vi bliver betalt, og af hvem.
        </p>

        <p>
          Vi skriver det, fordi I har krav på at vide det. En side, der stiller sig mellem
          jer og et marked, bør kunne gøre rede for, hvem der betaler for den — ellers kan I
          ikke vurdere, om rækkefølgen af tilbud er til jeres fordel eller nogen andens.
          Hos os sorteres tilbuddene efter pris, laveste først.
        </p>

        <h2 id="hvorfor">Hvorfor siden findes</h2>

        <p>
          Arbejdsskadeforsikring er lovpligtig, prisen varierer voldsomt mellem selskaber, og
          ingen af dem offentliggør den. For en mindre virksomhed betyder det i praksis, at
          man tager det, man bliver tilbudt, og aldrig får at vide, hvad alternativet var.
          Siden her findes for at gøre det til et spørgsmål om ti minutter i stedet for en
          formiddag i telefon.
        </p>

        <div className="slutcta">
          <h2>Prøv det</h2>
          <p>Gratis og uforpligtende. I skal kun bruge jeres CVR-nummer.</p>
          <Link href="/" className="alink">Beregn prisen</Link>
        </div>
      </article>
    </main>
  );
}
