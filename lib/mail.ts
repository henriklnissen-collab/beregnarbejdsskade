import { Resend } from 'resend';

/**
 * Afsendelse af mails.
 *
 * Uden RESEND_API_KEY sendes der ingenting — i stedet skrives mailen
 * i terminalen. Så kan hele flowet testes, før domænet er sat op.
 */

const NOEGLE = process.env.RESEND_API_KEY;
const AFSENDER =
  process.env.MAIL_AFSENDER ||
  'beregnarbejdsskade.dk <onboarding@resend.dev>';

export function sidensAdresse(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
    .replace(/\/+$/, '');
}

type Brev = { til: string; emne: string; html: string; tekst: string };

export async function sendMail(b: Brev): Promise<{ sendt: boolean; grund?: string }> {
  if (!NOEGLE) {
    console.log(
      `\n─── MAIL (ikke sendt, RESEND_API_KEY mangler) ───\n` +
      `Til:   ${b.til}\nEmne:  ${b.emne}\n\n${b.tekst}\n` +
      `────────────────────────────────────────────────\n`,
    );
    return { sendt: false, grund: 'RESEND_API_KEY mangler' };
  }

  try {
    const resend = new Resend(NOEGLE);
    const { error } = await resend.emails.send({
      from: AFSENDER,
      to: b.til,
      subject: b.emne,
      html: b.html,
      text: b.tekst,
    });
    if (error) throw new Error(error.message);
    return { sendt: true };
  } catch (e: any) {
    console.error(`Mail til ${b.til} fejlede:`, e?.message ?? e);
    return { sendt: false, grund: String(e?.message ?? e) };
  }
}

/* ───────────────────────── skabeloner ───────────────────────── */

const kr = (n: number) => new Intl.NumberFormat('da-DK').format(Math.round(n)) + ' kr.';
const dec = (n: number) =>
  new Intl.NumberFormat('da-DK', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);

function ramme(indhold: string): string {
  return `<!doctype html><html lang="da"><body style="margin:0;padding:24px;background:#F2F6F6;
font-family:system-ui,-apple-system,'Segoe UI',Arial,sans-serif;color:#3E5760;font-size:16px;line-height:1.55">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:32px">
${indhold}
<hr style="border:0;border-top:1px solid #DCE5E6;margin:28px 0 16px">
<p style="font-size:13px;color:#657C84;margin:0">
beregnarbejdsskade.dk · Vi sælger ikke selv forsikringer. Vi indhenter priser og
sender kundens valg videre, og aftalen indgås direkte mellem kunden og selskabet.
</p>
</div></body></html>`;
}

export type SagTilMail = {
  firmanavn: string;
  cvr: string;
  branchekode: string | null;
  branchetekst: string | null;
  aarsvaerk: number;
  /** fordelingen på brancher, hvis virksomheden har folk i flere slags arbejde */
  brancher?: { navn: string; klasse: string; aarsvaerk: number }[];
  startdato: string | null;
  kontaktNavn: string;
};

