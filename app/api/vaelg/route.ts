import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { sendMail, sidensAdresse } from '@/lib/mail';

/**
 * Kunden vælger et selskab.
 *
 * Vi markerer tilbuddet som valgt, lukker de øvrige og sender
 * kundens oplysninger til selskabet. Herfra overtager selskabet.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const mail = (await cookies()).get('kunde')?.value;
  if (!mail) {
    return NextResponse.json({ fejl: 'I er ikke logget ind.' }, { status: 401 });
  }

  let k: { tilbudId?: string };
  try {
    k = await req.json();
  } catch {
    return NextResponse.json({ fejl: 'Ugyldig forespørgsel.' }, { status: 400 });
  }

  const tilbudId = String(k.tilbudId ?? '').trim();
  if (!tilbudId) {
    return NextResponse.json({ fejl: 'Tilbuddet mangler.' }, { status: 400 });
  }

  try {
    const klient = db();

    const { data, error } = await klient
      .from('tilbud')
      .select('id, sag_id, status, pris_aarlig, bindingsperiode, sager(*), modtagere(navn, mail)')
      .eq('id', tilbudId)
      .maybeSingle();

    if (error) throw error;
    const t: any = data;

    if (!t) {
      return NextResponse.json({ fejl: 'Tilbuddet findes ikke.' }, { status: 404 });
    }

    // Tjek at tilbuddet hører til den indloggede kundes sag.
    if (String(t.sager?.kontakt_mail ?? '').toLowerCase() !== mail.toLowerCase()) {
      return NextResponse.json({ fejl: 'Tilbuddet hører ikke til jer.' }, { status: 403 });
    }

    if (t.status !== 'modtaget') {
      return NextResponse.json(
        { fejl: 'Tilbuddet kan ikke vælges længere.' },
        { status: 409 },
      );
    }

    // Det valgte markeres, de øvrige lukkes.
    const { error: vfejl } = await klient
      .from('tilbud').update({ status: 'valgt' }).eq('id', t.id);
    if (vfejl) throw vfejl;

    await klient.from('tilbud')
      .update({ status: 'lukket' })
      .eq('sag_id', t.sag_id)
      .neq('id', t.id)
      .in('status', ['modtaget', 'afventer']);

    await klient.from('sager')
      .update({ status: 'afsluttet', valgt_modtager: t.modtager_id })
      .eq('id', t.sag_id);

    // Selskabet får kundens oplysninger og overtager dialogen.
    const s: any = t.sager;
    const kontakt = [
      ['Kontaktperson', s.kontakt_navn],
      ['E-mail', s.kontakt_mail],
      ['Telefon', s.kontakt_tlf || 'ikke oplyst'],
      ['Virksomhed', s.firmanavn],
      ['CVR', s.cvr],
      ['Branchekode', s.branchekode || '—'],
      ['Årsværk', String(s.aarsvaerk)],
      ['Ønsket startdato', s.startdato || 'snarest'],
      ['Jeres pris', `${new Intl.NumberFormat('da-DK').format(t.pris_aarlig)} kr. om året`],
    ];

    await sendMail({
      til: t.modtagere?.mail ?? '',
      emne: `Kunden har valgt jer: ${s.firmanavn}`,
      tekst:
        `${s.kontakt_navn} har valgt jeres tilbud til ${s.firmanavn}.\n\n` +
        kontakt.map(([a, b]) => `${a}: ${b}`).join('\n') +
        `\n\nKunden afventer, at I sender den endelige police.\n` +
        `Aftalen indgås direkte mellem jer og kunden.\n\n${sidensAdresse()}`,
      html:
        `<div style="font-family:system-ui,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px">` +
        `<h1 style="font-size:23px;color:#0E2B33;margin:0 0 20px">Kunden har valgt jer</h1>` +
        `<p style="margin:0 0 20px">${s.kontakt_navn} har valgt jeres tilbud til ${s.firmanavn}.</p>` +
        `<table style="width:100%;border-collapse:collapse;margin-bottom:20px">` +
        kontakt.map(([a, b]) =>
          `<tr><td style="padding:9px 0;border-top:1px solid #DCE5E6;font-weight:600;color:#0E2B33">${a}</td>` +
          `<td style="padding:9px 0;border-top:1px solid #DCE5E6;text-align:right">${b}</td></tr>`).join('') +
        `</table>` +
        `<p style="margin:0">Kunden afventer, at I sender den endelige police. ` +
        `Aftalen indgås direkte mellem jer og kunden.</p></div>`,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Kunne ikke registrere valg:', e?.message ?? e);
    return NextResponse.json(
      { fejl: 'Vi kunne ikke sende jeres valg lige nu. Prøv igen om lidt.' },
      { status: 502 },
    );
  }
}
