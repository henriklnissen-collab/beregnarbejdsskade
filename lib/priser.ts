/**
 * Prisberegning.
 *
 * VIGTIGT: satserne herunder er kvalificerede gæt, ikke rigtige tariffer.
 * De skal erstattes af tal fra et forsikringsselskab, før siden går live.
 * Alt andet i koden kan blive, som det er — kun tallene i SATSER ændres.
 */

export type Prisgruppe =
  | 'kontor' | 'it' | 'detail' | 'restaurant' | 'haandvaerk'
  | 'produktion' | 'transport' | 'landbrug' | 'sundhed' | 'andet';

type Sats = {
  navn: string;
  /** ulykkespræmie i kroner pr. årsværk pr. år */
  ulykkePrAarsvaerk: number;
  /** AES-bidrag i kroner pr. årsværk pr. år (erhvervssygdomme) */
  aesPrAarsvaerk: number;
};

export const SATSER: Record<Prisgruppe, Sats> = {
  kontor:     { navn: 'Kontor, rådgivning og administration', ulykkePrAarsvaerk:  700, aesPrAarsvaerk:  260 },
  it:         { navn: 'IT og software',                       ulykkePrAarsvaerk:  650, aesPrAarsvaerk:  250 },
  detail:     { navn: 'Detail og webshop',                    ulykkePrAarsvaerk: 1500, aesPrAarsvaerk:  620 },
  sundhed:    { navn: 'Sundhed, pleje og skønhed',            ulykkePrAarsvaerk: 2000, aesPrAarsvaerk:  900 },
  restaurant: { navn: 'Restauration og café',                 ulykkePrAarsvaerk: 2700, aesPrAarsvaerk:  980 },
  andet:      { navn: 'Andet',                                ulykkePrAarsvaerk: 2600, aesPrAarsvaerk:  950 },
  produktion: { navn: 'Produktion og værksted',               ulykkePrAarsvaerk: 5000, aesPrAarsvaerk: 1950 },
  transport:  { navn: 'Transport og lager',                   ulykkePrAarsvaerk: 5800, aesPrAarsvaerk: 2100 },
  haandvaerk: { navn: 'Håndværk og byggeri',                  ulykkePrAarsvaerk: 6300, aesPrAarsvaerk: 2300 },
  landbrug:   { navn: 'Landbrug og gartneri',                 ulykkePrAarsvaerk: 7000, aesPrAarsvaerk: 2450 },
};

/** Laveste årspræmie uanset størrelse. */
export const MINIMUMSPRAEMIE = 1850;

/** Estimatet vises som et spænd på plus/minus denne andel. */
export const SPAEND = 0.12;

/**
 * Oversætter en DB07-branchekode til en prisgruppe.
 * Opslaget sker på kodens to første cifre.
 */
export function gruppeFraBranchekode(kode: string): Prisgruppe {
  const h = parseInt(String(kode).replace(/\D/g, '').slice(0, 2), 10);
  if (!Number.isFinite(h)) return 'andet';
  if (h >= 1 && h <= 3)   return 'landbrug';
  if (h >= 10 && h <= 33) return 'produktion';
  if (h >= 41 && h <= 43) return 'haandvaerk';
  if (h >= 45 && h <= 47) return 'detail';
  if (h >= 49 && h <= 53) return 'transport';
  if (h >= 55 && h <= 56) return 'restaurant';
  if (h >= 58 && h <= 63) return 'it';
  if (h >= 64 && h <= 82) return 'kontor';
  if ((h >= 86 && h <= 88) || h === 96) return 'sundhed';
  return 'andet';
}

export type Estimat = {
  gruppe: Prisgruppe;
  gruppenavn: string;
  aarsvaerk: number;
  ulykke: number;
  aes: number;
  total: number;
  lav: number;
  hoej: number;
  maanedligt: number;
};

export function beregn(gruppe: Prisgruppe, aarsvaerk: number): Estimat {
  const s = SATSER[gruppe] ?? SATSER.andet;
  const av = Math.max(0.1, aarsvaerk);

  const ulykke = Math.max(MINIMUMSPRAEMIE, Math.round(av * s.ulykkePrAarsvaerk));
  const aes = Math.round(av * s.aesPrAarsvaerk);
  const total = ulykke + aes;

  return {
    gruppe,
    gruppenavn: s.navn,
    aarsvaerk: av,
    ulykke,
    aes,
    total,
    lav: Math.round((total * (1 - SPAEND)) / 100) * 100,
    hoej: Math.round((total * (1 + SPAEND)) / 100) * 100,
    maanedligt: Math.round(total / 12),
  };
}

export function kroner(n: number): string {
  return new Intl.NumberFormat('da-DK').format(Math.round(n)) + ' kr.';
}
