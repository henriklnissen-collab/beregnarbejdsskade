import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hvad koster en arbejdsskadeforsikring? Priser og eksempler 2026',
  description:
    'Prisen regnes pr. årsværk og afhænger af branchen. Her er typiske priser for 2026, ' +
    'tre gennemregnede eksempler, de lovbestemte tillæg og hvad I selv kan gøre for at få prisen ned.',
  alternates: { canonical: '/hvad-koster-arbejdsskadeforsikring' },
  openGraph: {
    type: 'article',
    locale: 'da_DK',
    title: 'Hvad koster en arbejdsskadeforsikring? Priser og eksempler 2026',
    description:
      'Typiske priser pr. årsværk fordelt på brancher, regneeksempler og de lovbestemte tillæg.',
  },
};

const KLASSER = [
  ['Kontor, rådgivning, IT, administration', '650 – 2.200'],
  ['Handel, detail, frisør, lettere service', '1.200 – 3.500'],
  ['Restauration, hotel, sundhed og omsorg', '2.000 – 5.500'],
  ['Industri, el og VVS, rengøring, lager', '2.500 – 7.000'],
  ['Transport, maler, lettere håndværk', '3.500 – 8.000'],
  ['Murer, tømrer, anlæg, landbrug', '5.000 – 11.000'],
];

const AES = [
  ['Hotel og restauration', '389'],
  ['Finans og forretningsservice', '457'],
  ['Engros og detail', '539'],
  ['Sundhed', '647'],
  ['Undervisning', '1.006'],
  ['El og VVS', '1.078'],
  ['Landbrug', '1.398'],
  ['Industri', '1.558'],
  ['Transport', '1.576'],
  ['Bygge og anlæg, øvrige', '2.323'],
  ['Sociale institutioner, kultur, renovation', '2.911'],
];

const sporgsmaal = [
  {
    q: 'Hvad koster en arbejdsskadeforsikring til én ansat?',
    a: 'For en kontoransat ligger den typisk omkring 1.500 kr. om året, med et spænd fra ' +
       'cirka 1.100 til 2.500 kr. For en håndværker er den væsentligt højere. Små ' +
       'virksomheder betaler lidt mere pr. årsværk end store, fordi selskabets faste ' +
       'omkostninger fordeles på færre personer.',
  },
  {
    q: 'Beregnes prisen på lønsummen?',
    a: 'Nej. I det danske SMV-marked regnes prisen på antal årsværk og branche, ikke på ' +
       'hvad I betaler i løn. Et årsværk svarer til 1.665 timer. En ansat på 18,5 timer ' +
       'om ugen tæller altså cirka et halvt årsværk, uanset hvad vedkommende tjener.',
  },
  {
    q: 'Hvorfor er prisen så forskellig fra branche til branche?',
    a: 'Fordi risikoen er det. En tømrer kommer statistisk oftere og alvorligere til skade ' +
       'end en revisor, og præmien afspejler, hvad selskabet forventer at betale i erstatning. ' +
       'Forskellen mellem kontor og byggeri er typisk en faktor seks til otte.',
  },
  {
    q: 'Kan jeg forhandle prisen?',
    a: 'Ja. Erhvervspriser er sjældent faste listepriser, og rabat er udbredt — især hvis I ' +
       'samler flere forsikringer samme sted. Det er også derfor, ingen selskaber offentliggør ' +
       'deres erhvervspriser online.',
  },
  {
    q: 'Hvorfor står AES-bidraget som en separat linje?',
    a: 'Fordi det ikke går til forsikringsselskabet. Bidraget til Arbejdsmarkedets ' +
       'Erhvervssikring dækker erhvervssygdomme, opkræves via Samlet Betaling sammen med ' +
       'ATP og er det samme, uanset hvilket selskab I vælger. Lægger man det ind i præmien, ' +
       'ser tilbuddene dyrere ud, end de er.',
  },
  {
    q: 'Stiger priserne i 2027?',
    a: 'Flere selskaber har varslet det efter Højesterets dom af 28. april 2026 om nedre ' +
       'grænse for erhvervsevnetab. Ingen har offentliggjort en sats. Analytikere regner ' +
       'med et sted mellem 5 og 25 procent ved fornyelse 1. januar 2027.',
  },
];

