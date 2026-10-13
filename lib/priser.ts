/**
 * Prisberegning · regnegrundlag 2026.1
 *
 * Modellen følger den måde, selskaberne selv prissætter på:
 *
 *     årsværk × risikoklassesats × størrelsesfaktor × skadefaktor
 *     + 2 % arbejdsmiljøbidrag + 30 kr. pr. årsværk til Garantifonden
 *
 * Tre ting er værd at huske, når tallene skal justeres senere:
 *
 *  1. Præmien regnes pr. ÅRSVÆRK (1.665 timer), ikke på lønsum.
 *  2. AES-bidraget for erhvervssygdomme er IKKE en del af præmien.
 *     Det opkræves kvartalsvis via Samlet Betaling og går ikke til
 *     forsikringsselskabet. Derfor står det som en selvstændig linje.
 *  3. Arbejdsskadeforsikring er fritaget for skadesforsikringsafgiften
 *     på 1,1 %. Der lægges altså ingen afgift oven i.
 *
 * DOKUMENTEREDE TAL (kan bruges, som de står):
 *   - 1.665 timer pr. årsværk
 *   - arbejdsmiljøbidrag 2 % af præmien i 2026 (Alm. Brand)
 *   - Garantifonden 30 kr. pr. fuldtidsforsikret i 2026 (Finanstilsynet)
 *   - alle AES-satser herunder (AES' bidragssatser 2026)
 *   - K1.lav: GRAKOM/Topdanmark 629,25 kr. og GLS-A 1.012 kr. (kontor)
 *   - K6.hoej: GLS-A 10.650 kr. (landbrug, høj risiko)
 *
 * SKØN (bør kalibreres med rigtige tilbud, efterhånden som de kommer ind):
 *   - middel- og høj-satser for K2–K5
 *   - størrelsesfaktor, skadefaktor, rabatter, minimumspræmie
 *   - 2027-faktoren
 *
 * Efter Højesterets dom af 28. april 2026 om nedre grænse for
 * erhvervsevnetab venter en prisstigning ved fornyelse 1.1.2027.
 * Ingen har offentliggjort en sats. Sæt FAKTOR_2027.aktiv = true og
 * justér standard, når Tryg, Alm. Brand og Sampo melder tal ud.
 */

/* ─────────────────────────── risikoklasser ─────────────────────────── */

export type Risikoklasse = 'K1' | 'K2' | 'K3' | 'K4' | 'K5' | 'K6';

type Klasse = {
  navn: string;
  /** kr. pr. årsværk pr. år, 2026-niveau, før faktorer og tillæg */
  lav: number;
  middel: number;
  hoej: number;
};

export const KLASSER: Record<Risikoklasse, Klasse> = {
  K1: { navn: 'Kontor og administration',          lav:  650, middel: 1300, hoej:  2200 },
  K2: { navn: 'Handel og lettere service',         lav: 1200, middel: 2200, hoej:  3500 },
  K3: { navn: 'Restauration, sundhed og omsorg',   lav: 2000, middel: 3500, hoej:  5500 },
  K4: { navn: 'Industri, installation og service', lav: 2500, middel: 4500, hoej:  7000 },
  K5: { navn: 'Transport og lettere håndværk',     lav: 3500, middel: 5500, hoej:  8000 },
  K6: { navn: 'Byggeri, anlæg og landbrug',        lav: 5000, middel: 8000, hoej: 11000 },
};

/**
 * Lav  = brancheaftale eller stærk forhandlingsposition
 * Middel = almindelig SMV med normal skadehistorik
 * Høj  = ny lille kunde uden pakke, dårlig skadehistorik, eller et
 *        selskab der allerede har hævet priserne efter dommen
 */

/* ───────────────────────────── prisgrupper ─────────────────────────── */

export type Prisgruppe =
  | 'kontor' | 'it' | 'undervisning' | 'detail' | 'klinik'
  | 'restaurant' | 'sundhed' | 'pleje'
  | 'rengoering' | 'lager' | 'produktion' | 'elvvs' | 'auto' | 'andet'
  | 'maler' | 'transport'
  | 'byggeri' | 'landbrug';

