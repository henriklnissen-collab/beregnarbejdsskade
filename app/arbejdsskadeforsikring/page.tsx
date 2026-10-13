import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Arbejdsskadeforsikring: hvad dækker den, og hvem skal have den?',
  description:
    'Arbejdsskadeforsikring er lovpligtig, så snart I har ansatte. Her er hvad den dækker, ' +
    'hvordan den hænger sammen med AES-bidraget, hvem der er undtaget, og hvordan I anmelder en skade.',
  alternates: { canonical: '/arbejdsskadeforsikring' },
  openGraph: {
    type: 'article',
    locale: 'da_DK',
    title: 'Arbejdsskadeforsikring: hvad dækker den, og hvem skal have den?',
    description:
      'Lovpligtig, så snart I har ansatte. Dækning, AES-bidrag, undtagelser og anmeldelsesfrister.',
  },
};

const sporgsmaal = [
  {
    q: 'Skal jeg have arbejdsskadeforsikring, hvis jeg er eneste ansatte i mit ApS?',
    a: 'Ja. Er du ansat i dit eget ApS eller A/S, er du ansat i lovens forstand, og ' +
       'virksomheden skal tegne forsikringen — også selv om der ikke er andre end dig.',
  },
  {
    q: 'Hvad med en enkeltmandsvirksomhed?',
    a: 'Som indehaver af en enkeltmandsvirksomhed er du ikke omfattet af pligten, fordi ' +
       'du ikke er ansat. Du kan tegne en frivillig arbejdsskadeforsikring for dig selv, ' +
       'og du skal tegne en, hvis du ansætter nogen. Medarbejdende ægtefælle skal ' +
       'forsikres særskilt.',
  },
  {
    q: 'Dækker forsikringen også vikarer, elever og løsarbejdere?',
    a: 'Ja. Pligten følger ansættelsen, ikke ansættelsens længde. Også en elev eller en ' +
       'person, der arbejder nogle timer om ugen, skal være dækket.',
  },
  {
    q: 'Hvad er forskellen på arbejdsulykke og erhvervssygdom?',
    a: 'En arbejdsulykke er en pludselig hændelse, der giver en skade — et fald, et snit, ' +
       'et løft. En erhvervssygdom kommer af påvirkninger over tid, fx støj, kemi eller ' +
       'nedslidning. De to dele er forsikret hver for sig: ulykker hos et forsikringsselskab, ' +
       'erhvervssygdomme gennem bidraget til Arbejdsmarkedets Erhvervssikring.',
  },
  {
    q: 'Hvor hurtigt skal en arbejdsulykke anmeldes?',
    a: 'Senest 14 dage efter den ansattes første fraværsdag. Er der ingen fravær, men kan ' +
       'ulykken give krav efter arbejdsskadesikringsloven, er fristen 14 dage efter selve ' +
       'ulykken. Ved dødsfald skal Arbejdsmarkedets Erhvervssikring have besked inden 48 timer.',
  },
  {
    q: 'Dækker den også på vej til og fra arbejde?',
    a: 'Som udgangspunkt nej. Almindelig transport mellem hjem og arbejdsplads regnes ikke ' +
       'som arbejde. Kører du derimod mellem to arbejdssteder i arbejdstiden, er du på arbejde. ' +
       'Grænsetilfælde afgøres konkret, så anmeld hellere end at lade være.',
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
        <h1>Arbejdsskadeforsikring: hvad dækker den, og hvem skal have den?</h1>

        <p className="lead">
          Arbejdsskadeforsikring er lovpligtig, så snart virksomheden har ansatte. Den
          dækker ikke virksomhedens ting, men de mennesker, der arbejder for den — og
          den består af to dele, som mange ikke ved er adskilte.
        </p>

        <p className="opdat">Senest gennemgået oktober 2026</p>

        <nav className="indhold" aria-label="Indhold">
          <b>På denne side</b>
          <ol>
            <li><a href="#lovpligt">Hvornår er den lovpligtig?</a></li>
            <li><a href="#todele">De to dele: ulykker og erhvervssygdomme</a></li>
            <li><a href="#daekning">Hvad dækker den?</a></li>
            <li><a href="#ikke">Hvad dækker den ikke?</a></li>
            <li><a href="#anmeld">Sådan anmelder I en skade</a></li>
            <li><a href="#uden">Hvis I ikke har forsikringen</a></li>
            <li><a href="#dom">Højesterets dom fra april 2026</a></li>
            <li><a href="#sporgsmaal">Spørgsmål og svar</a></li>
          </ol>
        </nav>

        <h2 id="lovpligt">Hvornår er den lovpligtig?</h2>

        <p>
          Pligten står i <b>arbejdsskadesikringsloven</b> og rammer enhver arbejdsgiver med
          ansatte i Danmark. Der er ingen nedre grænse for, hvor mange ansatte man skal have,
          eller hvor mange timer de arbejder. Den første ansættelse udløser pligten.
        </p>

        <p>
          Det overrasker tit ejere af små selskaber: er du ansat i dit eget ApS eller A/S, er
          du ansat i lovens forstand. Virksomheden skal tegne forsikringen, også når der ikke
          er andre end dig.
        </p>

        <p>
          Som indehaver af en <b>enkeltmandsvirksomhed</b> er du derimod ikke omfattet, fordi
          du ikke er ansat af nogen. Du kan tegne en frivillig forsikring for dig selv, og
          mange gør det — en brækket hånd er lige så dyr for en tømrer med eget CVR som for en
          ansat. Ansætter du nogen, gælder pligten med det samme.
        </p>

        <div className="fakta">
          <p>
            <b>Den eneste reelle undtagelse:</b> arbejde i en privat husholdning under
            400 timer om året. Her kræves ingen ulykkesforsikring — men sker der en ulykke,
            skal den stadig anmeldes.
          </p>
        </div>

        <h2 id="todele">De to dele: ulykker og erhvervssygdomme</h2>

        <p>
          Det her er den vigtigste ting at forstå, og den, der oftest misforstås. Lovpligtig
          arbejdsskadesikring består af to dele, som betales til hver sin modtager:
        </p>

        <h3>1. Arbejdsulykker — hos et forsikringsselskab</h3>
        <p>
          Den del køber I som en almindelig forsikring hos et forsikringsselskab. Prisen
          afhænger af branche og antal årsværk, og det er den del, beregneren her på siden
          regner på.
        </p>

        <h3>2. Erhvervssygdomme — gennem AES</h3>
        <p>
          Den del kan man ikke købe hos et forsikringsselskab. Alle arbejdsgivere betaler et
          lovbestemt bidrag til <b>Arbejdsmarkedets Erhvervssikring</b>, og det opkræves
          automatisk sammen med ATP-bidraget via Samlet Betaling. Satsen afhænger af
          virksomhedens branchekode og ligger i 2026 fra omkring 390 kr. til godt 2.300 kr.
          pr. fuldtidsansat om året.
        </p>

        <div className="fakta">
          <p>
            <b>Hvorfor det betyder noget for prissammenligning:</b> AES-bidraget er det
            samme, uanset hvilket forsikringsselskab I vælger. Det er ikke noget, I kan
            forhandle eller spare på. Derfor viser vi det som en separat linje og ikke
            som en del af præmien — ellers ville tilbuddene se dyrere ud, end de er.
          </p>
        </div>

        <h2 id="daekning">Hvad dækker den?</h2>

        <p>
          Dækningen følger af loven og er den samme, uanset hvilket selskab I vælger. Det er
          værd at vide, når man sammenligner priser: I køber den samme lovbestemte dækning,
          så forskellen mellem to tilbud er pris og service, ikke indhold.
        </p>

        <ul>
          <li><b>Behandlingsudgifter</b> — genoptræning, medicin og hjælpemidler, i det omfang det hjælper den tilskadekomne tilbage</li>
          <li><b>Erstatning for tab af erhvervsevne</b> — når skaden varigt sætter indtjeningen ned</li>
          <li><b>Godtgørelse for varigt mén</b> — for selve det varige helbredstab, uanset indtægt</li>
          <li><b>Uddannelsesgodtgørelse</b> — indført med arbejdsskadereformen, så den tilskadekomne kan omskoles til noget andet</li>
          <li><b>Overgangsbeløb og forsørgertabserstatning</b> — til efterladte ved dødsfald</li>
        </ul>

        <p>
          Erstatningerne udbetales efter lovens satser, som reguleres hvert år. De er ikke
          noget, forsikringsselskabet fastsætter.
        </p>

        <h2 id="ikke">Hvad dækker den ikke?</h2>

        <p>
          Arbejdsskadeforsikringen dækker personskade på de ansatte. Den dækker ikke:
        </p>

        <ul>
          <li>Skader på virksomhedens egne maskiner, varer eller bygninger</li>
          <li>Skader, I påfører kunder eller andres ting — det er en erhvervsansvarsforsikring</li>
          <li>Indehaveren af en enkeltmandsvirksomhed, medmindre der er tegnet en frivillig dækning</li>
          <li>Almindelig sygdom, der ikke skyldes arbejdet</li>
        </ul>

        <h2 id="anmeld">Sådan anmelder I en skade</h2>

        <p>
          Anmeldelsen sker i <b>EASY</b>, det fælles system hos Arbejdsmarkedets Erhvervssikring
          og Arbejdstilsynet. Derfra sendes den videre til jeres forsikringsselskab. Husk at
          virksomhedens police skal være oprettet i EASY, før I kan anmelde.
        </p>

        <div className="tabelboks">
          <table>
            <thead>
              <tr><th>Situation</th><th>Frist</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Den ansatte kan ikke arbejde som normalt ud over tilskadekomstdagen</td>
                <td>14 dage efter første fraværsdag</td>
              </tr>
              <tr>
                <td>Intet fravær, men ulykken kan give krav efter loven</td>
                <td>14 dage efter ulykken</td>
              </tr>
              <tr>
                <td>Dødsfald</td>
                <td>48 timer</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          <b>Erhvervssygdomme anmelder I ikke selv.</b> Det gør lægen eller tandlægen, der
          konstaterer sygdommen.
        </p>

        <p>
          Er I i tvivl om, hvorvidt noget skal anmeldes, så anmeld. Det koster ingenting at
          anmelde for meget, og en manglende anmeldelse kan koste den ansatte retten til
          erstatning.
        </p>

        <h2 id="uden">Hvis I ikke har forsikringen</h2>

        <p>
          Loven lægger ansvaret hos arbejdsgiveren. Sker der en arbejdsulykke i en virksomhed
          uden forsikring, får den tilskadekomne stadig sin erstatning — men regningen kan
          lande hos virksomheden selv. Erstatning for tab af erhvervsevne i en alvorlig sag
          løber let op i hundredtusinder af kroner.
        </p>

        <p>
          Er I i tvivl om, hvad der konkret gælder for jer, så spørg{' '}
          <a href="https://www.aes.dk" rel="noopener">Arbejdsmarkedets Erhvervssikring</a>{' '}
          eller en jurist. Vi er ikke en myndighed og giver ikke juridisk rådgivning.
        </p>

        <h2 id="dom">Højesterets dom fra april 2026</h2>

        <p>
          Den 28. april 2026 afsagde Højesteret en dom, der sænker den nedre grænse for,
          hvornår et varigt indtægtstab udløser erstatning for tab af erhvervsevne. Dommen
          gælder også sager, der allerede er afgjort, og kan derfor udløse genoptagelser.
        </p>

        <p>
          Beskæftigelsesministeriet har anslået den samlede regning for private og offentlige
          arbejdsgivere til et sted mellem 10 og 30 milliarder kroner. Flere
          forsikringsselskaber har hensat store beløb og varslet prisstigninger ved fornyelse
          1. januar 2027. Ingen har endnu offentliggjort en procentsats.
        </p>

        <p>
          Hvad det betyder for jer rent praktisk: står I over for en fornyelse, kan prisen
          være en anden end sidste år, og det kan betale sig at få flere tilbud frem for at
          lade policen fornyes stiltiende.
        </p>

        <h2 id="sporgsmaal">Spørgsmål og svar</h2>

        {sporgsmaal.map((s) => (
          <div className="sporg" key={s.q}>
            <h3>{s.q}</h3>
            <p>{s.a}</p>
          </div>
        ))}

        <div className="slutcta">
          <h2>Se hvad den koster for jer</h2>
          <p>Indtast CVR-nummeret. Vi henter branchekode og årsværk selv.</p>
          <Link href="/" className="alink">Beregn prisen</Link>
        </div>

        <div className="kilder">
          <b>Kilder</b>
          <ul>
            <li>
              <a href="https://www.aes.dk/arbejdsgiver" rel="noopener">
                Arbejdsmarkedets Erhvervssikring — arbejdsgiverens pligter
              </a>
            </li>
            <li>
              <a href="https://virk.dk/vejledning/aes/aes-arbejdsulykke/" rel="noopener">
                Virk — anmeldelse af arbejdsulykke og frister
              </a>
            </li>
            <li>
              <a href="https://www.borger.dk/arbejde-dagpenge-ferie/arbejdsskader" rel="noopener">
                Borger.dk — arbejdsskader
              </a>
            </li>
            <li>
              <a href="https://bm.dk/satser/satser-for-2026/arbejdsskadesikring" rel="noopener">
                Beskæftigelsesministeriet — satser for arbejdsskadesikring 2026
              </a>
            </li>
            <li>
              <a href="https://kromannreumert.com/nyheder/hoejesterets-dom-saenker-graensen-erhvervsevnetabserstatning-betydning-forsikringsbranchen" rel="noopener">
                Gennemgang af Højesterets dom af 28. april 2026
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