/** Mail til forsikringsselskabet med et engangslink til svarsiden. */
export function brevTilSelskab(
  sag: SagTilMail,
  modtagernavn: string,
  token: string,
): Omit<Brev, 'til'> {
  const link = `${sidensAdresse()}/svar/${token}`;

  const raekker = [
    ['Virksomhed', sag.firmanavn],
    ['CVR-nummer', sag.cvr],
    ['Branchekode', sag.branchekode || '—'],
    ['Branche', sag.branchetekst || '—'],
    ['Årsværk', dec(sag.aarsvaerk)],
    // Har virksomheden folk i flere slags arbejde, er fordelingen det
    // vigtigste, selskabet får — uden den prissætter de på den forkerte
    // risikogruppe for en del af medarbejderne.
    ...((sag.brancher?.length ?? 0) > 1
      ? [['Fordeling oplyst af kunden',
          sag.brancher!.map((b) => `${b.navn}: ${dec(b.aarsvaerk)}`).join(' · ')]]
      : []),
    ['Ønsket startdato', sag.startdato || 'snarest muligt'],
  ];

  const html = ramme(`
<h1 style="font-size:24px;color:#0E2B33;margin:0 0 8px">Forespørgsel på arbejdsskadeforsikring</h1>
<p style="margin:0 0 24px;color:#657C84">Til ${modtagernavn}</p>

<table style="width:100%;border-collapse:collapse;margin-bottom:28px">
${raekker.map(([k, v]) => `<tr>
<td style="padding:10px 0;border-top:1px solid #DCE5E6;color:#0E2B33;font-weight:600">${k}</td>
<td style="padding:10px 0;border-top:1px solid #DCE5E6;text-align:right">${v}</td>
</tr>`).join('')}
</table>

<a href="${link}" style="display:block;background:#1F5F52;color:#fff;text-decoration:none;
font-weight:700;text-align:center;padding:16px;border-radius:12px;font-size:17px">
Giv jeres pris
</a>

<p style="margin:20px 0 0;font-size:15px">
Tryk på knappen og udfyld prisen i felterne. Så kan kunden se den sammen med
de øvrige tilbud. Der skal ikke logges ind — linket er personligt og udløber om 14 dage.
</p>

<p style="margin:16px 0 0;font-size:15px">
Kunden har givet samtykke til, at I må kontakte dem og indhente virksomhedens
skadesoplysninger.
</p>`);

  const tekst =
    `Forespørgsel på arbejdsskadeforsikring\nTil ${modtagernavn}\n\n` +
    raekker.map(([k, v]) => `${k}: ${v}`).join('\n') +
    `\n\nGiv jeres pris her:\n${link}\n\n` +
    `Linket er personligt og udløber om 14 dage. Der skal ikke logges ind.\n` +
    `Kunden har givet samtykke til kontakt og til indhentning af skadesoplysninger.`;

  return {
    emne: `Forespørgsel: arbejdsskadeforsikring til ${sag.firmanavn}`,
    html,
    tekst,
  };
}

/** Kvittering til kunden med link til deres eget overblik. */
export function brevTilKunde(
  sag: SagTilMail,
  antalModtagere: number,
  estimatLav: number,
  estimatHoej: number,
): Omit<Brev, 'til'> {
  const link = `${sidensAdresse()}/mine-tilbud`;

  const html = ramme(`
<h1 style="font-size:24px;color:#0E2B33;margin:0 0 8px">Jeres forespørgsel er sendt</h1>
<p style="margin:0 0 24px">Hej ${sag.kontaktNavn}</p>

<p style="margin:0 0 20px">
Vi har sendt jeres oplysninger til ${antalModtagere}
${antalModtagere === 1 ? 'forsikringsselskab' : 'forsikringsselskaber'}.
</p>

<div style="background:#E4EFEA;border-radius:12px;padding:20px;margin-bottom:24px">
<p style="margin:0 0 6px;font-size:15px">Vores vejledende estimat for ${sag.firmanavn}</p>
<p style="margin:0;font-size:26px;font-weight:800;color:#0E2B33">${kr(estimatLav)}–${kr(estimatHoej)}</p>
<p style="margin:6px 0 0;font-size:14px;color:#657C84">om året i præmie. AES-bidraget for
erhvervssygdomme betales særskilt via Samlet Betaling.</p>
</div>

<p style="margin:0 0 20px">
<b style="color:#0E2B33">I behøver ikke gøre mere lige nu.</b> Inden for 1 hverdag
sender vi jer en mail, så snart vi har samlet mindst 3 tilbud. Den mail indeholder
et link til jeres overblik, hvor I kan sammenligne priserne og vælge.
</p>

<a href="${link}" style="display:block;background:#E4EFEA;color:#1F5F52;text-decoration:none;
font-weight:700;text-align:center;padding:14px;border-radius:12px">
Se status på jeres forespørgsel
</a>`);

  const tekst =
    `Jeres forespørgsel er sendt\n\nHej ${sag.kontaktNavn}\n\n` +
    `Vi har sendt jeres oplysninger til ${antalModtagere} forsikringsselskaber.\n\n` +
    `Vores vejledende estimat for ${sag.firmanavn}: ${kr(estimatLav)}–${kr(estimatHoej)} om året, inklusive AES-bidrag.\n\n` +
    `I behøver ikke gøre mere lige nu. Inden for 1 hverdag sender vi jer en mail,\n` +
    `så snart vi har samlet mindst 3 tilbud.\n\n` +
    `Se status: ${link}`;

  return { emne: `Forespørgsel sendt for ${sag.firmanavn}`, html, tekst };
}
