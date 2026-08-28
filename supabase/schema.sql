-- Ordina CRM - séma
-- Futtasd le a Supabase projekt SQL Editorában (Dashboard > SQL Editor > New query).

create extension if not exists "pgcrypto";

-- Pipeline szakaszok (konfigurálható, nem kőbe vésett)
create table if not exists stages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null,
  is_won boolean not null default false,
  is_lost boolean not null default false,
  created_at timestamptz not null default now()
);

-- Leadek / ügyfelek
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text,
  phone text,
  source text not null check (source in ('Személyes megkeresés', 'Weboldal űrlap', 'Email', 'Egyéb')),
  owner text not null check (owner in ('Petra', 'Máté')),
  stage_id uuid not null references stages(id),
  estimated_value numeric,
  last_contact_date date,
  next_action text,
  next_action_due date,
  lost_reason text,
  created_at timestamptz not null default now()
);

-- Időbélyeges jegyzet-napló (nem felülírható mező)
create table if not exists lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  author text not null check (author in ('Petra', 'Máté')),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_leads_stage on leads(stage_id);
create index if not exists idx_lead_notes_lead on lead_notes(lead_id);

-- Alap pipeline-szakaszok feltöltése
insert into stages (name, sort_order, is_won, is_lost) values
  ('Új lead', 1, false, false),
  ('Kapcsolatfelvétel', 2, false, false),
  ('Egyeztetés / ajánlat', 3, false, false),
  ('Tárgyalás', 4, false, false),
  ('Megnyert', 5, true, false),
  ('Elveszített', 6, false, true)
on conflict do nothing;

-- Row Level Security: csak a 2 belső, bejelentkezett felhasználó fér hozzá,
-- mindketten teljes (olvasás/írás/törlés) joggal.
alter table stages enable row level security;
alter table leads enable row level security;
alter table lead_notes enable row level security;

create policy "authenticated full access" on stages
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on leads
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated full access" on lead_notes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
