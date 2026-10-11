import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendMail } from '@/lib/mail';

/**
 * Kundens login med engangskode.
 *
 * POST uden kode  → sender en 6-cifret kode til mailen.
 * POST med kode   → tjekker koden og sætter en cookie.
 *
 * Koden gemmes kun som hash. Svaret er altid det samme, uanset om
 * mailadressen findes — ellers kunne man afprøve adresser og finde
 * ud af, hvilke virksomheder der søger forsikring.
 */

export const dynamic = 'force-dynamic';

const LEVETID_MIN = 5;
const MAKS_FORSOEG = 3;

async function hash(tekst: string): Promise<string> {
  const data = new TextEncoder().encode(tekst);
  const sum = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(sum), (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(req: Request) {
  let k: { mail?: string; kode?: string };
  try {
    k = await req.json();
  } catch {
    return NextResponse.json({ fejl: 'Ugyldig forespørgsel.' }, { status: 400 });
  }

  const mail = String(k.mail ?? '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(mail)) {
    return NextResponse.json({ fejl: 'Skriv en gyldig e-mail.' }, { status: 400 });
  }

  const klient = db();

  // ── Trin 2: koden tjekkes ───────────────────────────────────────
  if (k.kode) {
    const kode = String(k.kode).replace(/\D/g, '');
    if (kode.length !== 6) {
      return NextResponse.json({ fejl: 'Koden er 6 cifre.' }, { status: 400 });
    }

    const { data, error } = await klient
      .from('login_koder')
      .select('id, kode_hash, udloeb, forsoeg, brugt')
      .eq('mail', mail)
      .is('brugt', null)
      .order('oprettet', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    const r: any = data;
    if (!r || new Date(r.udloeb) < new Date()) {
      return NextResponse.json(
        { fejl: 'Koden er udløbet. Bed om en ny.' },
        { status: 400 },
      );
    }

    if (r.forsoeg >= MAKS_FORSOEG) {
      return NextResponse.json(
        { fejl: 'For mange forsøg. Bed om en ny kode.' },
        { status: 429 },
      );
    }

    if ((await hash(kode)) !== r.kode_hash) {
      await klient.from('login_koder')
        .update({ forsoeg: r.forsoeg + 1 })
        .eq('id', r.id);
      return NextResponse.json({ fejl: 'Koden passer ikke.' }, { status: 400 });
    }

    await klient.from('login_koder')
      .update({ brugt: new Date().toISOString() })
      .eq('id', r.id);

    const svar = NextResponse.json({ ok: true });
    svar.cookies.set('kunde', mail, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return svar;
  }

  // ── Trin 1: koden sendes ────────────────────────────────────────
  try {
    const { count } = await klient
      .from('sager')
      .select('id', { count: 'exact', head: true })
      .ilike('kontakt_mail', mail);

    // Findes der ingen sag, sender vi ingen kode — men siger det ikke.
    if (count && count > 0) {
      const kode = String(Math.floor(100000 + Math.random() * 900000));

      await klient.from('login_koder').insert({
        mail,
        kode_hash: await hash(kode),
        udloeb: new Date(Date.now() + LEVETID_MIN * 60000).toISOString(),
      });

      await sendMail({
        til: mail,
        emne: `Din kode: ${kode}`,
        tekst:
          `Din kode til beregnarbejdsskade.dk er ${kode}\n\n` +
          `Koden gælder i ${LEVETID_MIN} minutter.\n\n` +
          `Har du ikke bedt om den, kan du se bort fra denne mail.`,
        html:
          `<div style="font-family:system-ui,Arial,sans-serif;max-width:420px;margin:0 auto;padding:24px">` +
          `<p style="margin:0 0 20px">Din kode til beregnarbejdsskade.dk:</p>` +
          `<p style="font-size:38px;font-weight:800;letter-spacing:.12em;color:#0E2B33;` +
          `background:#E4EFEA;border-radius:12px;padding:20px;text-align:center;margin:0">${kode}</p>` +
          `<p style="margin:20px 0 0;color:#657C84;font-size:15px">` +
          `Koden gælder i ${LEVETID_MIN} minutter. Har du ikke bedt om den, kan du se bort fra denne mail.</p></div>`,
      });
    }

    // Samme svar uanset hvad.
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Login fejlede:', e?.message ?? e);
    return NextResponse.json(
      { fejl: 'Vi kunne ikke sende koden lige nu. Prøv igen om lidt.' },
      { status: 502 },
    );
  }
}

/** Logger ud. */
export async function DELETE() {
  const svar = NextResponse.json({ ok: true });
  svar.cookies.set('kunde', '', { path: '/', maxAge: 0 });
  return svar;
}
