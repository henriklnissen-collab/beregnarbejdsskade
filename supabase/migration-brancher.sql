-- Fordelingen af årsværk på brancher.
--
-- En virksomhed kan have folk i flere slags arbejde — en vognmand med
-- et kontor, en tømrer med en butik. Selskaberne prissætter pr.
-- risikogruppe, så de skal kunne se opdelingen og ikke kun én kode.
--
-- Kør den i Supabase under SQL Editor. Den kan køres flere gange
-- uden at gøre skade.

alter table sager add column if not exists brancher jsonb;

comment on column sager.brancher is
  'Liste: [{gruppe, navn, klasse, aarsvaerk}]. Summen svarer til sager.aarsvaerk.';
