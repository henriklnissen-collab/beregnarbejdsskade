import { db } from '@/lib/db';
import Svarformular from './Svarformular';

/**
 * Selskabets svarside.
 *
 * Nås via engangslinket i mailen. Ingen login — tokenet er adgangen.
 * Tokenet peger på én sag og ét selskab og udløber efter 14 dage.
 */

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

const dec = (n: number) =>
  new Intl.NumberFormat('da-DK', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);

export default async function SvarSide({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const { data, error } = await db()
    .from('tilbud')
    .select('id, status, pris_aarlig, token_udloeb, sager(*), modtagere(navn)')
    .eq('token', token)
    .maybeSingle();

  if (error) {
    return <Besked titel="Der skete en fejl"
                   tekst="Vi kunne ikke hente forespørgslen. Prøv igen om lidt." />;
  }

  if (!data) {
    return <Besked titel="Linket virker ikke"
                   tekst="Linket er enten forkert eller hører til en forespørgsel, der er lukket." />;
  }

  const t: any = data;
  const sag: any = t.sager;
  const modtager: any = t.modtagere;

  if (new Date(t.token_udloeb) < new Date()) {
    return <Besked titel="Linket er udløbet"
                   tekst="Forespørgslen er mere end 14 dage gammel. Kontakt os, hvis den stadig er relevant." />;
  }

  if (t.status !== 'afventer') {
    return (
      <Besked
        titel="I har allerede svaret"
        tekst={
          t.status === 'afvist'
            ? 'Vi har noteret, at I ikke giver tilbud på denne opgave.'
            : `Jeres pris på ${new Intl.NumberFormat('da-DK').format(t.pris_aarlig ?? 0)} kr. om året er registreret og vist til kunden.`
        }
      />
    );
  }

  const sagsid = `AS-${sag.cvr.slice(-4)}-${String(t.id).slice(0, 4).toUpperCase()}`;

  return (
    <main>
      <section className="selskabtop">
        <div className="c">
          <p className="stoplabel">Forespørgsel via beregnarbejdsskade.dk</p>
          <h1>Arbejdsskadeforsikring til {sag.firmanavn}</h1>
          <p className="smeta">
            Til <b>{modtager?.navn ?? 'jer'}</b> · sag {sagsid} · svar udbedes inden 1 hverdag
          </p>
        </div>
      </section>

      <div className="c">
        <div className="grid">
          <div>
            <Svarformular token={token} selskab={modtager?.navn ?? 'jer'} />
          </div>

          <div>
            <div className="panel">
              <h2>Oplysninger om virksomheden</h2>
              <div className="breakdown">
                <div className="ln"><b>Virksomhed</b><span>{sag.firmanavn}</span></div>
                <div className="ln"><b>CVR</b><span className="code">{sag.cvr}</span></div>
                <div className="ln"><b>Branchekode</b><span className="code">{sag.branchekode || '—'}</span></div>
                <div className="ln"><b>Branche</b><span>{sag.branchetekst || '—'}</span></div>
                <div className="ln"><b>Årsværk</b><span>{dec(Number(sag.aarsvaerk))}</span></div>
                <div className="ln"><b>Ønsket startdato</b><span>{sag.startdato || 'snarest'}</span></div>
                <div className="ln"><b>Samtykke til skadesoplysninger</b><span>Ja</span></div>
              </div>
              <p className="note">
                Kunden har givet samtykke til, at I må kontakte dem og indhente
                virksomhedens skadesoplysninger.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Besked({ titel, tekst }: { titel: string; tekst: string }) {
  return (
    <main className="start">
      <div className="c">
        <div className="inner">
          <h1>{titel}</h1>
          <p className="sub">{tekst}</p>
        </div>
      </div>
    </main>
  );
}
