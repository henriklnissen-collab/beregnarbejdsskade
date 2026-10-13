import { NextResponse } from 'next/server';
import { gruppeFraBranchekode } from '@/lib/priser';

/**
 * CVR-opslag.
 *
 * Opslaget sker her på serveren. API-nøglen må aldrig ligge i browseren.
 *
 * Antal ansatte ligger ikke i selve virksomhedsopslaget hos udbyderen.
 * Det er et separat endpoint. Derfor laver vi to kald. Fejler det andet,
 * viser vi stadig virksomheden, og kunden skriver selv antal årsværk.
 *
 * Tilføj ?debug=1 til adressen for at se det rå svar med alle feltnavne.
 */

export type CvrSvar = {
  cvr: string;
  firmanavn: string;
  branchekode: string;
  branchetekst: string;
  aarsvaerk: number | null;
  periode: string | null;
  prisgruppe: string;
  kilde: 'cvr' | 'eksempeldata';
};

const STANDARD_BASE = 'https://api.danskcvrapi.dk/v1';
const TESTNUMRE = ['12345678', '87654321', '11223344'];

/**
 * Renser base-adressen, så almindelige tastefejl i .env.local ikke
 * vælter opslaget: variabelnavnet skrevet to gange, citationstegn,
 * en afsluttende skråstreg eller /companies lagt på i enden.
 */
function renBase(raa: string | undefined): string {
  let v = (raa ?? '').trim();
  if (!v) return STANDARD_BASE;
  v = v.replace(/^CVR_API_URL\s*=\s*/i, '');
  v = v.replace(/^["']|["']$/g, '');
  v = v.replace(/\/+$/, '');
  v = v.replace(/\/companies$/i, '');
  return /^https?:\/\//i.test(v) ? v : STANDARD_BASE;
}

const BASE = renBase(process.env.CVR_API_URL);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cvr = (url.searchParams.get('cvr') ?? '').replace(/\D/g, '');
  const debug = url.searchParams.get('debug') === '1';

  if (!/^\d{8}$/.test(cvr)) {
    return NextResponse.json({ fejl: 'Et CVR-nummer består af 8 cifre.' }, { status: 400 });
  }

  const noegle = process.env.CVR_API_KEY;

  // Testnumrene findes ikke i det rigtige register, så dem svarer vi selv på.
  if (!noegle || TESTNUMRE.includes(cvr)) {
    return NextResponse.json(eksempeldata(cvr));
  }

  // ── Kald 1: virksomheden ────────────────────────────────────────
  let firma: any;
  try {
    firma = await kald(`${BASE}/companies/${cvr}`, noegle);
  } catch (e: any) {
    const status = e?.status === 404 ? 404 : 502;
    return NextResponse.json(
      {
        fejl: status === 404
          ? 'Vi kunne ikke finde et CVR-nummer med de cifre. Tjek tallet.'
          : 'Vi kunne ikke slå virksomheden op lige nu. Prøv igen om lidt.',
        ...(debug
          ? { teknisk: String(e?.message ?? e), adresse: `${BASE}/companies/${cvr}` }
          : {}),
      },
      { status },
    );
  }

  // Antal ansatte står allerede i firmasvaret som annual_employees
  // og employees. Vi henter derfor ikke det separate endpoint — det
  // sparer et kald af vores månedlige kvote, og tallene der er ofte
  // flere år gamle.

  const branchekode = findFelt(firma, [
    'industryCode', 'industry_code', 'industrycode', 'branchekode',
    'industry.code', 'mainIndustry.code', 'main_industry.code',
    'hovedbranche.kode', 'industry.industryCode',
  ]);

  const branchetekst = findFelt(firma, [
    'industryText', 'industry_text', 'industryDesc', 'industrydesc',
    'branchetekst', 'industry.text', 'industry.description', 'industry.name',
    'mainIndustry.text', 'main_industry.text', 'hovedbranche.tekst',
  ]);

  const firmanavn = findFelt(firma, ['name', 'companyName', 'navn', 'company_name']);
  const nyeste = antalAnsatte(firma);

  const svar: CvrSvar = {
    cvr,
    firmanavn: firmanavn || `Virksomhed ${cvr}`,
    branchekode,
    branchetekst,
    aarsvaerk: nyeste?.antal ?? null,
    periode: nyeste?.periode ?? null,
    prisgruppe: gruppeFraBranchekode(branchekode),
    kilde: 'cvr',
  };

  if (debug) {
    return NextResponse.json({
      ...svar,
      _felter_i_firmasvaret: Object.keys(firma ?? {}),
      _raa_firma: firma,
      _antal_felter: {
        employees: firma?.employees ?? null,
        annual_employees: firma?.annual_employees ?? null,
        employees_period: firma?.employees_period ?? null,
        employees_source: firma?.employees_source ?? null,
      },
    });
  }

  // Et CVR-opslag ændrer sig sjældent, så svaret ligger en time på
  // Vercels kant og serveres i op til et døgn, mens et nyt hentes i
  // baggrunden. Det sparer kvoten, når flere slår det samme firma op.
  //
  // Retter du felterne i svaret, så sæt midlertidigt 'no-store' her
  // og slet .next — ellers får du den gamle udgave serveret og tror,
  // rettelsen ikke virkede.
  return NextResponse.json(svar, {
    headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
  });
}

async function kald(url: string, noegle: string): Promise<any> {
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${noegle}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });

  if (!r.ok) {
    const e: any = new Error(`${url} svarede ${r.status}`);
    e.status = r.status;
    throw e;
  }
  return r.json();
}

