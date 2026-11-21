-- Proyecto Py: pega esto en Supabase → SQL Editor → Run.
-- Una fila por usuario con todo lo que guarda la app (cartera, listas, pasos, perfil...).
create table if not exists public.datos (
  user_id uuid primary key references auth.users(id) on delete cascade,
  datos jsonb not null default '{}'::jsonb,
  actualizado timestamptz not null default now()
);
alter table public.datos enable row level security;
-- Cada persona solo puede ver y cambiar su propia fila.
create policy "leer lo mío"   on public.datos for select using (auth.uid() = user_id);
create policy "crear lo mío"  on public.datos for insert with check (auth.uid() = user_id);
create policy "cambiar lo mío" on public.datos for update using (auth.uid() = user_id);
create policy "borrar lo mío" on public.datos for delete using (auth.uid() = user_id);
-- La app entra como "authenticated": necesita permiso sobre la tabla (las reglas de arriba limitan a lo propio).
grant select, insert, update, delete on public.datos to authenticated;
