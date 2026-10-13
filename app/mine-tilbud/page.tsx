import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import Login from './Login';
import Vaelg from './Vaelg';

/**
 * Kundens overblik over de indkomne tilbud.
 *
 * Adgangen er cookien, der sættes efter login med engangskode.
 * Uden cookie vises login-formularen.
 */

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

const kr = (n: number) => new Intl.NumberFormat('da-DK').format(Math.round(n)) + ' kr.';
const tal = (n: number) => new Intl.NumberFormat('da-DK').format(Math.round(n));
const dec = (n: number) =>
  new Intl.NumberFormat('da-DK', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);

export default async function MineTilbud() {
  const mail = (await cookies()).get('kunde')?.value;
  if (!mail) return <Login />;

  const { data, error } = await db()
    .from('sager')
    .select('*, tilbud(*, modtagere(navn, type))')
    .ilike('kontakt_mail', mail)
    .order('oprettet', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return <Besked titel="Der skete en fejl"
                   tekst="Vi kunne ikke hente jeres tilbud. Prøv igen om lidt." />;
  }

  if (!data) {
    return <Besked titel="Vi fandt ingen forespørgsel"
                   tekst={`Der ligger ingen sag på ${mail}. Har I brugt en anden mailadresse?`} />;
  }

  const sag: any = data;
  const alle: any[] = sag.tilbud ?? [];

  const modtagne = alle.filter((t) => t.status === 'modtaget');
  const valgt = alle.find((t) => t.status === 'valgt');
  const afventer = alle.filter((t) => t.status === 'afventer');
  const afvist = alle.filter((t) => t.status === 'afvist');

  const billigst = modtagne.length
    ? modtagne.reduce((a, b) => (a.pris_aarlig < b.pris_aarlig ? a : b))
    : null;
  const dyrest = modtagne.length
    ? modtagne.reduce((a, b) => (a.pris_aarlig > b.pris_aarlig ? a : b))
    : null;
  const spredning = billigst && dyrest ? dyrest.pris_aarlig - billigst.pris_aarlig : 0;

  // Rækkefølge: valgt, så billigst først, derefter afventende og afviste.
  const raekke = [
    ...(valgt ? [valgt] : []),
    ...modtagne.filter((t) => t.id !== valgt?.id).sort((a, b) => a.pris_aarlig - b.pris_aarlig),
    ...afventer,
    ...afvist,
  ];

  return (
    <main>
      <section className="prishero">
        <div className="c">
          {valgt ? (
            <>
              <p className="plabel">Sendt videre til <b>{valgt.modtagere?.navn}</b></p>
              <p className="pbig">{tal(valgt.pris_aarlig)}<span className="kr">kr./år</span></p>
              <p className="pmeta">
                {valgt.modtagere?.navn} kontakter jer og sender den endelige aftale.
                Aftalen indgås direkte mellem jer og selskabet.
              </p>
            </>
          ) : billigst ? (
            <>
              <p className="plabel">Laveste tilbud til <b>{sag.firmanavn}</b></p>
              <p className="pbig">{tal(billigst.pris_aarlig)}<span className="kr">kr./år</span></p>
              <p className="pmeta">
                fra {billigst.modtagere?.navn} · {modtagne.length} af {alle.length} har svaret
              </p>
              {spredning > 0 && (
                <span className="pprog">
                  Der er {tal(spredning)} kr. om året mellem højeste og laveste tilbud
                </span>
              )}
            </>
          ) : (
            <>
              <p className="plabel">Forespørgsel sendt for <b>{sag.firmanavn}</b></p>
              <p style={{ fontSize: 'clamp(26px,5.2vw,36px)', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
                Venter på svar
              </p>
              <div className="venteboks">
                <p className="vtitel">I behøver ikke blive på siden</p>
                <p className="vtekst">
                  Inden for <b>1 hverdag</b> sender vi jer en mail, så snart vi har samlet{' '}
                  <b>mindst 3 tilbud</b>.
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      <div className="c">
        <div className="grid">
          <div>
            <div className="card">
              <div className="chead">
                <h2>Jeres tilbud</h2>
                <span className="pill">
                  {modtagne.length} modtaget · {afventer.length} afventer
                </span>
              </div>

              <div className="tilbudliste">
                {raekke.map((t) => {
                  const erBilligst = billigst && t.id === billigst.id && !valgt;
                  const erValgt = t.status === 'valgt';
                  const diff = billigst && t.pris_aarlig
                    ? t.pris_aarlig - billigst.pris_aarlig : 0;

                  return (
                    <div key={t.id} className={`tkort${erValgt ? ' valgt' : ''}`}>
                      <div className="trow">
                        <div className="tnavn">
                          {t.modtagere?.navn}
                          {erBilligst && <span className="tbedst">Laveste pris</span>}
                          {erValgt && <span className="tbedst">Sendt videre</span>}
                        </div>

                        {t.status === 'modtaget' || t.status === 'valgt' ? (
                          <div className="tpris">
                            {kr(t.pris_aarlig)}
                            {diff > 0
                              ? <span className="tdiff">+{tal(diff)} kr.</span>
                              : <span>pr. år</span>}
                          </div>
                        ) : (
                          <div className="tstatus">
                            {t.status === 'afventer' ? 'Afventer svar'
                             : t.status === 'afvist' ? 'Giver ikke tilbud' : 'Lukket'}
                          </div>
                        )}
                      </div>

                      {t.status === 'modtaget' && (
                        <>
                          <div className="tmeta">
                            {[
                              t.bindingsperiode,
                              t.gyldig_til ? `gælder til ${t.gyldig_til}` : null,
                            ].filter(Boolean).join(' · ')}
                          </div>
                          {t.bemaerkning && <div className="tbem"><span>{t.bemaerkning}</span></div>}
                          <div className="tact">
                            <Vaelg tilbudId={t.id} selskab={t.modtagere?.navn ?? ''}
                                   pris={t.pris_aarlig} />
                          </div>
                        </>
                      )}

                      {t.status === 'afvist' && t.afvis_grund && (
                        <div className="tmeta">{t.afvis_grund}</div>
                      )}
                      {erValgt && (
                        <div className="tmeta">Sendt videre · selskabet udarbejder den endelige aftale</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <div className="panel">
              <h2>Det de har fået</h2>
              <div className="breakdown">
                <div className="ln"><b>Virksomhed</b><span>{sag.firmanavn}</span></div>
                <div className="ln"><b>CVR</b><span className="code">{sag.cvr}</span></div>
                <div className="ln"><b>Branchekode</b><span className="code">{sag.branchekode || '—'}</span></div>
                <div className="ln"><b>Årsværk</b><span>{dec(Number(sag.aarsvaerk))}</span></div>
                {sag.estimat_total && (
                  <div className="ln tot"><b>Vores estimat</b><span>{kr(sag.estimat_total)}</span></div>
                )}
              </div>
              <p className="note">
                Estimatet er vores eget og ikke et tilbud. Priserne er selskabernes egne.
                Forsikringsaftalen indgås direkte mellem jer og det selskab, I vælger.
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
