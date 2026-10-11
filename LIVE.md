# Trin 8 · Få siden online

Følg i rækkefølge. Afsæt en aften.

---

## A. Læg koden på GitHub

1. Opret konto på github.com, hvis du ikke har en.
2. Tryk **New repository**.
3. Navn: `beregnarbejdsskade`. Vælg **Private**.
4. Opret uden readme, uden .gitignore.
5. Skriv til Claude i Code-fanen:

> Lav et git-repo af projektet, commit alt, og push til github.com/DITNAVN/beregnarbejdsskade

**Tjek:** `.env.local` må IKKE være med på GitHub. `.gitignore` holder den ude,
men kig efter i repoet, før du går videre. Er den sluppet med, skal alle nøgler
skiftes med det samme.

---

## B. Kobl Vercel på

6. Opret konto på vercel.com. Log ind med GitHub.
7. Tryk **Add New → Project**.
8. Vælg `beregnarbejdsskade`.
9. Vercel genkender selv Next.js. Rør ikke indstillingerne.
10. **Tryk ikke Deploy endnu.** Fold **Environment Variables** ud først.

---

## C. Variabler

11. Tilføj disse fem, én ad gangen:

| Navn | Værdi |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | samme som i .env.local |
| `SUPABASE_SERVICE_ROLE_KEY` | samme som i .env.local |
| `CVR_API_KEY` | samme som i .env.local |
| `RESEND_API_KEY` | samme som i .env.local |
| `MAIL_AFSENDER` | `beregnarbejdsskade.dk <tilbud@beregnarbejdsskade.dk>` |

12. Tilføj til sidst:

| Navn | Værdi |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://beregnarbejdsskade.dk` |

**Vigtigt:** uden den sidste peger alle links i mailene stadig på localhost.

13. Tryk **Deploy**. Vent to minutter.
14. Du får en adresse som `beregnarbejdsskade.vercel.app`. Åbn den og test.

---

## D. Domænerne

15. I Vercel, gå til dit projekt → **Settings** → **Domains**.
16. Tilføj `beregnarbejdsskade.dk`. Vercel viser nu en A-post eller nogle navneservere.

**Vælg én af to veje:**

**Vej 1 (enklest):** Skift navneservere hos one.com til Vercels.
Så styrer Vercel al DNS. Men husk: dine Resend-poster skal så oprettes
forfra i Vercel, ellers holder mailene op med at virke.

**Vej 2 (anbefalet, når Resend allerede er sat op hos one.com):**
Behold navneserverne hos one.com. Tilføj kun den A-post, Vercel beder om.
Så rører du ikke mail-opsætningen.

17. Tilføj derefter de tre andre domæner i Vercel:
    - `arbejdskade.dk`
    - `billigarbejdsskadeforsikring.dk`
    - `tilbudarbejdsskade.dk`
18. For hver af de tre: vælg **Redirect to** → `beregnarbejdsskade.dk`.
19. Sæt den til **Permanent (308)**. Det er det, Google forstår som flytning.
20. Opret den A-post, Vercel beder om, hos one.com for hvert af de tre domæner.

---

## E. Slå caching til igen

21. Åbn `app/api/cvr/route.ts`.
22. Find linjen med `'Cache-Control': 'no-store'`.
23. Ret den til:

```
'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
```

24. Fjern også `export const dynamic = 'force-dynamic';` og `export const revalidate = 0;`
    øverst i samme fil.
25. Commit og push. Vercel bygger selv igen.

Det sparer jer for opslag af CVR-kvoten, når flere slår det samme firma op.

---

## F. Google

26. Gå til search.google.com/search-console.
27. Tilføj `beregnarbejdsskade.dk` som **Domæne**-ejendom.
28. Google beder om en TXT-post. Opret den hos one.com.
29. Når den er bekræftet: gå til **Sitemaps** og indsend `sitemap.xml`.
30. Tilføj også de tre andre domæner, så Google ser viderestillingerne.

---

## G. Før første rigtige kunde

Disse hører til hos den, der ejer selskabet bag siden. Ikke teknik.

- [ ] Satserne i `lib/priser.ts` er rigtige tal fra et selskab, ikke gæt
- [ ] Mindst tre selskaber har sagt ja og er sat `aktiv = true` i Supabase
- [ ] Mailadresserne i tabellen `modtagere` er de rigtige
- [ ] Juridisk vurdering: er modellen lead-formidling eller forsikringsformidling?
- [ ] Privatlivspolitik og cookiebanner
- [ ] Databehandleraftaler med de selskaber, I sender oplysninger til
- [ ] Teksten om samtykke til skadesoplysninger er gennemgået af en jurist

---

## H. Når siden kører

- Vercel viser besøgstal under **Analytics**
- Supabase viser antal sager under **Table Editor → sager**
- Resend viser, om mails blev leveret eller bouncede

Det første tal, du skal holde øje med: hvor mange der skriver et CVR-nummer
mod hvor mange der sender forespørgslen. Falder folk fra undervejs, er det
dér, der skal rettes.
