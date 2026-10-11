# beregnarbejdsskade.dk — kom i gang

Følg trinene i rækkefølge. Hvert trin tager 5-20 minutter.
Du skal ikke kunne kode. Du skal kunne kopiere en kommando ind i et felt.

---

## Trin 1 · Opret projektet (du er her)

### 1.1 Lav en mappe
Opret en tom mappe på din computer, fx `Dokumenter/beregnarbejdsskade`.

### 1.2 Åbn den i Claude Desktop
Åbn Claude Desktop → fanen **Code** → vælg mappen.

### 1.3 Læg filerne ind
Kopiér alle filer fra denne pakke ind i mappen.

### 1.4 Installer
Skriv til Claude i Code-fanen:

> Kør `npm install` og start udviklingsserveren

Du skulle gerne kunne åbne `http://localhost:3000`.

**Færdig med trin 1, når:** siden åbner lokalt i din browser.

---

## Trin 2 · Database

Du skal bruge en konto hos Supabase (gratis til at starte med).

1. Log ind på supabase.com → **New project**
2. Vælg region **Frankfurt (eu-central-1)** — data skal ligge i EU
3. Gem databaseadgangskoden et sikkert sted
4. Gå til **SQL Editor** → indsæt indholdet af `supabase/skema.sql` → kør
5. Gå til **Project Settings → API** og kopiér de to nøgler ind i `.env.local`

**Færdig med trin 2, når:** du kan se tabellerne `sager`, `modtagere` og `tilbud` under Table Editor.

---

## Trin 3 · CVR-opslag

To muligheder. Start med A, søg B sideløbende.

**A. Betalt tjeneste (i luften i morgen)**
Opret konto hos en dansk CVR-API-udbyder, læg nøglen i `.env.local` som `CVR_API_KEY`.

**B. Officiel systemadgang (gratis, tager uger)**
Ansøg Erhvervsstyrelsen om system-til-system-adgang til CVR.
Søg på "CVR systemadgang Erhvervsstyrelsen".

Filen `app/api/cvr/route.ts` er bygget, så kun ét sted skal ændres,
når du skifter fra den ene kilde til den anden.

**Færdig med trin 3, når:** du kan skrive dit eget CVR-nummer på siden
og se dit rigtige firmanavn, branchekode og årsværk.

---

## Trin 4 · Beregneren

Satserne i `lib/priser.ts` er gæt. De skal erstattes af rigtige tal.

Spørg et af selskaberne: "Hvad er jeres vejledende pris pr. årsværk
for arbejdsskadeforsikring i følgende ni brancher?"

**Færdig med trin 4, når:** estimatet rammer inden for 20 % af et
rigtigt tilbud på den samme virksomhed.

---

## Trin 5 · Mails

Opret konto hos Resend (gratis op til 3.000 mails/md).

1. Tilføj domænet `beregnarbejdsskade.dk`
2. Sæt de DNS-poster op, Resend viser (SPF, DKIM, DMARC)
3. Læg API-nøglen i `.env.local` som `RESEND_API_KEY`

**Vigtigt:** uden korrekte DNS-poster lander jeres mails i spam
hos selskaberne. Det er den hyppigste grund til, at den slags sider dør.

**Færdig med trin 5, når:** du kan sende en testmail til dig selv,
og den lander i indbakken, ikke i spam.

---

## Trin 6 · Selskabernes svarside

Hvert selskab får sit eget engangslink i mailen.
Linket indeholder et tilfældigt token, der peger på én sag og ét selskab.
Ingen adgangskode. Tokenet udløber efter 14 dage.

**Færdig med trin 6, når:** du kan sende en forespørgsel til din egen
mailadresse, klikke linket, taste en pris og se den dukke op i overblikket.

---

## Trin 7 · Kundens login

Samme mekanik: kunden skriver sin mail og får en 6-cifret kode.
Koden lever 5 minutter. Tre forsøg, så skal der bestilles en ny.

**Færdig med trin 7, når:** du kan logge ind på din egen sag fra
en anden browser end den, du oprettede den i.

---

## Trin 8 · Live

1. Forbind GitHub-repoet til Vercel
2. Læg alle variabler fra `.env.local` ind under **Environment Variables**
3. Peg `beregnarbejdsskade.dk` mod Vercel
4. Sæt 301-omdirigering fra de tre andre domæner
5. Opret Google Search Console og indsend sitemap
6. Sæt analytics op, så I kan se, hvor folk falder fra

**Færdig med trin 8, når:** siden svarer på det rigtige domæne,
og et testkøb kan gennemføres fra start til slut.

---

## Før første rigtige kunde

Disse hører til hos den, der ejer selskabet bag siden:

- Juridisk vurdering: er modellen lead-formidling eller forsikringsformidling?
- Privatlivspolitik og cookiebanner
- Databehandleraftaler med de selskaber, I sender oplysninger til
- Aftaler med mindst tre selskaber, ellers kan løftet om tre tilbud ikke holdes

---

## Når noget går galt

Skriv til Claude i Code-fanen hvad du prøvede, og indsæt fejlbeskeden.
Du behøver ikke forstå den.