type Sats = {
  navn: string;
  klasse: Risikoklasse;
  /** AES-bidrag 2026 pr. fuldtidsansat (bidrag + arbejdsskadeafgift + 2 kr.) */
  aes: number;
  /** egne satser, hvis gruppen afviger fra sin risikoklasse */
  override?: { lav: number; middel: number; hoej: number };
  /** AES-branchegruppen afhænger af den præcise branchekode */
  aesUsikker?: boolean;
};

/** Rækkefølgen er lav risiko først. Den bruges også i rullelisten. */
export const SATSER: Record<Prisgruppe, Sats> = {
  kontor:       { navn: 'Kontor, rådgivning og administration',  klasse: 'K1', aes:  457 },
  it:           { navn: 'IT, medier og kommunikation',           klasse: 'K1', aes:  457 },
  undervisning: { navn: 'Undervisning og kurser',                klasse: 'K2', aes: 1006 },
  detail:       { navn: 'Handel, detail og webshop',             klasse: 'K2', aes:  539 },
  klinik:       { navn: 'Frisør, klinik og personlig pleje',     klasse: 'K2', aes: 1086, aesUsikker: true },
  restaurant:   { navn: 'Restauration, café og hotel',           klasse: 'K3', aes:  389 },
  sundhed:      { navn: 'Sundhed, læge og tandlæge',             klasse: 'K3', aes:  647 },
  pleje:        { navn: 'Pleje, bosted og hjemmehjælp',          klasse: 'K3', aes: 2911 },
  rengoering:   { navn: 'Rengøring, ejendomsservice og vagt',    klasse: 'K4', aes: 1086, aesUsikker: true },
  lager:        { navn: 'Lager, pakkeri og oplagring',           klasse: 'K4', aes:  539 },
  produktion:   { navn: 'Industri, produktion og værksted',      klasse: 'K4', aes: 1558 },
  elvvs:        { navn: 'El, VVS og installation',               klasse: 'K4', aes: 1078 },
  auto:         { navn: 'Autoværksted og reparation',            klasse: 'K4', aes: 1086 },
  andet:        { navn: 'Andet',                                 klasse: 'K4', aes: 1086, aesUsikker: true },
  maler:        { navn: 'Maler, gulv og lettere håndværk',       klasse: 'K5', aes: 2323 },
  transport:    { navn: 'Transport, vognmand og chauffør',       klasse: 'K5', aes: 1576, aesUsikker: true },
  byggeri:      { navn: 'Murer, tømrer, anlæg og nedrivning',    klasse: 'K6', aes: 2323 },
  landbrug:     {
    navn: 'Landbrug, gartneri og skovbrug',
    klasse: 'K6',
    aes: 1398,
    override: { lav: 5500, middel: 8500, hoej: 11000 },
  },
};

/* ──────────────────────── konstanter og faktorer ───────────────────── */

/** Én helårsansat. Bruges til at regne deltid om til årsværk. */
export const TIMER_PR_AARSVAERK = 1665;

/** Lovbestemt, 2 % af præmien i 2026. */
export const ARBEJDSMILJOEBIDRAG = 0.02;

/** Lovbestemt, 30 kr. pr. fuldtidsforsikret i 2026. */
export const GARANTIFOND_PR_AARSVAERK = 30;

/** Skøn. Der findes ingen offentlig minimumspræmie. */
export const MINIMUMSPRAEMIE = 1000;

/** Arbejdsskade er fritaget for skadesforsikringsafgiften. */
export const SKADESFORSIKRINGSAFGIFT = 0;

/**
 * Forventet stigning ved fornyelse 1.1.2027 efter Højesterets dom.
 * Slå den til omkring november 2026, når selskaberne har meldt tal ud.
 */
export const FAKTOR_2027 = { standard: 0.10, min: 0.05, max: 0.25, aktiv: false };

/** Små virksomheder bærer en større del af selskabets faste omkostninger. */
export function stoerrelsesfaktor(aarsvaerk: number): number {
  if (aarsvaerk <= 2) return 1.15;
  if (aarsvaerk <= 5) return 1.05;
  if (aarsvaerk <= 20) return 1.0;
  return 0.95;
}

