import { createClient } from '@supabase/supabase-js';

/**
 * Forbindelse til databasen.
 *
 * Bruges KUN på serveren (API-ruter og server components).
 * Service-nøglen giver fuld adgang til alle tabeller og må aldrig
 * havne i browseren. Derfor ingen NEXT_PUBLIC_ foran den.
 */

let klient: ReturnType<typeof createClient> | null = null;

/**
 * Renser en værdi fra .env.local for de tastefejl, der er nemme at lave:
 * variabelnavnet skrevet to gange, citationstegn omkring, mellemrum
 * og en afsluttende skråstreg.
 */
function ren(raa: string | undefined, navn: string): string {
  let v = (raa ?? '').trim();
  v = v.replace(new RegExp('^' + navn + '\\s*=\\s*', 'i'), '');
  v = v.replace(/^["']|["']$/g, '');
  return v.replace(/\/+$/, '');
}

export function db() {
  if (klient) return klient;

  // Supabase viser flere adresser. Vi skal kun have selve projektadressen,
  // ikke REST-, auth- eller storage-stien, som er nem at komme til at kopiere.
  const url = ren(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL')
    .replace(/\/(rest|auth|storage|realtime|functions)\/v\d.*$/i, '')
    .replace(/\/+$/, '');
  const noegle = ren(process.env.SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SERVICE_ROLE_KEY');

  if (!url) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL er tom i .env.local. ' +
      'Den skal se sådan ud: https://ditprojekt.supabase.co ' +
      '(find den i Supabase under Project Settings → Data API → Project URL). ' +
      'Husk at genstarte serveren bagefter.',
    );
  }

  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL ser forkert ud. Der står nu: "${url}". ` +
      'Den skal se sådan ud: https://ditprojekt.supabase.co — ' +
      'kun selve adressen, uden variabelnavnet foran og uden skråstreg til sidst.',
    );
  }

  if (!noegle) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY er tom i .env.local. ' +
      'Find den i Supabase under Project Settings → API Keys → service_role. ' +
      'Husk at genstarte serveren bagefter.',
    );
  }

  klient = createClient(url, noegle, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return klient;
}

/* ───────────────────────────────────────────────────────────────
   Typer, der matcher tabellerne i supabase/skema.sql
   ─────────────────────────────────────────────────────────────── */

export type Modtager = {
  id: string;
  navn: string;
  type: 'selskab' | 'maegler';
  mail: string;
  aktiv: boolean;
  sortering: number;
};

export type TilbudStatus = 'afventer' | 'modtaget' | 'afvist' | 'valgt' | 'lukket';

export type Tilbud = {
  id: string;
  sag_id: string;
  modtager_id: string;
  token: string;
  status: TilbudStatus;
  pris_aarlig: number | null;
  aes_inkluderet: boolean | null;
  bindingsperiode: string | null;
  gyldig_til: string | null;
  bemaerkning: string | null;
  afvis_grund: string | null;
  sendt: string;
  besvaret: string | null;
};

export type Sag = {
  id: string;
  oprettet: string;
  cvr: string;
  firmanavn: string;
  branchekode: string | null;
  branchetekst: string | null;
  prisgruppe: string;
  aarsvaerk: number;
  aarsvaerk_cvr: number | null;
  aarsvaerk_periode: string | null;
  startdato: string | null;
  estimat_total: number | null;
  kontakt_navn: string;
  kontakt_mail: string;
  kontakt_tlf: string | null;
  status: 'aaben' | 'afsluttet' | 'annulleret';
  valgt_modtager: string | null;
};

/* ───────────────────────────────────────────────────────────────
   Hjælpefunktioner
   ─────────────────────────────────────────────────────────────── */

/**
 * Laver et tilfældigt token til selskabernes engangslinks.
 * 32 tegn fra en kryptografisk kilde — kan ikke gættes.
 */
export function nytToken(): string {
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

/** Henter de modtagere, der må få forespørgsler. */
export async function aktiveModtagere(): Promise<Modtager[]> {
  const { data, error } = await db()
    .from('modtagere')
    .select('*')
    .eq('aktiv', true)
    .order('sortering');

  if (error) throw error;
  return (data ?? []) as Modtager[];
}

/** Slår en sag op ud fra et selskabs engangstoken. */
export async function sagFraToken(token: string) {
  const { data, error } = await db()
    .from('tilbud')
    .select('*, sager(*), modtagere(navn, type)')
    .eq('token', token)
    .gt('token_udloeb', new Date().toISOString())
    .maybeSingle();

  if (error) throw error;
  return data;
}
