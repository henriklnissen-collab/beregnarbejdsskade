import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Tager imod selskabets svar.
 *
 * Tokenet er adgangen. Vi tjekker her på serveren, at det findes,
 * ikke er udløbet, og at der ikke allerede er svaret. Browseren kan
 * sende hvad som helst, så intet af det tjekkes kun i formularen.
 */

export const dynamic = 'force-dynamic';

type Indgang = {
  token?: string;
  giverTilbud?: boolean;
  prisAarlig?: number | null;
  aesInkluderet?: boolean | null;
  bindingsperiode?: string | null;
  gyldigTil?: string | null;
  bemaerkning?: string | null;
  afvisGrund?: string | null;
};

export async function POST(req: Request) {
  let k: Indgang;
  try {
    k = await req.json();
  } catch {
    return NextResponse.json({ fejl: 'Ugyldig forespørgsel.' }, { status: 400 });
  }

  const token = String(k.token ?? '').trim();
  if (!/^[a-f0-9]{48}$/i.test(token)) {
    return NextResponse.json({ fejl: 'Linket er ikke gyldigt.' }, { status: 400 });
  }

  try {
    const klient = db();

    const { data: raekke, error: hfejl } = await klient
      .from('tilbud')
      .select('id, status, token_udloeb')
      .eq('token', token)
      .maybeSingle();

    if (hfejl) throw hfejl;
    if (!raekke) {
      return NextResponse.json({ fejl: 'Linket virker ikke.' }, { status: 404 });
    }

    const t: any = raekke;

    if (new Date(t.token_udloeb) < new Date()) {
      return NextResponse.json({ fejl: 'Linket er udløbet.' }, { status: 410 });
    }

    if (t.status !== 'afventer') {
      return NextResponse.json(
        { fejl: 'Der er allerede svaret på denne forespørgsel.' },
        { status: 409 },
      );
    }

    const nu = new Date().toISOString();

    if (k.giverTilbud === false) {
      const { error } = await klient
        .from('tilbud')
        .update({
          status: 'afvist',
          besvaret: nu,
          afvis_grund: (k.afvisGrund ?? '').trim() || 'Giver ikke tilbud på denne opgave.',
        })
        .eq('id', t.id);

      if (error) throw error;
      return NextResponse.json({ ok: true, status: 'afvist' });
    }

    const pris = Number(k.prisAarlig);
    if (!Number.isFinite(pris) || pris < 500) {
      return NextResponse.json(
        { fejl: 'Den årlige præmie mangler eller er for lav.' },
        { status: 400 },
      );
    }

    const { error } = await klient
      .from('tilbud')
      .update({
        status: 'modtaget',
        besvaret: nu,
        pris_aarlig: Math.round(pris),
        aes_inkluderet: k.aesInkluderet ?? null,
        bindingsperiode: k.bindingsperiode ?? null,
        gyldig_til: k.gyldigTil || null,
        bemaerkning: (k.bemaerkning ?? '').trim() || null,
      })
      .eq('id', t.id);

    if (error) throw error;

    return NextResponse.json({ ok: true, status: 'modtaget' });
  } catch (e: any) {
    console.error('Kunne ikke registrere svar:', e?.message ?? e);
    return NextResponse.json(
      { fejl: 'Vi kunne ikke registrere svaret lige nu. Prøv igen om lidt.' },
      { status: 502 },
    );
  }
}