/** Anmeldte arbejdsulykker de seneste tre år. 1 skade er det neutrale. */
export function skadefaktor(skader: number): number {
  if (skader <= 0) return 0.95;
  if (skader === 1) return 1.0;
  if (skader === 2) return 1.15;
  return 1.3;
}

export const RABAT = { samletPakke: 0.05, apv: 0.05, maksSamlet: 0.1 };

/* ────────────────────── branchekode → prisgruppe ───────────────────── */

/**
 * Oversætter en DB07-branchekode til en prisgruppe.
 *
 * De to første cifre afgør det meste. Gruppe 43 (bygningsfærdiggørelse)
 * og 52 deles op på fire cifre, fordi en elektriker og en tagdækker
 * ligger langt fra hinanden i risiko.
 */
export function gruppeFraBranchekode(kode: string): Prisgruppe {
  const cifre = String(kode).replace(/\D/g, '');
  if (!cifre) return 'andet';

  const h = parseInt(cifre.slice(0, 2), 10);
  const f = parseInt(cifre.slice(0, 4).padEnd(4, '0'), 10);
  if (!Number.isFinite(h)) return 'andet';

  if (h >= 1 && h <= 3) return 'landbrug';
  if (h >= 5 && h <= 9) return 'produktion';      // råstofindvinding
  if (h >= 10 && h <= 33) return 'produktion';
  if (h === 35) return 'produktion';              // energiforsyning
  if (h >= 36 && h <= 39) return 'rengoering';    // vand og renovation

  if (h === 41 || h === 42) return 'byggeri';
  if (h === 43) {
    if (f >= 4321 && f <= 4329) return 'elvvs';   // el, vvs, anden installation
    if (f === 4333 || f === 4334) return 'maler'; // gulv, væg, maler, glarmester
    return 'byggeri';                             // nedrivning, tømrer, tag, stillads
  }

  if (h === 45) return 'auto';
  if (h === 46 || h === 47) return 'detail';

  if (h >= 49 && h <= 51) return 'transport';
  if (h === 52) return f === 5210 ? 'lager' : 'transport';
  if (h === 53) return 'transport';               // post og kurer

  if (h === 55 || h === 56) return 'restaurant';
  if (h >= 58 && h <= 63) return 'it';
  if (h >= 64 && h <= 66) return 'kontor';        // finans og forsikring
  if (h === 68) return 'kontor';                  // fast ejendom
  if (h >= 69 && h <= 75) return 'kontor';        // rådgivning og videnservice

  if (h === 77 || h === 78) return 'rengoering';  // udlejning af materiel, vikarbureau
  if (h === 79) return 'kontor';
  if (h === 80 || h === 81) return 'rengoering';  // vagt, rengøring, ejendomsservice
  if (h === 82) return 'kontor';
  if (h === 84) return 'kontor';
  if (h === 85) return 'undervisning';
  if (h === 86) return 'sundhed';
  if (h === 87 || h === 88) return 'pleje';
  if (h === 94) return 'kontor';                  // organisationer og foreninger
  if (h === 95) return 'auto';                    // reparation af varer
  if (h === 96) return 'klinik';

  return 'andet';
}

/* ──────────────────────────── beregningen ──────────────────────────── */

export type BeregnValg = {
  /** anmeldte arbejdsulykker de seneste tre år. 1 = neutral */
  skader?: number;
  /** virksomheden samler øvrige erhvervsforsikringer samme sted */
  samletPakke?: boolean;
  /** dokumenteret APV og arbejdsmiljøindsats */
  apv?: boolean;
  /** tillæg for fornyelse 1.1.2027, fx 0.10. 0 giver 2026-pris */
  tillaeg2027?: number;
};

