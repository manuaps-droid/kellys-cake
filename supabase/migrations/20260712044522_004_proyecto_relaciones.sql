-- ==========================================================
-- Kelly's Cake
-- Migración 004
-- Relaciones del proyecto
-- ==========================================================

create table public.proyecto_catalogos (

    id uuid primary key default gen_random_uuid(),

    proyecto_id uuid not null,

    catalogo_id uuid not null,

    created_at timestamptz not null default now(),

    constraint proyecto_catalogos_proyecto_fk
        foreign key (proyecto_id)
        references public.proyectos_personalizados(id)
        on delete cascade,

    constraint proyecto_catalogos_catalogo_fk
        foreign key (catalogo_id)
        references public.catalogo_personalizacion(id)
        on delete cascade,

    constraint proyecto_catalogos_unique
        unique (
            proyecto_id,
            catalogo_id
        )

);

create table public.proyecto_imagenes (

    id uuid primary key default gen_random_uuid(),

    proyecto_id uuid not null,

    media_id uuid not null,

    orden integer not null default 0,

    created_at timestamptz not null default now(),

    constraint proyecto_imagenes_proyecto_fk
        foreign key (proyecto_id)
        references public.proyectos_personalizados(id)
        on delete cascade,

    constraint proyecto_imagenes_media_fk
        foreign key (media_id)
        references public.media(id)
        on delete cascade

);

create index idx_proyecto_catalogos_proyecto
on public.proyecto_catalogos(proyecto_id);

create index idx_proyecto_catalogos_catalogo
on public.proyecto_catalogos(catalogo_id);

create index idx_proyecto_imagenes_proyecto
on public.proyecto_imagenes(proyecto_id);

create index idx_proyecto_imagenes_media
on public.proyecto_imagenes(media_id);