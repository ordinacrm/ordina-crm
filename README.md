# Ordina CRM

Belső CRM Petra és Máté számára az Ordina ügyfeleinek/leadjeinek nyomon követésére. Önálló projekt, saját Supabase háttérrel — nincs kapcsolatban az ntak-app (Ordina POS) kódjával vagy adatbázisával.

## Fejlesztés

```bash
npm install
npm run dev
```

A `.env` fájlban kell megadni:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Adatbázis

A `supabase/schema.sql` tartalmazza a séma teljes definícióját (táblák, alap pipeline-szakaszok, RLS policy-k) — a Supabase Dashboard SQL Editorában futtatandó egy új projekten.

A bejelentkezéshez a két felhasználót (Petra, Máté) a Supabase Dashboard → Authentication → Users menüben kell manuálisan létrehozni — nincs önálló regisztráció.

## Funkciók

- Kanban nézet (húzd-és-ejtsd a pipeline-szakaszok között) és Táblázat nézet, egy kapcsolóval
- Keresés név/cégnév szerint, szűrés felelős / forrás / lejárt határidő szerint
- Lead-részletező panel: minden mező szerkeszthető, időbélyeges jegyzetnapló
- Lejárt "következő teendő" határidő piros kiemeléssel mindkét nézetben