/** Leder efter den første sti, der findes. "a.b" betyder nøglen b inde i a. */
function findFelt(objekt: any, stier: string[]): string {
  for (const sti of stier) {
    let v: any = objekt;
    for (const del of sti.split('.')) {
      if (v == null || typeof v !== 'object') { v = undefined; break; }
      v = v[del];
    }
    if (v != null && v !== '') return String(v);
  }
  return '';
}

/**
 * Finder antal ansatte i firmasvaret.
 *
 * annual_employees er årsgennemsnittet og ligger tættest på et årsværk.
 * employees er det seneste månedstal og bruges som reserve.
 *
 * Bemærk: CVR oplyser antal ansatte, ikke årsværk i forsikringsmæssig
 * forstand. Derfor beder vi altid kunden bekræfte eller rette tallet.
 */
function antalAnsatte(d: any): { antal: number; periode: string } | null {
  const aars = taltal(d.annual_employees ?? d.annualEmployees);
  const maaned = taltal(d.employees ?? d.antalAnsatte);
  const antal = aars ?? maaned;
  if (antal === null) return null;

  const raa = String(d.employees_period ?? d.employeesPeriod ?? '').trim();
  return { antal, periode: pænPeriode(raa) };
}

/** Laver "2026-07" om til "juli 2026". */
function pænPeriode(raa: string): string {
  const m = raa.match(/^(\d{4})-(\d{2})$/);
  if (!m) return raa || 'seneste opgørelse';
  const maaneder = ['januar','februar','marts','april','maj','juni',
                    'juli','august','september','oktober','november','december'];
  const nr = Number(m[2]) - 1;
  return maaneder[nr] ? `${maaneder[nr]} ${m[1]}` : raa;
}

/** CVR oplyser nogle gange et interval som "5-9". Så tager vi midten. */
function taltal(v: unknown): number | null {
  const t = String(v ?? '').trim();
  if (!t) return null;

  const interval = t.match(/^(\d+)\s*[-–]\s*(\d+)$/);
  if (interval) return Math.round((Number(interval[1]) + Number(interval[2])) / 2);

  const n = Number(t.replace(',', '.').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Bruges til testnumrene og indtil CVR_API_KEY er udfyldt. */
function eksempeldata(cvr: string): CvrSvar {
  const kendte: Record<string, Omit<CvrSvar, 'cvr' | 'prisgruppe' | 'kilde'>> = {
    '12345678': {
      firmanavn: 'Eksempelvirksomhed ApS', branchekode: '433200',
      branchetekst: 'Tømrer- og bygningssnedkerarbejde',
      aarsvaerk: 4.2, periode: '2. kvartal 2026',
    },
    '87654321': {
      firmanavn: 'Nordlys Rådgivning ApS', branchekode: '702200',
      branchetekst: 'Virksomhedsrådgivning',
      aarsvaerk: 11, periode: '2. kvartal 2026',
    },
    '11223344': {
      firmanavn: 'Søndergaard Transport A/S', branchekode: '494100',
      branchetekst: 'Vejgodstransport',
      aarsvaerk: 23.5, periode: '1. kvartal 2026',
    },
  };

  const d = kendte[cvr] ?? {
    firmanavn: `Virksomhed ${cvr} ApS`, branchekode: '433200',
    branchetekst: 'Tømrer- og bygningssnedkerarbejde',
    aarsvaerk: 4.2, periode: '2. kvartal 2026',
  };

  return { cvr, ...d, prisgruppe: gruppeFraBranchekode(d.branchekode), kilde: 'eksempeldata' };
}
