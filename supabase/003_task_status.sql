-- Ordina CRM - "Mai napom" kezdőlaphoz: a következő teendő valódi állapota
-- Futtasd le a Supabase SQL Editorban, az előző migrációk UTÁN.

alter table leads add column if not exists next_action_status text not null default 'nyitott'
  check (next_action_status in ('nyitott', 'lezárva', 'elnapolva'));
alter table leads add column if not exists next_action_completed_at timestamptz;
alter table leads add column if not exists next_action_postponed_at timestamptz;
