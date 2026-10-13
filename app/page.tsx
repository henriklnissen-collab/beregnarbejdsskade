'use client';

import { useState, useRef, useEffect } from 'react';
import { beregn, kroner, SATSER, type Prisgruppe, type Estimat } from '@/lib/priser';

type Firma = {
  cvr: string;
  firmanavn: string;
  branchekode: string;
  branchetekst: string;
  aarsvaerk: number | null;
  periode: string | null;
  prisgruppe: Prisgruppe;
  kilde: 'cvr' | 'eksempeldata';
};

type Modtager = { id: string; navn: string; type: 'selskab' | 'maegler' };

const Flueben = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="var(--primary)"
       strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 10.5l4 4 8-9" />
  </svg>
);

const Kryds = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const dec = (n: number) =>
  new Intl.NumberFormat('da-DK', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);
const tal = (n: number) => new Intl.NumberFormat('da-DK').format(Math.round(n));

export default function Side() {
  const [firma, setFirma] = useState<Firma | null>(null);
  const [aarsvaerk, setAarsvaerk] = useState<number | null>(null);
  const [gruppe, setGruppe] = useState<Prisgruppe | null>(null);
  const [aarsvaerkPopup, setAarsvaerkPopup] = useState(false);
  const [forespoergsel, setForespoergsel] = useState(false);
  const [sendt, setSendt] = useState<{ antal: number } | null>(null);

  function forfra() {
    setFirma(null); setAarsvaerk(null); setGruppe(null);
    setForespoergsel(false); setSendt(null);
  }

  if (!firma) {
    return (
      <Forside onFundet={(f) => {
        setFirma(f); setGruppe(f.prisgruppe);
        setAarsvaerk(null); setAarsvaerkPopup(true);
      }} />
    );
  }

  const estimat: Estimat | null = gruppe && aarsvaerk ? beregn(gruppe, aarsvaerk) : null;

  if (sendt) {
    return <Kvittering firma={firma} antal={sendt.antal} onForfra={forfra} />;
  }

  return (
    <>
      <Beregner
        firma={firma} gruppe={gruppe!} aarsvaerk={aarsvaerk} estimat={estimat}
        onGruppe={setGruppe}
        onRet={() => setAarsvaerkPopup(true)}
        onVidere={() => setForespoergsel(true)}
        onForfra={forfra}
      />
      {aarsvaerkPopup && (
        <AarsvaerkPopup
          firma={firma} start={aarsvaerk ?? firma.aarsvaerk}
          onGem={(n) => { setAarsvaerk(n); setAarsvaerkPopup(false); }}
          onLuk={() => setAarsvaerkPopup(false)}
        />
      )}
      {forespoergsel && estimat && (
        <ForespoergselPopup
          firma={firma} gruppe={gruppe!} aarsvaerk={aarsvaerk!}
          onLuk={() => setForespoergsel(false)}
          onSendt={(antal) => { setForespoergsel(false); setSendt({ antal }); }}
        />
      )}
    </>
  );
}

/* ───────────────────────── forside ───────────────────────── */

