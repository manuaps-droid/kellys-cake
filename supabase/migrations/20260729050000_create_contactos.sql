create table public.contactos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null,
  telefono text,
  asunto text not null,
  mensaje text not null,
  leido boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contactos enable row level security;

create policy "service_role_full_access"
  on public.contactos
  for all
  to service_role
  using (true)
  with check (true);

create policy "anon_insert"
  on public.contactos
  for insert
  to anon
  with check (true);
