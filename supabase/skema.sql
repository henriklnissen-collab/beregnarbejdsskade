-- beregnarbejdsskade.dk · databaseskema
-- Kør hele filen i Supabase → SQL Editor → New query → Run.

-- ---------------------------------------------------------------
-- 1. Sager: én pr. forespørgsel fra en virksomhed
-- ---------------------------------------------------------------
create table if not exists sager (
  id              uuid primary key default gen_random_uuid(),
  oprettet        timestamptz not null default now(),

  -- virksomheden, hentet fra CVR
  cvr             text not null,
  firmanavn       text not null,
  branchekode     text,
  branchetekst    text,
  prisgruppe      text not null,

  -- kundens svar
  aarsvaerk       numeric(8,2) not null check (aarsvaerk > 0),
  aarsvaerk_cvr   numeric(8,2),
  aarsvaerk_periode text,
  startdato       date,

  -- vores eget estimat, gemt som det så ud på dagen
  estimat_total   integer,

  -- kontakt
  kontakt_navn    text not null,
  kontakt_mail    text not null,
  kontakt_tlf     text,

  -- samtykker. Gemmes med tidspunkt, så de kan dokumenteres.
  samtykke_videregivelse_tid timestamptz not null,
  samtykke_skadesoplysninger_tid timestamptz not null,
  samtykke_ip     inet,

  status          text not null default 'aaben'
                  check (status in ('aaben','afsluttet','annulleret')),

  -- sættes når kunden vælger et selskab
  valgt_modtager  uuid
);

create index if not exists sager_mail_idx on sager (lower(kontakt_mail));
create index if not exists sager_cvr_idx  on sager (cvr);

-- ---------------------------------------------------------------
-- 2. Modtagere: selskaber og mæglere, der kan få forespørgsler
-- ---------------------------------------------------------------
create table if not exists modtagere (
  id          uuid primary key default gen_random_uuid(),
  navn        text not null,
  type        text not null check (type in ('selskab','maegler')),
  mail        text not null,
  aktiv       boolean not null default false,  -- først true når aftalen er på plads
  sortering   integer not null default 100
);

-- ---------------------------------------------------------------
-- 3. Tilbud: én række pr. sag pr. modtager
-- ---------------------------------------------------------------
create table if not exists tilbud (
  id            uuid primary key default gen_random_uuid(),
  sag_id        uuid not null references sager(id) on delete cascade,
  modtager_id   uuid not null references modtagere(id),

  -- engangslink til selskabets svarside
  token         text not null unique,
  token_udloeb  timestamptz not null default (now() + interval '14 days'),

  sendt         timestamptz not null default now(),
  aabnet        timestamptz,
  besvaret      timestamptz,

  status        text not null default 'afventer'
                check (status in ('afventer','modtaget','afvist','valgt','lukket')),

  -- selskabets svar, i felter så de kan sammenlignes
  pris_aarlig   integer check (pris_aarlig is null or pris_aarlig > 0),
  aes_inkluderet boolean,
  bindingsperiode text,
  gyldig_til    date,
  bemaerkning   text,
  afvis_grund   text,

  unique (sag_id, modtager_id)
);

create index if not exists tilbud_sag_idx   on tilbud (sag_id);
create index if not exists tilbud_token_idx on tilbud (token);

-- ---------------------------------------------------------------
-- 4. Engangskoder til kundens login
-- ---------------------------------------------------------------
create table if not exists login_koder (
  id        uuid primary key default gen_random_uuid(),
  mail      text not null,
  kode_hash text not null,          -- aldrig koden i klartekst
  udloeb    timestamptz not null default (now() + interval '5 minutes'),
  forsoeg   integer not null default 0,
  brugt     timestamptz,
  oprettet  timestamptz not null default now()
);

create index if not exists login_mail_idx on login_koder (lower(mail), oprettet desc);

-- ---------------------------------------------------------------
-- 5. Sikkerhed
-- Alt går gennem vores egen server med service-nøglen.
-- Browseren må ikke kunne læse tabellerne direkte.
-- ---------------------------------------------------------------
alter table sager       enable row level security;
alter table tilbud      enable row level security;
alter table login_koder enable row level security;
alter table modtagere   enable row level security;
-- Ingen politikker oprettes med vilje: uden dem er alt lukket for
-- den offentlige nøgle, og kun service-nøglen på serveren kommer ind.

-- ---------------------------------------------------------------
-- 6. Startdata. Sæt aktiv = true, når aftalen er på plads.
-- Ret mailadresserne til de rigtige, før I sender noget.
-- ---------------------------------------------------------------
insert into modtagere (navn, type, mail, aktiv, sortering) values
  ('Tryg',                    'selskab', 'ret-mig@eksempel.dk', false, 10),
  ('Topdanmark',              'selskab', 'ret-mig@eksempel.dk', false, 20),
  ('If Erhverv',              'selskab', 'ret-mig@eksempel.dk', false, 30),
  ('Alm. Brand',              'selskab', 'ret-mig@eksempel.dk', false, 40),
  ('Gjensidige',              'selskab', 'ret-mig@eksempel.dk', false, 50),
  ('Protector Forsikring',    'selskab', 'ret-mig@eksempel.dk', false, 60),
  ('Købstædernes Forsikring', 'selskab', 'ret-mig@eksempel.dk', false, 70),
  ('GF Forsikring',           'selskab', 'ret-mig@eksempel.dk', false, 80),
  ('Thisted Forsikring',      'selskab', 'ret-mig@eksempel.dk', false, 90)
on conflict do nothing;
