'use client';

import { useState } from 'react';

/**
 * Selskabets svar.
 *
 * Prisen tastes i felter, ikke i fritekst. Det er hele pointen:
 * en mail med "24.500 kr. ekskl. AES, forudsat ren historik" kan vi
 * ikke vise i et overblik, men de tre oplysninger hver for sig kan vi.
 */

const BINDING = [
  'Ingen binding ud over forsikringsåret',
  '12 måneder',
  '24 måneder',
  '36 måneder',
];

export default function Svarformular({
  token, selskab,
}: { token: string; selskab: string }) {
  const [giverTilbud, setGiverTilbud] = useState(true);
  const [pris, setPris] = useState('');
  const [binding, setBinding] = useState(BINDING[0]);
  const [gyldigTil, setGyldigTil] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  );
  const [bemaerkning, setBemaerkning] = useState('');
  const [grund, setGrund] = useState('');

  const [fejl, setFejl] = useState('');
  const [sender, setSender] = useState(false);
  const [sendt, setSendt] = useState(false);

  async function send() {
    setFejl('');
    const beloeb = Number(pris.replace(/\D/g, ''));

    if (giverTilbud && (!beloeb || beloeb < 500)) {
      setFejl('Skriv den samlede årlige præmie i kroner.');
      return;
    }

    setSender(true);
    try {
      const r = await fetch('/api/svar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          giverTilbud,
          prisAarlig: giverTilbud ? beloeb : null,
          aesInkluderet: giverTilbud ? true : null,
          bindingsperiode: giverTilbud ? binding : null,
          gyldigTil: giverTilbud ? gyldigTil : null,
          bemaerkning: giverTilbud ? bemaerkning.trim() : null,
          afvisGrund: giverTilbud ? null : grund.trim(),
        }),
      });
      const d = await r.json();
      if (!r.ok) { setFejl(d.fejl ?? 'Vi kunne ikke registrere svaret.'); return; }
      setSendt(true);
    } catch {
      setFejl('Der skete en fejl. Prøv igen om lidt.');
    } finally {
      setSender(false);
    }
  }

  if (sendt) {
    return (
      <div className="card">
        <div className="chead"><h2>Svaret er registreret</h2></div>
        <div className="done">
          {giverTilbud
            ? `Prisen er nu synlig i kundens overblik sammen med de øvrige tilbud.`
            : `Vi har noteret, at I ikke giver tilbud på denne opgave. Kunden får besked.`}
        </div>
        <p className="help" style={{ marginTop: 14 }}>
          Vælger kunden jer, sender vi deres oplysninger, og I overtager dialogen.
          Aftalen indgås direkte mellem kunden og jer.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="chead">
        <h2>Jeres svar</h2>
        <span className="pill">Udfyld felterne</span>
      </div>

      <p className="help" style={{ margin: '-10px 0 20px' }}>
        Tallene herunder vises direkte i kundens overblik, så de kan sammenlignes
        med de øvrige tilbud.
      </p>

      <div className="radios" role="group" aria-label="Kan I give tilbud">
        <button aria-pressed={giverTilbud} onClick={() => { setGiverTilbud(true); setFejl(''); }}>
          Vi giver tilbud
        </button>
        <button aria-pressed={!giverTilbud} onClick={() => { setGiverTilbud(false); setFejl(''); }}>
          Vi giver ikke tilbud
        </button>
      </div>

      {giverTilbud ? (
        <div className="felter" style={{ marginTop: 24 }}>
          <div className="felt">
            <label htmlFor="pris">Samlet årlig præmie i kroner</label>
            <div className="fwrap">
              <input
                id="pris" type="text" inputMode="numeric" placeholder="fx 24.500"
                value={pris}
                onChange={(e) => {
                  const r = e.target.value.replace(/\D/g, '').slice(0, 8);
                  setPris(r ? new Intl.NumberFormat('da-DK').format(Number(r)) : '');
                  if (fejl) setFejl('');
                }}
              />
            </div>
          </div>

          <div className="felt">
            <label htmlFor="bind">Bindingsperiode</label>
            <select id="bind" value={binding} onChange={(e) => setBinding(e.target.value)}>
              {BINDING.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>

          <div className="felt">
            <label htmlFor="gyld">Tilbuddet gælder til</label>
            <input id="gyld" type="date" value={gyldigTil}
                   onChange={(e) => setGyldigTil(e.target.value)} />
          </div>

          <div className="felt">
            <label htmlFor="bem">Forbehold eller bemærkninger (valgfrit)</label>
            <div className="fwrap">
              <input id="bem" type="text" placeholder="Fx: Forudsat ren skadehistorik"
                     value={bemaerkning} onChange={(e) => setBemaerkning(e.target.value)} />
            </div>
          </div>
        </div>
      ) : (
        <div className="felter" style={{ marginTop: 24 }}>
          <div className="felt">
            <label htmlFor="grund">Kort begrundelse til kunden</label>
            <div className="fwrap">
              <input id="grund" type="text" placeholder="Fx: Vi tegner ikke denne branche."
                     value={grund} onChange={(e) => setGrund(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      <p className="err">{fejl}</p>

      <div className="mact">
        <span />
        <button className="btn" onClick={send} disabled={sender}>
          {sender ? <><span className="spin" />Sender…</> : 'Send svar til kunden'}
        </button>
      </div>
    </div>
  );
}