function Forside({ onFundet }: { onFundet: (f: Firma) => void }) {
  const [vaerdi, setVaerdi] = useState('');
  const [fejl, setFejl] = useState('');
  const [henter, setHenter] = useState(false);
  const felt = useRef<HTMLInputElement>(null);

  useEffect(() => { felt.current?.focus(); }, []);

  const cifre = vaerdi.replace(/\D/g, '');
  const gyldig = cifre.length === 8;

  async function slaaOp() {
    if (!gyldig) { setFejl('Et CVR-nummer består af 8 cifre.'); return; }
    setFejl(''); setHenter(true);
    try {
      const r = await fetch(`/api/cvr?cvr=${cifre}`);
      const d = await r.json();
      if (!r.ok) { setFejl(d.fejl ?? 'Vi kunne ikke slå virksomheden op.'); return; }
      onFundet(d as Firma);
    } catch {
      setFejl('Der skete en fejl. Prøv igen om lidt.');
    } finally {
      setHenter(false);
    }
  }

  return (
    <main className="start">
      <div className="c">
        <div className="inner">
          <span className="badge"><Flueben />Lovpligtig når I har ansatte</span>
          <h1>Hvad koster jeres arbejdsskadeforsikring?</h1>
          <p className="sub">Skriv CVR-nummeret. Vi henter resten.</p>
          <div className="boble">Beregn nu, og se om du kan spare penge</div>

          <div className="startform">
            <input
              ref={felt} type="text" inputMode="numeric" maxLength={9} autoComplete="off"
              placeholder="Skriv dit CVR-nummer" aria-label="Virksomhedens CVR-nummer"
              value={vaerdi}
              onChange={(e) => {
                const r = e.target.value.replace(/\D/g, '').slice(0, 8);
                setVaerdi(r.length > 4 ? `${r.slice(0, 4)} ${r.slice(4)}` : r);
                if (fejl) setFejl('');
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') slaaOp(); }}
            />
            <button className="btn" onClick={slaaOp} disabled={!gyldig || henter}>
              {henter ? <><span className="spin" />Henter…</> : 'Se prisen'}
            </button>
          </div>

          <p className="err" style={{ textAlign: 'center' }}>{fejl}</p>
          <p className="startnote">Gratis og uforpligtende</p>

          <div className="tre">
            <span><Flueben />Pris på under et minut</span>
            <span><Flueben />Ingen oplysninger om løn</span>
            <span><Flueben />Du binder dig ikke</span>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ───────────────────────── beregner ───────────────────────── */

function Beregner({
  firma, gruppe, aarsvaerk, estimat, onGruppe, onRet, onVidere, onForfra,
}: {
  firma: Firma; gruppe: Prisgruppe; aarsvaerk: number | null; estimat: Estimat | null;
  onGruppe: (g: Prisgruppe) => void; onRet: () => void;
  onVidere: () => void; onForfra: () => void;
}) {
  return (
    <main>
      <section className="prishero">
        <div className="c">
          <div className="crumbrow">
            <button className="crumb" onClick={onForfra}>Start forfra</button>
          </div>

          <p className="plabel">Vejledende årspris for <b>{firma.firmanavn}</b></p>

          {estimat ? (
            <>
              <p className="pbig">
                {tal(estimat.middel)}<span className="kr">kr./år</span>
              </p>
              <p className="pmeta">
                Typisk niveau · markedet spænder fra {tal(estimat.lav)} til{' '}
                {tal(estimat.hoej)} kr. · {kroner(estimat.maanedligt)} om måneden
              </p>
              <span className="pprog">
                Svarer til {tal(estimat.prAarsvaerk)} kr. pr. årsværk
              </span>
              <div className="phandling">
                <button className="btn stor" onClick={onVidere}>
                  Få tilbud fra selskaberne
                </button>
              </div>
              <p style={{ marginTop: 16 }}>
                <button className="linkbtn" onClick={onRet}>Ret oplysningerne</button>
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
                Næsten der
              </p>
              <div className="phandling">
                <button className="btn" onClick={onRet}>Bekræft antal årsværk</button>
              </div>
            </>
          )}
        </div>
      </section>

      <div className="c">
        <div className="enkelt">
          <div className="card">
            <div className="chead">
              <h2>Virksomhedens oplysninger</h2>
              <span className="pill">
                {firma.kilde === 'cvr' ? 'Hentet fra CVR' : 'Eksempeldata'}
              </span>
            </div>

            <div className="breakdown">
              <div className="ln"><b>Virksomhed</b><span>{firma.firmanavn}</span></div>
              <div className="ln"><b>CVR-nummer</b><span className="code">{firma.cvr}</span></div>
              <div className="ln"><b>Branchekode</b><span className="code">{firma.branchekode || '—'}</span></div>
              <div className="ln"><b>Branche</b><span>{firma.branchetekst || '—'}</span></div>
              <div className="ln">
                <b>Årsværk</b>
                <span>{aarsvaerk ? `${dec(aarsvaerk)} · bekræftet` : 'Ikke bekræftet endnu'}</span>
              </div>
            </div>

            <label className="f" htmlFor="br" style={{ marginTop: 24 }}>
              Prisgruppe ud fra branchekoden
            </label>
            <select id="br" value={gruppe} onChange={(e) => onGruppe(e.target.value as Prisgruppe)}>
              {Object.entries(SATSER).map(([n, s]) => (
                <option key={n} value={n}>{s.navn}</option>
              ))}
            </select>
            <p className="help">
              Udfyldt ud fra branchekode {firma.branchekode || '—'}.
              Ret den, hvis arbejdet i praksis ser anderledes ud end koden.
            </p>

            {estimat && (
              <>
                <div className="breakdown" style={{ marginTop: 24 }}>
                  <div className="ln">
                    <b>Risikoklasse</b>
                    <span>{estimat.klasse} · {estimat.klassenavn}</span>
                  </div>
                  <div className="ln">
                    <b>Årspræmie, typisk</b>
                    <span>{kroner(estimat.middel)}</span>
                  </div>
                  <div className="ln">
                    <b>Spænd i markedet</b>
                    <span>{kroner(estimat.lav)} – {kroner(estimat.hoej)}</span>
                  </div>
                  <div className="ln tot">
                    <b>Pris pr. årsværk</b>
                    <span>{kroner(estimat.prAarsvaerk)}</span>
                  </div>
                </div>

                <p className="note" style={{ marginTop: 20 }}>
                  Præmien indeholder lovpligtigt arbejdsmiljøbidrag på 2 % og 30 kr.
                  pr. årsværk til Garantifonden. Bidraget til Arbejdsmarkedets
                  Erhvervssikring for erhvervssygdomme kommer oveni og opkræves
                  særskilt via Samlet Betaling — det går ikke til forsikringsselskabet
                  og er det samme, uanset hvilket selskab I vælger.
                </p>

                <p className="note">
                  Estimatet er vejledende og ikke et tilbud. Den endelige præmie
                  fastsættes af forsikringsselskabet efter en konkret vurdering og
                  reguleres efter årets faktiske antal årsværk. Efter Højesterets dom
                  af 28. april 2026 om erhvervsevnetab forventes priserne at stige ved
                  fornyelse.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ───────────────────── popup: årsværk ───────────────────── */

function AarsvaerkPopup({
  firma, start, onGem, onLuk,
}: {
  firma: Firma; start: number | null;
  onGem: (n: number) => void; onLuk: () => void;
}) {
  const [ret, setRet] = useState(firma.aarsvaerk === null);
  const [vaerdi, setVaerdi] = useState(start !== null ? String(start).replace('.', ',') : '');
  const [fejl, setFejl] = useState('');
  const felt = useRef<HTMLInputElement>(null);

  useEffect(() => { if (ret) { felt.current?.focus(); felt.current?.select(); } }, [ret]);
  useLaast(onLuk);

  function gem() {
    const n = parseFloat(vaerdi.replace(',', '.').replace(/[^\d.]/g, ''));
    if (!n || n <= 0) { setFejl('Skriv et tal, for eksempel 4,2.'); return; }
    onGem(n);
  }

  return (
    <Overlay onLuk={onLuk}>
      <div className="mtop">
        <span className="pill">Sidste trin</span>
        <button className="xbtn" onClick={onLuk} aria-label="Luk"><Kryds /></button>
      </div>

      {!ret && firma.aarsvaerk !== null ? (
        <>
          <h3 className="midt">Passer antal årsværk?</h3>
          <div className="talblok">
            <div className="talnum">{dec(firma.aarsvaerk)}</div>
            <div className="talenh">årsværk</div>
            <div className="talkilde">ifølge CVR · {firma.periode ?? 'seneste opgørelse'}</div>
          </div>
          <div className="mvalg">
            <button className="btn stor block" onClick={() => onGem(firma.aarsvaerk!)}>
              Ja, det passer
            </button>
            <button className="btn quiet block" onClick={() => setRet(true)}>
              Nej, ret tallet
            </button>
          </div>
        </>
      ) : (
        <>
          <h3 className="midt">Hvor mange årsværk er I?</h3>
          <p className="mlead midt">Én person på fuld tid i et helt år er ét årsværk.</p>
          <input
            ref={felt} type="text" inputMode="decimal" className="stortal"
            aria-label="Antal årsværk" value={vaerdi}
            onChange={(e) => { setVaerdi(e.target.value); if (fejl) setFejl(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') gem(); }}
          />
          <p className="err midt">{fejl}</p>
          <div className="mvalg">
            <button className="btn stor block" onClick={gem}>Se prisen</button>
          </div>
        </>
      )}
    </Overlay>
  );
}

/* ─────────────── popup: forespørgsel i tre trin ─────────────── */

function ForespoergselPopup({
  firma, gruppe, aarsvaerk, onLuk, onSendt,
}: {
  firma: Firma; gruppe: Prisgruppe; aarsvaerk: number;
  onLuk: () => void; onSendt: (antal: number) => void;
}) {
  const [trin, setTrin] = useState(0);
  const [modtagere, setModtagere] = useState<Modtager[] | null>(null);
  const [valgt, setValgt] = useState<Set<string>>(new Set());
  const [vaelgSelv, setVaelgSelv] = useState(false);

  const [navn, setNavn] = useState('');
  const [tlf, setTlf] = useState('');
  const [mail, setMail] = useState('');
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);

  const [fejl, setFejl] = useState('');
  const [sender, setSender] = useState(false);

  useLaast(onLuk);

  useEffect(() => {
    fetch('/api/modtagere')
      .then((r) => r.json())
      .then((d) => {
        const liste: Modtager[] = d.modtagere ?? [];
        setModtagere(liste);
        // Selskaberne er forvalgt. Mæglerne er et andet produkt.
        setValgt(new Set(liste.filter((m) => m.type === 'selskab').map((m) => m.id)));
      })
      .catch(() => setModtagere([]));
  }, []);

  const selskaber = (modtagere ?? []).filter((m) => m.type === 'selskab');
  const maeglere = (modtagere ?? []).filter((m) => m.type === 'maegler');

  function skift(id: string) {
    const n = new Set(valgt);
    n.has(id) ? n.delete(id) : n.add(id);
    setValgt(n);
  }

  async function send() {
    setFejl('');
    if (!s1 || !s2) { setFejl('Sæt begge flueben for at sende forespørgslen.'); return; }
    setSender(true);
    try {
      const r = await fetch('/api/forespoergsel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvr: firma.cvr,
          firmanavn: firma.firmanavn,
          branchekode: firma.branchekode,
          branchetekst: firma.branchetekst,
          prisgruppe: gruppe,
          aarsvaerk,
          aarsvaerkCvr: firma.aarsvaerk,
          aarsvaerkPeriode: firma.periode,
          modtagere: [...valgt],
          kontaktNavn: navn,
          kontaktMail: mail,
          kontaktTlf: tlf || null,
          samtykkeVideregivelse: s1,
          samtykkeSkadesoplysninger: s2,
        }),
      });
      const d = await r.json();
      if (!r.ok) { setFejl(d.fejl ?? 'Vi kunne ikke sende forespørgslen.'); return; }
      onSendt(d.antalModtagere ?? valgt.size);
    } catch {
      setFejl('Der skete en fejl. Prøv igen om lidt.');
    } finally {
      setSender(false);
    }
  }

  const prikker = (
    <div className="steps" aria-hidden="true">
      {[0, 1, 2].map((i) => <i key={i} className={i <= trin ? 'on' : ''} />)}
    </div>
  );

  return (
    <Overlay onLuk={onLuk}>
      <div className="mtop">
        <span className="pill">Trin {trin + 1} af 3</span>
        <button className="xbtn" onClick={onLuk} aria-label="Luk"><Kryds /></button>
      </div>

      {trin === 0 && (
        modtagere === null ? (
          <p className="mlead midt">Henter selskaber…</p>
        ) : modtagere.length === 0 ? (
          <>
            <h3 className="midt">Ingen selskaber er klar endnu</h3>
            <p className="mlead midt">
              Der er endnu ikke aftaler med nogen selskaber. Sæt <b>aktiv</b> til
              sand på mindst én række i tabellen <b>modtagere</b> i Supabase.
            </p>
            <div className="mvalg">
              <button className="btn quiet block" onClick={onLuk}>Luk</button>
            </div>
          </>
        ) : !vaelgSelv ? (
          <>
            <h3 className="midt">Send til alle selskaber?</h3>
            <p className="mlead midt">
              Vi sender jeres oplysninger til {selskaber.length}{' '}
              {selskaber.length === 1 ? 'forsikringsselskab' : 'forsikringsselskaber'},
              så I kan sammenligne priserne ét sted.
            </p>
            <div className="mvalg">
              <button className="btn stor block" onClick={() => {
                setValgt(new Set(selskaber.map((m) => m.id)));
                setTrin(1);
              }}>
                Ja, send til alle
              </button>
              <button className="btn quiet block" onClick={() => setVaelgSelv(true)}>
                Jeg vælger selv
              </button>
            </div>
          </>
        ) : (
          <>
            <h3>Hvem skal give tilbud?</h3>
            <p className="mlead">{valgt.size} valgt</p>
            <div className="mscroll">
              <Gruppe titel="Forsikringsselskaber" under="Giver tilbud på deres eget produkt."
                      liste={selskaber} valgt={valgt} onSkift={skift} />
              {maeglere.length > 0 && (
                <Gruppe titel="Forsikringsmæglere" under="Indhenter tilbud fra flere selskaber for jer."
                        liste={maeglere} valgt={valgt} onSkift={skift} />
              )}
            </div>
            <p className="err">{fejl}</p>
            <div className="mvalg">
              <button className="btn stor block" onClick={() => {
                if (valgt.size === 0) { setFejl('Vælg mindst én modtager.'); return; }
                setFejl(''); setTrin(1);
              }}>
                Fortsæt
              </button>
            </div>
          </>
        )
      )}

      {trin === 1 && (
        <>
          <h3>Hvor skal tilbuddene sendes hen?</h3>
          <p className="mlead">Selskaberne kontakter jer direkte på oplysningerne her.</p>
          <div className="felter">
            <Felt id="kn" label="Navn" type="text" ac="name" ph="Fornavn Efternavn"
                  vaerdi={navn} onSkriv={setNavn} />
            <Felt id="kt" label="Telefon" type="tel" ac="tel" ph="12 34 56 78"
                  vaerdi={tlf} onSkriv={(v) => {
                    const r = v.replace(/\D/g, '').slice(0, 8);
                    setTlf(r.replace(/(\d{2})(?=\d)/g, '$1 ').trim());
                  }} />
            <Felt id="ke" label="E-mail" type="email" ac="email" ph="navn@firma.dk"
                  vaerdi={mail} onSkriv={setMail} />
          </div>
          <p className="err">{fejl}</p>
          <div className="mact">
            {prikker}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn quiet" onClick={() => setTrin(0)}>Tilbage</button>
              <button className="btn" onClick={() => {
                if (navn.trim().length < 2) { setFejl('Skriv dit navn.'); return; }
                if (!/^\S+@\S+\.\S+$/.test(mail.trim())) { setFejl('Skriv en gyldig e-mail.'); return; }
                setFejl(''); setTrin(2);
              }}>Fortsæt</button>
            </div>
          </div>
        </>
      )}

      {trin === 2 && (
        <>
          <h3>Sidste trin: jeres samtykke</h3>
          <p className="mlead">Begge dele er nødvendige, for at selskaberne kan give jer en rigtig pris.</p>

          <label className="consent big">
            <input type="checkbox" checked={s1} onChange={(e) => setS1(e.target.checked)} />
            <span>
              Jeg giver samtykke til, at mine oplysninger sendes til de valgte selskaber,
              og at de må kontakte mig med et tilbud.
            </span>
          </label>
          <label className="consent big">
            <input type="checkbox" checked={s2} onChange={(e) => setS2(e.target.checked)} />
            <span>
              Jeg giver samtykke til, at selskaberne må indhente virksomhedens
              skadesoplysninger.
            </span>
          </label>

          <p className="err">{fejl}</p>
          <div className="mact">
            {prikker}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn quiet" onClick={() => setTrin(1)}>Tilbage</button>
              <button className="btn" onClick={send} disabled={sender}>
                {sender ? <><span className="spin" />Sender…</> : 'Send forespørgsel'}
              </button>
            </div>
          </div>
        </>
      )}
    </Overlay>
  );
}

function Gruppe({
  titel, under, liste, valgt, onSkift,
}: {
  titel: string; under: string; liste: Modtager[];
  valgt: Set<string>; onSkift: (id: string) => void;
}) {
  const alle = liste.every((m) => valgt.has(m.id));
  return (
    <div className="mgruppe">
      <div className="mghead">
        <div><b>{titel}</b><span>{under}</span></div>
        <button className="btn quiet small" onClick={() => liste.forEach((m) => {
          if (alle === valgt.has(m.id)) onSkift(m.id);
        })}>
          {alle ? 'Fravælg alle' : 'Vælg alle'}
        </button>
      </div>
      <div className="mliste">
        {liste.map((m) => (
          <button key={m.id} className="mrow" aria-pressed={valgt.has(m.id)}
                  onClick={() => onSkift(m.id)}>
            <span className="box" />
            <span className="mnavn">{m.navn}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Felt({
  id, label, type, ac, ph, vaerdi, onSkriv,
}: {
  id: string; label: string; type: string; ac: string; ph: string;
  vaerdi: string; onSkriv: (v: string) => void;
}) {
  const udfyldt =
    type === 'email' ? /^\S+@\S+\.\S+$/.test(vaerdi.trim())
    : type === 'tel' ? vaerdi.replace(/\D/g, '').length >= 8
    : vaerdi.trim().length > 1;

  return (
    <div className={`felt${udfyldt ? ' udfyldt' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className="fwrap">
        <input
          id={id} type={type} autoComplete={ac} placeholder={ph} value={vaerdi}
          inputMode={type === 'email' ? 'email' : type === 'tel' ? 'tel' : undefined}
          autoCapitalize={type === 'email' ? 'off' : type === 'text' ? 'words' : undefined}
          spellCheck={type === 'email' ? false : undefined}
          onChange={(e) => onSkriv(e.target.value)}
        />
        {udfyldt && <span className="fok"><Flueben /></span>}
      </div>
    </div>
  );
}

/* ───────────────────────── kvittering ───────────────────────── */

function Kvittering({
  firma, antal, onForfra,
}: { firma: Firma; antal: number; onForfra: () => void }) {
  return (
    <main>
      <section className="prishero">
        <div className="c">
          <div className="crumbrow">
            <button className="crumb" onClick={onForfra}>Start forfra</button>
          </div>
          <p className="plabel">Forespørgsel sendt for <b>{firma.firmanavn}</b></p>
          <p style={{ fontSize: 'clamp(26px,5.2vw,36px)', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
            Venter på svar
          </p>
          <div className="venteboks">
            <p className="vtitel">I behøver ikke blive på siden</p>
            <p className="vtekst">
              Inden for <b>1 hverdag</b> sender vi jer en mail, så snart vi har samlet{' '}
              <b>mindst 3 tilbud</b>. Mailen indeholder et link, der åbner jeres overblik,
              så I kan sammenligne priserne og vælge.
            </p>
          </div>
        </div>
      </section>

      <div className="c">
        <div className="grid">
          <div className="card">
            <div className="chead"><h2>Det er sendt</h2></div>
            <p className="help" style={{ marginTop: 0 }}>
              Forespørgslen er gemt og ligger klar til {antal}{' '}
              {antal === 1 ? 'modtager' : 'modtagere'}.
            </p>
            <div className="done" style={{ marginTop: 16 }}>
              Mails sendes endnu ikke — det bygges i næste trin.
              Sagen ligger nu i databasen med et engangslink pr. modtager.
            </div>
          </div>
          <div />
        </div>
      </div>
    </main>
  );
}

/* ───────────────────────── fælles ───────────────────────── */

function Overlay({ children, onLuk }: { children: React.ReactNode; onLuk: () => void }) {
  return (
    <div className="ovl" onMouseDown={(e) => { if (e.target === e.currentTarget) onLuk(); }}>
      <div className="modal" role="dialog" aria-modal="true">{children}</div>
    </div>
  );
}

/** Låser baggrunden og lukker på Escape, så længe popup'en er åben. */
function useLaast(onLuk: () => void) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onLuk(); };
    document.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', k);
      document.body.style.overflow = '';
    };
  }, [onLuk]);
}
