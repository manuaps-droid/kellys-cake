-- ==========================================================
-- Kelly's Cake
-- Migración 006
-- RLS Personalización
-- ==========================================================

alter table public.catalogo_personalizacion
enable row level security;

alter table public.proyectos_personalizados
enable row level security;

alter table public.proyecto_catalogos
enable row level security;

alter table public.proyecto_imagenes
enable row level security;

-------------------------------------------------------------
-- Catálogo
-------------------------------------------------------------

create policy "Catalogo publico lectura"
on public.catalogo_personalizacion
for select
using (activo = true);

-------------------------------------------------------------
-- Proyectos
-------------------------------------------------------------

create policy "Clientes crean proyectos"
on public.proyectos_personalizados
for insert
with check (true);

create policy "Clientes leen sus proyectos"
on public.proyectos_personalizados
for select
using (auth.uid() = cliente_id);

create policy "Clientes actualizan sus proyectos"
on public.proyectos_personalizados
for update
using (auth.uid() = cliente_id);

-------------------------------------------------------------
-- Proyecto - Catálogos
-------------------------------------------------------------

create policy "Insert proyecto catalogos"
on public.proyecto_catalogos
for insert
with check (true);

create policy "Leer proyecto catalogos"
on public.proyecto_catalogos
for select
using (
    exists (
        select 1
        from public.proyectos_personalizados p
        where p.id = proyecto_id
        and p.cliente_id = auth.uid()
    )
);

-------------------------------------------------------------
-- Proyecto - Imágenes
-------------------------------------------------------------

create policy "Insert proyecto imagenes"
on public.proyecto_imagenes
for insert
with check (true);

create policy "Leer proyecto imagenes"
on public.proyecto_imagenes
for select
using (
    exists (
        select 1
        from public.proyectos_personalizados p
        where p.id = proyecto_id
        and p.cliente_id = auth.uid()
    )
);