const faqData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: sporgsmaal.map((s) => ({
    '@type': 'Question',
    name: s.q,
    acceptedAnswer: { '@type': 'Answer', text: s.a },
  })),
};

export default function Side() {
  return (
    <main className="c">
      <article className="artikel">
        <h1>Hvad koster en arbejdsskadeforsikring?</h1>

        <p className="lead">
          Prisen regnes pr. årsværk og afhænger først og fremmest af branchen. For
          kontorarbejde ligger den typisk omkring 1.300 kr. pr. årsværk om året. For
          byggeri er den seks til otte gange højere. Her er tallene, regnestykket bag,
          og hvad I selv kan gøre ved det.
        </p>

        <p className="opdat">Priser i 2026-niveau · senest gennemgået oktober 2026</p>

        <nav className="indhold" aria-label="Indhold">
          <b>På denne side</b>
          <ol>
            <li><a href="#typisk">Typiske priser pr. branche</a></li>
            <li><a href="#regnestykke">Sådan regnes prisen ud</a></li>
            <li><a href="#eksempler">Tre gennemregnede eksempler</a></li>
            <li><a href="#tillaeg">De lovbestemte tillæg</a></li>
            <li><a href="#aes">AES-bidraget oveni</a></li>
            <li><a href="#billigere">Hvad kan I selv gøre?</a></li>
            <li><a href="#2027">Hvorfor priserne ventes at stige</a></li>
            <li><a href="#sporgsmaal">Spørgsmål og svar</a></li>
          </ol>
        </nav>

        <h2 id="typisk">Typiske priser pr. branche</h2>

        <p>
          Kroner pr. årsværk pr. år, før de lovbestemte tillæg. Spændet er reelt: det
          laveste tal svarer til en brancheaftale eller en kunde med en stærk
          forhandlingsposition, det højeste til en lille ny kunde uden pakkeaftale.
        </p>

        <div className="tabelboks">
          <table>
            <thead>
              <tr><th>Branche</th><th>Kr. pr. årsværk</th></tr>
            </thead>
            <tbody>
              {KLASSER.map(([navn, pris]) => (
                <tr key={navn}><td>{navn}</td><td>{pris}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="fakta">
          <p>
            <b>Hvorfor der ikke findes en prisliste:</b> ingen danske forsikringsselskaber
            offentliggør deres erhvervspriser. Tallene her bygger på offentligt tilgængelige
            brancheaftaler, Arbejdstilsynets opgørelser over arbejdsgivernes
            gennemsnitsomkostninger og markedsoversigter. De er et pejlemærke, ikke et tilbud.
          </p>
        </div>

        <h2 id="regnestykke">Sådan regnes prisen ud</h2>

        <p>
          Grundregnestykket er enkelt, og det er det samme hos alle selskaber:
        </p>

        <div className="fakta">
          <p><b>Årsværk × branchesats × størrelse × skadehistorik + lovbestemte tillæg</b></p>
        </div>

        <h3>Årsværk, ikke hoveder</h3>
        <p>
          Et årsværk er <b>1.665 timer</b>. En fuldtidsansat på 37 timer tæller 1,0. To
          personer på halv tid tæller tilsammen ét årsværk, ikke to. Prisen hænger altså ikke
          på, hvor mange navne der står på lønlisten, men på hvor meget der bliver arbejdet.
        </p>

        <h3>Branchen</h3>
        <p>
          Selskaberne grupperer brancher i risikoklasser ud fra, hvor ofte og hvor alvorligt
          folk kommer til skade. Det er den enkeltfaktor, der betyder mest — forskellen mellem
          kontor og byggeri er større end alt andet tilsammen.
        </p>

        <h3>Størrelsen</h3>
        <p>
          Små virksomheder betaler typisk 5 til 15 procent mere pr. årsværk end mellemstore,
          fordi selskabets faste omkostninger ved at administrere en police fordeles på færre
          personer. Over cirka 20 årsværk vender det den anden vej.
        </p>

        <h3>Skadehistorikken</h3>
        <p>
          Anmeldte arbejdsulykker de seneste tre år slår igennem på prisen. Nul skader giver
          typisk en mindre rabat, to eller flere et mærkbart tillæg.
        </p>

        <h3>Hvad der ikke indgår</h3>
        <p>
          Lønsummen bruges ikke som grundlag i SMV-markedet, og der er normalt ingen
          selvrisiko på arbejdsskade. Beder nogen jer om lønoplysninger for at give en pris
          på arbejdsskade, er det værd at spørge hvorfor.
        </p>

        <h2 id="eksempler">Tre gennemregnede eksempler</h2>

        <p>
          Årspræmie inklusive lovbestemte tillæg. AES-bidraget står særskilt, fordi det ikke
          er en del af præmien.
        </p>

        <div className="tabelboks">
          <table>
            <thead>
              <tr><th>Virksomhed</th><th>Typisk pris</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Revisionskontor, 3 ansatte</b><br />
                  3 årsværk, skadefri<br />
                  Spænd 2.100 – 6.800 kr. · AES 1.371 kr.</td>
                <td>4.100 kr.</td>
              </tr>
              <tr>
                <td><b>Tømrervirksomhed, 5 ansatte</b><br />
                  5 årsværk, én skade på tre år<br />
                  Spænd 26.900 – 59.100 kr. · AES 11.615 kr.</td>
                <td>43.000 kr.</td>
              </tr>
              <tr>
                <td><b>Restaurant, 12 ansatte</b><br />
                  6 fuldtid + 6 på deltid = 9 årsværk, skadefri, pakkeaftale<br />
                  Spænd 16.800 – 45.800 kr. · AES 3.501 kr.</td>
                <td>29.300 kr.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Læg mærke til restauranten: tolv ansatte, men kun ni årsværk. Havde man regnet på
          hoveder i stedet for timer, ville prisen have været en tredjedel for høj.
        </p>

        <h2 id="tillaeg">De lovbestemte tillæg</h2>

        <p>
          Oven i præmien kommer to beløb, som selskabet opkræver på statens vegne og ikke
          selv tjener på:
        </p>

        <ul>
          <li><b>Arbejdsmiljøbidrag</b> — 2 procent af præmien i 2026</li>
          <li><b>Bidrag til Garantifonden</b> — 30 kr. pr. fuldtidsforsikret i 2026</li>
        </ul>

        <p>
          Til gengæld er arbejdsskadeforsikring <b>fritaget for skadesforsikringsafgiften</b>
          {' '}på 1,1 procent, som ligger på de fleste andre forsikringer. Der lægges altså
          ingen afgift oven i.
        </p>

        <h2 id="aes">AES-bidraget oveni</h2>

        <p>
          Bidraget til Arbejdsmarkedets Erhvervssikring dækker erhvervssygdomme og opkræves
          kvartalsvis via Samlet Betaling sammen med ATP. Det afhænger af branchekoden og er
          det samme, uanset hvilket forsikringsselskab I vælger.
        </p>

        <div className="tabelboks">
          <table>
            <thead>
              <tr><th>Branchegruppe</th><th>Kr. pr. fuldtidsansat, 2026</th></tr>
            </thead>
            <tbody>
              {AES.map(([navn, sats]) => (
                <tr key={navn}><td>{navn}</td><td>{sats}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <p>
          Satserne steg mærkbart fra 2025 til 2026 — for bygge og anlæg fra 1.764 til
          2.323 kr. Den præcise branchegruppe afgøres af jeres branchekode, så slå den op
          hos AES, hvis beløbet skal bruges til budgettet.
        </p>

        <h2 id="billigere">Hvad kan I selv gøre?</h2>

        <p>
          Fem ting flytter noget, og de koster ingenting at prøve:
        </p>

        <ul>
          <li>
            <b>Tjek at branchekoden passer.</b> Står I registreret under en branche, der er
            tungere end det, I reelt laver, betaler I for andres risiko. Branchekoden kan
            rettes i CVR.
          </li>
          <li>
            <b>Regn årsværk korrekt.</b> Deltidsansatte skal regnes som timer, ikke som
            hoveder. Det er den fejl, der oftest gør policen for dyr.
          </li>
          <li>
            <b>Hav en APV, der er til at finde frem.</b> Dokumenteret arbejdsmiljøarbejde
            tæller med i vurderingen hos flere selskaber.
          </li>
          <li>
            <b>Saml forsikringerne ét sted.</b> En samlet erhvervspakke udløser typisk rabat.
          </li>
          <li>
            <b>Lad ikke policen forny sig stiltiende.</b> Prisen er sjældent en listepris, og
            den rykker sig, når der er et konkurrerende tilbud på bordet.
          </li>
        </ul>

        <h2 id="2027">Hvorfor priserne ventes at stige</h2>

        <p>
          Priserne på arbejdsskadeforsikring steg i forvejen omkring 13 procent fra midten af
          2024 til 2026, drevet af arbejdsskadereformen. Oven i det kom Højesterets dom af
          28. april 2026, som sænker den nedre grænse for, hvornår et varigt indtægtstab
          udløser erstatning for tab af erhvervsevne — også i sager, der allerede var afgjort.
        </p>

        <p>
          Flere selskaber har hensat betydelige beløb til gamle sager og varslet stigninger
          ved fornyelse 1. januar 2027. Ingen har offentliggjort en procentsats. Står I over
          for en fornyelse, er det et argument for at hente tilbud ind frem for at acceptere
          det, der kommer af sig selv.
        </p>

        <h2 id="sporgsmaal">Spørgsmål og svar</h2>

        {sporgsmaal.map((s) => (
          <div className="sporg" key={s.q}>
            <h3>{s.q}</h3>
            <p>{s.a}</p>
          </div>
        ))}

        <div className="slutcta">
          <h2>Få jeres eget tal</h2>
          <p>
            Beregneren bruger samme model som på denne side, men med jeres branchekode
            og jeres årsværk. Det tager under et minut.
          </p>
          <Link href="/" className="alink">Beregn prisen</Link>
        </div>

        <div className="kilder">
          <b>Kilder</b>
          <ul>
            <li>
              <a href="https://virk.dk/vejledning/aes/aes-bidrag/" rel="noopener">
                Virk — AES-bidrag og bidragssatser
              </a>
            </li>
            <li>
              <a href="https://at.dk/media/zwbji15n/arbejdsgivernes-omkostninger-forsikringer.pdf" rel="noopener">
                Arbejdstilsynet — arbejdsgivernes omkostninger til forsikringer
              </a>
            </li>
            <li>
              <a href="https://www.skadesgarantifonden.dk/nyheder/meddelelse-om-bidrag-til-garantifonden-for-2026/" rel="noopener">
                Garantifonden — bidrag for 2026
              </a>
            </li>
            <li>
              <a href="https://bm.dk/satser/satser-for-2026/arbejdsskadesikring" rel="noopener">
                Beskæftigelsesministeriet — satser 2026
              </a>
            </li>
            <li>
              <a href="https://www.danskindustri.dk/om-di/kontakt-os/presse/arkiv/pressemeddelelser/2026/4/di-hojesteretsdom-kan-sende-milliardregning-for-gamle-arbejdsskader-til-virksomhederne/" rel="noopener">
                Dansk Industri om Højesterets dom
              </a>
            </li>
          </ul>
        </div>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
    </main>
  );
}