export type Estimat = {
  gruppe: Prisgruppe;
  gruppenavn: string;
  klasse: Risikoklasse;
  klassenavn: string;
  /** årsværk rundet op til nærmeste halve */
  aarsvaerk: number;

  /** årspræmie inklusive arbejdsmiljøbidrag og Garantifonden */
  lav: number;
  middel: number;
  hoej: number;

  /** AES-bidrag pr. år. Betales særskilt via Samlet Betaling. */
  aes: number;
  /** AES-gruppen afhænger af den præcise branchekode */
  aesUsikker: boolean;

  /** samlet lovpligtig udgift: middelpræmie + AES */
  total: number;
  /** middelpræmien pr. måned */
  maanedligt: number;
  /** middelpræmien delt med antal årsværk — prisen pr. mand */
  prAarsvaerk: number;

  /** sandt når minimumspræmien løftede den laveste pris */
  minimumRamt: boolean;
};

/** Regner timer om til årsværk. 37 timer om ugen giver 1,0. */
export function timerTilAarsvaerk(ugentligeTimer: number, uger = 45): number {
  return (ugentligeTimer * uger) / TIMER_PR_AARSVAERK;
}

function enPris(sats: number, av: number, v: BeregnValg): { pris: number; minRamt: boolean } {
  let p = av * sats;

  p *= stoerrelsesfaktor(av);
  p *= skadefaktor(v.skader ?? 1);

  const rabat = Math.min(
    (v.samletPakke ? RABAT.samletPakke : 0) + (v.apv ? RABAT.apv : 0),
    RABAT.maksSamlet,
  );
  p *= 1 - rabat;

  const minRamt = p < MINIMUMSPRAEMIE;
  p = Math.max(p, MINIMUMSPRAEMIE);

  p *= 1 + (v.tillaeg2027 ?? 0);

  // Lovbestemte tillæg. Ingen skadesforsikringsafgift på arbejdsskade.
  p = p * (1 + ARBEJDSMILJOEBIDRAG) + GARANTIFOND_PR_AARSVAERK * av;

  return { pris: Math.round(p / 100) * 100, minRamt };
}

export function beregn(
  gruppe: Prisgruppe,
  aarsvaerk: number,
  valg: BeregnValg = {},
): Estimat {
  const s = SATSER[gruppe] ?? SATSER.andet;
  const k = s.override ?? KLASSER[s.klasse];

  // Rundes op til nærmeste halve årsværk, som selskaberne gør.
  const av = Math.max(0.5, Math.ceil(Math.max(0, aarsvaerk) * 2) / 2);

  const lav = enPris(k.lav, av, valg);
  const middel = enPris(k.middel, av, valg);
  const hoej = enPris(k.hoej, av, valg);

  const aes = Math.round(av * s.aes);

  return {
    gruppe,
    gruppenavn: s.navn,
    klasse: s.klasse,
    klassenavn: KLASSER[s.klasse].navn,
    aarsvaerk: av,

    lav: lav.pris,
    middel: middel.pris,
    hoej: hoej.pris,

    aes,
    aesUsikker: Boolean(s.aesUsikker),

    total: middel.pris + aes,
    maanedligt: Math.round(middel.pris / 12),
    prAarsvaerk: Math.round(middel.pris / av),

    minimumRamt: lav.minRamt,
  };
}

export function kroner(n: number): string {
  return new Intl.NumberFormat('da-DK').format(Math.round(n)) + ' kr.';
}

/* ───────────────────────────── forbehold ───────────────────────────── */

export const FORBEHOLD =
  'Prisen er et vejledende estimat beregnet ud fra gennemsnitlige markedsniveauer ' +
  'for 2026 og de oplysninger, du har indtastet. Den er ikke et tilbud og binder ' +
  'hverken beregnarbejdsskade.dk eller noget forsikringsselskab. Den endelige ' +
  'præmie fastsættes af forsikringsselskabet efter en konkret vurdering af blandt ' +
  'andet branchekode, arbejdsopgaver, antal årsværk, skadehistorik og øvrige ' +
  'forsikringer. Priserne indeholder lovpligtigt arbejdsmiljøbidrag og bidrag til ' +
  'Garantifonden. Bidrag til Arbejdsmarkedets Erhvervssikring (AES) opkræves ' +
  'særskilt via Samlet Betaling. Efter Højesterets dom af 28. april 2026 forventes ' +
  'præmierne at stige ved fornyelse, og estimatet kan derfor afvige fra den pris, ' +
  'du bliver tilbudt.';
