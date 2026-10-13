'use client';

import { useState, useRef, useEffect } from 'react';

/**
 * Login med engangskode. Ingen adgangskode at huske.
 *
 * Svaret på en mailadresse er altid det samme, uanset om der findes
 * en sag. Ellers kunne man afprøve adresser og finde ud af, hvilke
 * virksomheder der søger forsikring.
 */

export default function Login() {
  const [trin, setTrin] = useState<'mail' | 'kode'>('mail');
  const [mail, setMail] = useState('');
  const [cifre, setCifre] = useState(['', '', '', '', '', '']);
  const [fejl, setFejl] = useState('');
  const [sender, setSender] = useState(false);
  const [nedtaelling, setNed] = useState(0);

  const mailFelt = useRef<HTMLInputElement>(null);
  const kodeFelter = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { if (trin === 'mail') mailFelt.current?.focus(); }, [trin]);
  useEffect(() => { if (trin === 'kode') kodeFelter.current[0]?.focus(); }, [trin]);

  useEffect(() => {
    if (nedtaelling <= 0) return;
    const t = setTimeout(() => setNed(nedtaelling - 1), 1000);
    return () => clearTimeout(t);
  }, [nedtaelling]);

  async function sendKode() {
    if (!/^\S+@\S+\.\S+$/.test(mail.trim())) {
      setFejl('Skriv en gyldig e-mail.');
      return;
    }
    setFejl(''); setSender(true);
    try {
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail: mail.trim() }),
      });
      const d = await r.json();
      if (!r.ok) { setFejl(d.fejl ?? 'Vi kunne ikke sende koden.'); return; }
      setTrin('kode'); setNed(30); setCifre(['', '', '', '', '', '']);
    } catch {
      setFejl('Der skete en fejl. Prøv igen om lidt.');
    } finally {
      setSender(false);
    }
  }

  async function tjekKode(kode: string) {
    setSender(true);
    try {
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail: mail.trim(), kode }),
      });
      const d = await r.json();
      if (!r.ok) {
        setFejl(d.fejl ?? 'Koden passer ikke.');
        setCifre(['', '', '', '', '', '']);
        kodeFelter.current[0]?.focus();
        return;
      }
      location.reload();
    } catch {
      setFejl('Der skete en fejl. Prøv igen om lidt.');
    } finally {
      setSender(false);
    }
  }

  function skrivCiffer(i: number, v: string) {
    const kun = v.replace(/\D/g, '');
    if (fejl) setFejl('');

    if (kun.length > 1) {
      // hele koden indsat på én gang
      const ny = [...cifre];
      for (let j = 0; j + i < 6 && j < kun.length; j++) ny[i + j] = kun[j];
      setCifre(ny);
      const naeste = Math.min(i + kun.length, 5);
      kodeFelter.current[naeste]?.focus();
      if (ny.every((c) => c)) tjekKode(ny.join(''));
      return;
    }

    const ny = [...cifre];
    ny[i] = kun;
    setCifre(ny);
    if (kun && i < 5) kodeFelter.current[i + 1]?.focus();
    if (ny.every((c) => c)) tjekKode(ny.join(''));
  }

  return (
    <main className="start">
      <div className="c">
        <div className="inner" style={{ maxWidth: 440 }}>
          {trin === 'mail' ? (
            <>
              <h1>Se jeres tilbud</h1>
              <p className="sub">
                Skriv den e-mail, I brugte til forespørgslen. Vi sender en kode.
                Ingen adgangskode at huske.
              </p>

              <div className="felter" style={{ textAlign: 'left' }}>
                <div className={`felt${/^\S+@\S+\.\S+$/.test(mail.trim()) ? ' udfyldt' : ''}`}>
                  <label htmlFor="lmail">E-mail</label>
                  <div className="fwrap">
                    <input
                      ref={mailFelt} id="lmail" type="email" inputMode="email"
                      autoComplete="email" autoCapitalize="off" spellCheck={false}
                      placeholder="navn@firma.dk" value={mail}
                      onChange={(e) => { setMail(e.target.value); if (fejl) setFejl(''); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') sendKode(); }}
                    />
                  </div>
                </div>
              </div>

              <p className="err midt">{fejl}</p>

              <div className="mvalg">
                <button className="btn stor block" onClick={sendKode} disabled={sender}>
                  {sender ? <><span className="spin" />Sender…</> : 'Send mig en kode'}
                </button>
              </div>
            </>
          ) : (
            <>
              <h1>Skriv koden</h1>
              <p className="sub">
                Vi har sendt en 6-cifret kode til<br /><b>{mail}</b>
              </p>

              <div className="kodefelt">
                {cifre.map((c, i) => (
                  <input
                    key={i}
                    ref={(el) => { kodeFelter.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={6}
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    aria-label={`Ciffer ${i + 1}`} value={c}
                    onChange={(e) => skrivCiffer(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !c && i > 0) {
                        const ny = [...cifre]; ny[i - 1] = ''; setCifre(ny);
                        kodeFelter.current[i - 1]?.focus();
                        e.preventDefault();
                      }
                      if (e.key === 'ArrowLeft' && i > 0) {
                        kodeFelter.current[i - 1]?.focus(); e.preventDefault();
                      }
                      if (e.key === 'ArrowRight' && i < 5) {
                        kodeFelter.current[i + 1]?.focus(); e.preventDefault();
                      }
                    }}
                  />
                ))}
              </div>

              <p className="err midt">{fejl}</p>

              <p className="startnote">
                Ikke modtaget noget?{' '}
                <button className="linkbtn" disabled={nedtaelling > 0} onClick={sendKode}>
                  {nedtaelling > 0 ? `Send igen om ${nedtaelling} s` : 'Send koden igen'}
                </button>
              </p>

              <div className="mvalg">
                <button className="btn quiet block" onClick={() => { setTrin('mail'); setFejl(''); }}>
                  Brug en anden e-mail
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
