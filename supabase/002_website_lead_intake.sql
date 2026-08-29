-- Ordina CRM - weboldal-form integráció
-- Futtasd le a Supabase projekt SQL Editorában, a schema.sql UTÁN.

-- A weboldalról érkező lead-nek induláskor még nincs felelőse (Petra/Máté
-- utólag veszi fel) — a CHECK constraint NULL-t úgyis átenged, csak a
-- NOT NULL-t kell feloldani.
alter table leads alter column owner drop not null;

-- Korlátozott, publikusan hívható belépési pont a statikus marketing
-- oldal (marketing/index.html) számára. SECURITY DEFINER: a saját
-- jogosultságával fut, megkerülve a leads/lead_notes RLS-t (ami
-- authenticated-re van korlátozva) — de csak ezen a szűk felületen
-- keresztül, fix source/owner/stage mellett, nem nyitja meg a táblát.
create or replace function public.submit_website_lead(
  p_name text,
  p_email text default null,
  p_phone text default null,
  p_next_action text default null,
  p_next_action_due date default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stage_id uuid;
  v_lead_id uuid;
begin
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'name is required';
  end if;

  select id into v_stage_id
  from stages
  where is_won = false and is_lost = false
  order by sort_order asc
  limit 1;

  insert into leads (name, email, phone, source, owner, stage_id, next_action, next_action_due)
  values (trim(p_name), nullif(trim(p_email), ''), nullif(trim(p_phone), ''), 'Weboldal űrlap', null, v_stage_id, p_next_action, p_next_action_due)
  returning id into v_lead_id;

  return v_lead_id;
end;
$$;

-- Csak a futtatási jogot kapja meg az anon (be nem jelentkezett) szerep —
-- a leads/lead_notes táblákhoz továbbra sincs közvetlen hozzáférése.
grant execute on function public.submit_website_lead(text, text, text, text, date) to anon;
