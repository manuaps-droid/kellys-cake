-- ==========================================================
-- Kelly's Cake
-- Migración 003
-- Tabla proyectos_personalizados
-- ==========================================================

create table public.proyectos_personalizados (

    id uuid primary key default gen_random_uuid(),

    cliente_id uuid not null,

    descripcion text,

    mensaje text,

    personas integer not null,

    presupuesto numeric(10,2),

    alergias text,

    fecha_evento date not null,

    hora_evento time not null,

    tipo_entrega text not null,

    direccion text,

    referencia text,

    latitud double precision,

    longitud double precision,

    estado text not null default 'pendiente',

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    constraint proyectos_cliente_fk
        foreign key (cliente_id)
        references public.clientes(id)
        on delete cascade,

    constraint proyectos_entrega_check
        check (
            tipo_entrega in (
                'delivery',
                'pickup'
            )
        ),

    constraint proyectos_estado_check
        check (
            estado in (
                'pendiente',
                'en_revision',
                'cotizado',
                'aprobado',
                'rechazado',
                'cancelado'
            )
        )

);

create index idx_proyectos_cliente
on public.proyectos_personalizados(cliente_id);

create index idx_proyectos_estado
on public.proyectos_personalizados(estado);

create index idx_proyectos_fecha
on public.proyectos_personalizados(fecha_evento);