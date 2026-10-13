'use client';

import { useState } from 'react';

/**
 * Kunden vælger et selskab.
 *
 * Vi formidler ikke aftalen. Vi sender kundens valg og oplysninger
 * videre, og selskabet udarbejder den endelige police. Derfor hedder
 * knappen "Gå videre med", ikke "Køb".
 */

const kr = (n: number) => new Intl.NumberFormat('da-DK').format(Math.round(n)) + ' kr.';

export default function Vaelg({
  tilbudId, selskab, pris,
}: { tilbudId: string; selskab: string; pris: number }) {
  const [aaben, setAaben] = useState(false);
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [fejl, setFejl] = useState('');
  const [sender, setSender] = useState(false);

  async function send() {
    if (!s1 || !s2) { setFejl('Sæt begge flueben for at sende videre.'); return; }
    setFejl(''); setSender(true);
    try {
      const r = await fetch('/api/vaelg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tilbudId }),
      });
      const d = await r.json();
      if (!r.ok) { setFejl(d.fejl ?? 'Vi kunne ikke sende jeres valg.'); return; }
      location.reload();
    } catch {
      setFejl('Der skete en fejl. Prøv igen om lidt.');
    } finally {
      setSender(false);
    }
  }

  return (
    <>
      <button className="btn small" onClick={() => setAaben(true)}>
        Gå videre med {selskab}
      </button>

      {aaben && (
        <div className="ovl" onMouseDown={(e) => { if (e.target === e.currentTarget) setAaben(false); }}>
          <div className="modal" role="dialog" aria-modal="true">
            <div className="mtop">
              <span className="pill">Videre til selskabet</span>
              <button className="xbtn" onClick={() => setAaben(false)} aria-label="Luk">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <h3 className="midt">Gå videre med {selskab}</h3>
            <p className="mlead midt">
              Vi sender jeres oplysninger og valg til {selskab}. Selskabet udarbejder
              den endelige police og sender den til jer. Aftalen indgås mellem jer og
              selskabet, og I skriver under hos dem.
            </p>

            <div className="talblok">
              <div className="talnum" style={{ fontSize: 'clamp(34px,9vw,48px)' }}>{kr(pris)}</div>
              <div className="talkilde">pr. år</div>
            </div>

            <label className="consent big">
              <input type="checkbox" checked={s1} onChange={(e) => setS1(e.target.checked)} />
              <span>Jeg ønsker, at {selskab} udarbejder det endelige tilbud til virksomheden.</span>
            </label>
            <label className="consent big">
              <input type="checkbox" checked={s2} onChange={(e) => setS2(e.target.checked)} />
              <span>
                Jeg giver samtykke til, at mine oplysninger sendes til {selskab},
                som må kontakte mig om tilbuddet.
              </span>
            </label>

            <p className="err">{fejl}</p>

            <div className="mact">
              <span />
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn quiet" onClick={() => setAaben(false)}>Fortryd</button>
                <button className="btn" onClick={send} disabled={sender}>
                  {sender ? <><span className="spin" />Sender…</> : 'Send til selskabet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
