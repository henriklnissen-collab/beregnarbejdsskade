import { NextResponse } from 'next/server';
import { db, nytToken } from '@/lib/db';
import { beregn, type Prisgruppe } from '@/lib/priser';
import { sendMail, brevTilSelskab, brevTilKunde, type SagTilMail } from '@/lib/mail';

/**
 * Opretter en forespørgsel.
 *
 * Gemmer sagen og laver én tilbudsrække pr. valgt modtager, hver med
 * sit eget engangstoken. Tokenet bliver til selskabets link i mailen.
 *
 * Mails sendes ikke herfra endnu — det er næste trin.
 */

export const dynamic = 'force-dynamic';

type Indgang = {
  cvr?: string;
  firmanavn?: string;
  branchekode?: string;
  branchetekst?: string;
  prisgruppe?: string;
  aarsvaerk?: number;
  aarsvaerkCvr?: number | null;
  aarsvaerkPeriode?: string | null;
  startdato?: string | null;
  modtagere?: string[];
  kontaktNavn?: string;
  kontaktMail?: string;
  kontaktTlf?: string | null;
  samtykkeVideregivelse?: boolean;
  samtykkeSkadesoplysninger?: boolean;
};

export async function POST(req: Request) {
  let k: Indgang;
  try {
    k = await req.json();
  } catch {
    return NextResponse.json({ fejl: 'Ugyldig forespørgsel.' }, { status: 400 });
  }

  // ── Validering. Alt tjekkes her, ikke kun i browseren. ──────────
  const cvr = String(k.cvr ?? '').replace(/\D/g, '');
  if (!/^\d{8}$/.test(cvr)) {
    return NextResponse.json({ fejl: 'CVR-nummeret mangler.' }, { status: 400 });
  }

  const aarsvaerk = Number(k.aarsvaerk);
  if (!Number.isFinite(aarsvaerk) || aarsvaerk <= 0) {
    return NextResponse.json({ fejl: 'Antal årsværk mangler.' }, { status: 400 });
  }

  const mail = String(k.kontaktMail ?? '').trim();
  if (!/^\S+@\S+\.\S+$/.test(mail)) {
    return NextResponse.json({ fejl: 'E-mailadressen er ikke gyldig.' }, { status: 400 });
  }

  const navn = String(k.kontaktNavn ?? '').trim();
  if (navn.length < 2) {
    return NextResponse.json({ fejl: 'Navnet mangler.' }, { status: 400 });
  }

  if (!k.samtykkeVideregivelse || !k.samtykkeSkadesoplysninger) {
    return NextResponse.json(
      { fejl: 'Begge samtykker skal være givet.' },
      { status: 400 },
    );
  }

  const valgte = Array.isArray(k.modtagere) ? k.modtagere.filter(Boolean) : [];
  if (valgte.length === 0) {
    return NextResponse.json({ fejl: 'Vælg mindst én modtager.' }, { status: 400 });
  }

  try {
    const klient = db();

    // Tjek at de valgte modtagere faktisk findes og er aktive.
    // Browseren kan sende hvad som helst, så vi stoler ikke på listen.
    const { data: gyldige, error: mfejl } = await klient
      .from('modtagere')
      .select('id, navn, mail')
      .eq('aktiv', true)
      .in('id', valgte);

    if (mfejl) throw mfejl;
    const ider = (gyldige ?? []).map((m: any) => m.id);
    if (ider.length === 0) {
      return NextResponse.json(
        { fejl: 'Ingen af de valgte modtagere er aktive.' },
        { status: 400 },
      );
    }

    const gruppe = (k.prisgruppe ?? 'andet') as Prisgruppe;
    const estimat = beregn(gruppe, aarsvaerk);
    const nu = new Date().toISOString();

    // Hvem der sendte, gemmes til dokumentation af samtykket.
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      null;

    const { data: sag, error: sfejl } = await klient
      .from('sager')
      .insert({
        cvr,
        firmanavn: String(k.firmanavn ?? '').trim() || `Virksomhed ${cvr}`,
        branchekode: k.branchekode ?? null,
        branchetekst: k.branchetekst ?? null,
        prisgruppe: gruppe,
        aarsvaerk,
        aarsvaerk_cvr: k.aarsvaerkCvr ?? null,
        aarsvaerk_periode: k.aarsvaerkPeriode ?? null,
        startdato: k.startdato || null,
        // Vores egen middelpræmie. Den er det, selskaberne skal matche,
        // og derfor ikke den samlede udgift inklusive AES.
        estimat_total: estimat.middel,
        kontakt_navn: navn,
        kontakt_mail: mail,
        kontakt_tlf: k.kontaktTlf || null,
        samtykke_videregivelse_tid: nu,
        samtykke_skadesoplysninger_tid: nu,
        samtykke_ip: ip,
      })
      .select('id')
      .single();

    if (sfejl) throw sfejl;

    // Én tilbudsrække pr. modtager, hver med sit eget engangstoken.
    const raekker = (gyldige ?? []).map((m: any) => ({
      sag_id: sag.id,
      modtager_id: m.id,
      token: nytToken(),
    }));

    const { error: tfejl } = await klient.from('tilbud').insert(raekker);
    if (tfejl) throw tfejl;

    // ── Mails ───────────────────────────────────────────────────
    // Sagen er gemt. Fejler en mail, mister vi ikke forespørgslen —
    // den kan sendes igen fra databasen.
    const tilMail: SagTilMail = {
      firmanavn: String(k.firmanavn ?? '').trim() || `Virksomhed ${cvr}`,
      cvr,
      branchekode: k.branchekode ?? null,
      branchetekst: k.branchetekst ?? null,
      aarsvaerk,
      startdato: k.startdato || null,
      kontaktNavn: navn,
    };

    const resultater = await Promise.all(
      (gyldige ?? []).map((m: any, i: number) => {
        const brev = brevTilSelskab(tilMail, m.navn, raekker[i].token);
        return sendMail({ til: m.mail, ...brev });
      }),
    );

    const kvittering = brevTilKunde(tilMail, ider.length, estimat.lav, estimat.hoej);
    await sendMail({ til: mail, ...kvittering });

    const sendte = resultater.filter((r) => r.sendt).length;
    if (sendte < resultater.length) {
      console.warn(
        `Sag ${sag.id}: ${sendte} af ${resultater.length} mails kom af sted.`,
      );
    }

    return NextResponse.json({
      sagId: sag.id,
      antalModtagere: ider.length,
      mailsSendt: sendte,
      estimat: {
        lav: estimat.lav,
        middel: estimat.middel,
        hoej: estimat.hoej,
        aes: estimat.aes,
      },
    });
  } catch (e: any) {
    console.error('Kunne ikke oprette forespørgsel:', e?.message ?? e);
    return NextResponse.json(
      { fejl: 'Vi kunne ikke sende forespørgslen lige nu. Prøv igen om lidt.' },
      { status: 502 },
    );
  }
}
