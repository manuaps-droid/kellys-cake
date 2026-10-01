-- ==================================================
-- ARCHIVO: 20260712023301_001_initial_schema.sql
-- ==================================================


-- ==================================================
-- ARCHIVO: 20260712024559_002_personalizacion.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- MigraciÃ³n 002
-- Bloque 1 - CatÃ¡logo PersonalizaciÃ³n
-- ==========================================================

create extension if not exists pgcrypto;

create table if not exists public.catalogo_personalizacion (

    id uuid primary key default gen_random_uuid(),

    tipo text not null,

    nombre text not null,

    descripcion text,

    orden integer not null default 0,

    activo boolean not null default true,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    constraint catalogo_personalizacion_tipo_check
    check (
        tipo in (
            'celebration',
            'flavor',
            'filling',
            'frosting'
        )
    )

);

create index if not exists idx_catalogo_tipo
on public.catalogo_personalizacion(tipo);

create index if not exists idx_catalogo_activo
on public.catalogo_personalizacion(activo);
-- ==========================================================
-- PROYECTOS PERSONALIZADOS
-- ==========================================================

create table if not exists public.proyectos_personalizados (

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

create index if not exists idx_proyectos_cliente
on public.proyectos_personalizados(cliente_id);

create index if not exists idx_proyectos_estado
on public.proyectos_personalizados(estado);

create index if not exists idx_proyectos_fecha
on public.proyectos_personalizados(fecha_evento);

-- ==================================================
-- ARCHIVO: 20260712041257_003_proyectos_personalizados.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- MigraciÃ³n 003
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

-- ==================================================
-- ARCHIVO: 20260712044522_004_proyecto_relaciones.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- MigraciÃ³n 004
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

-- ==================================================
-- ARCHIVO: 20260712044755_005_updated_at_triggers.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- MigraciÃ³n 005
-- updated_at automÃ¡tico
-- ==========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger trg_catalogo_personalizacion_updated_at
before update
on public.catalogo_personalizacion
for each row
execute function public.set_updated_at();

create trigger trg_proyectos_personalizados_updated_at
before update
on public.proyectos_personalizados
for each row
execute function public.set_updated_at();

-- ==================================================
-- ARCHIVO: 20260712045015_006_rls_personalizacion.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- MigraciÃ³n 006
-- RLS PersonalizaciÃ³n
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
-- CatÃ¡logo
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
-- Proyecto - CatÃ¡logos
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
-- Proyecto - ImÃ¡genes
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

-- ==================================================
-- ARCHIVO: 20260712045234_007_seed_catalogo_personalizacion.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- MigraciÃ³n 007
-- Datos iniciales catÃ¡logo personalizaciÃ³n
-- ==========================================================

insert into public.catalogo_personalizacion
(tipo, nombre, orden)
values

('celebration','CumpleaÃ±os',1),
('celebration','Boda',2),
('celebration','Baby Shower',3),
('celebration','Aniversario',4),

('flavor','Chocolate',1),
('flavor','Vainilla',2),
('flavor','Red Velvet',3),

('filling','Manjar',1),
('filling','Fudge',2),
('filling','Ganache',3),

('frosting','Buttercream',1),
('frosting','Fondant',2),
('frosting','Chantilly',3)

on conflict do nothing;

-- ==================================================
-- ARCHIVO: 20260726000000_normalize_products.sql
-- ==================================================


-- ==================================================
-- ARCHIVO: 20260727000000_drop_tipo_constraint_and_seed.sql
-- ==================================================
-- Eliminar el CHECK constraint en 'tipo' para permitir crear cualquier tipo de catÃ¡logo
ALTER TABLE catalogo_personalizacion
  DROP CONSTRAINT IF EXISTS catalogo_personalizacion_tipo_check;

-- Recrear el seed con los catÃ¡logos iniciales solicitados
-- Celebrations
INSERT INTO catalogo_personalizacion (tipo, nombre, descripcion, orden, activo)
VALUES
  ('celebration', 'CumpleaÃ±os', 'CelebraciÃ³n de cumpleaÃ±os', 1, true),
  ('celebration', 'Matrimonio', 'Boda y celebraciones matrimoniales', 2, true),
  ('celebration', '15 AÃ±os', 'QuinceaÃ±era', 3, true),
  ('celebration', 'Baby Shower', 'Fiesta de bienvenida para bebÃ©', 4, true),
  ('celebration', 'Aniversario', 'CelebraciÃ³n de aniversario', 5, true),
  ('celebration', 'GraduaciÃ³n', 'Ceremonia de graduaciÃ³n', 6, true),
  ('celebration', 'Bautizo', 'Ceremonia de bautizo', 7, true)
ON CONFLICT DO NOTHING;

-- Sabores
INSERT INTO catalogo_personalizacion (tipo, nombre, descripcion, orden, activo)
VALUES
  ('flavor', 'Chocolate', 'Bizcocho de chocolate', 1, true),
  ('flavor', 'Vainilla', 'Bizcocho de vainilla', 2, true),
  ('flavor', 'Red Velvet', 'Bizcocho red velvet', 3, true),
  ('flavor', 'Fresa', 'Bizcocho de fresa', 4, true),
  ('flavor', 'LimÃ³n', 'Bizcocho de limÃ³n', 5, true),
  ('flavor', 'Zanahoria', 'Bizcocho de zanahoria', 6, true)
ON CONFLICT DO NOTHING;

-- Rellenos
INSERT INTO catalogo_personalizacion (tipo, nombre, descripcion, orden, activo)
VALUES
  ('filling', 'Manjar', 'Manjar tradicional', 1, true),
  ('filling', 'Fudge', 'Fudge de chocolate', 2, true),
  ('filling', 'Ganache', 'Ganache de chocolate', 3, true),
  ('filling', 'Mermelada', 'Mermelada de frutas', 4, true),
  ('filling', 'Crema de avellana', 'Crema de avellana', 5, true)
ON CONFLICT DO NOTHING;

-- Coberturas
INSERT INTO catalogo_personalizacion (tipo, nombre, descripcion, orden, activo)
VALUES
  ('frosting', 'Buttercream', 'Buttercream tradicional', 1, true),
  ('frosting', 'Fondant', 'Fondant decorativo', 2, true),
  ('frosting', 'Chantilly', 'Crema chantilly', 3, true),
  ('frosting', 'Naked', 'Sin cobertura exterior', 4, true),
  ('frosting', 'Espejo', 'Cobertura tipo espejo', 5, true)
ON CONFLICT DO NOTHING;


-- ==================================================
-- ARCHIVO: 20260727010000_producto_catalogo.sql
-- ==================================================
-- Tabla de relaciÃ³n muchos a muchos entre productos y catÃ¡logos de personalizaciÃ³n
CREATE TABLE IF NOT EXISTS producto_catalogo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id uuid NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  catalogo_id uuid NOT NULL REFERENCES catalogo_personalizacion(id) ON DELETE CASCADE,
  precio_extra numeric(10,2) NOT NULL DEFAULT 0,
  obligatorio boolean NOT NULL DEFAULT false,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(producto_id, catalogo_id)
);

-- Ãndices
CREATE INDEX IF NOT EXISTS idx_producto_catalogo_producto ON producto_catalogo(producto_id);
CREATE INDEX IF NOT EXISTS idx_producto_catalogo_catalogo ON producto_catalogo(catalogo_id);

-- RLS
ALTER TABLE producto_catalogo ENABLE ROW LEVEL SECURITY;

-- Admin puede todo (idempotente: si ya existe, no hace nada)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access on producto_catalogo') THEN
    CREATE POLICY "Admin full access on producto_catalogo"
      ON producto_catalogo
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM clientes
          WHERE clientes.user_id = auth.uid()
            AND clientes.rol = 'admin'
            AND clientes.activo = true
        )
      );
  END IF;
END $$;

-- Lectura pÃºblica para items activos (idempotente: si ya existe, no hace nada)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read active producto_catalogo') THEN
    CREATE POLICY "Public read active producto_catalogo"
      ON producto_catalogo
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Admin catÃ¡logos (idempotente: si ya existe, no hace nada)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin insert catalogo') THEN
    CREATE POLICY "Admin insert catalogo"
      ON public.catalogo_personalizacion
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM clientes
          WHERE clientes.user_id = auth.uid()
            AND clientes.rol = 'admin'
            AND clientes.activo = true
        )
      );
  END IF;
END $$;


-- ==================================================
-- ARCHIVO: 20260727020000_rls_catalogo_admin_write.sql
-- ==================================================
-- PolÃ­ticas RLS para que el admin pueda gestionar catÃ¡logos (idempotentes)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin insert catalogo') THEN
    CREATE POLICY "Admin insert catalogo"
      ON public.catalogo_personalizacion
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM clientes
          WHERE clientes.user_id = auth.uid()
            AND clientes.rol = 'admin'
            AND clientes.activo = true
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin update catalogo') THEN
    CREATE POLICY "Admin update catalogo"
      ON public.catalogo_personalizacion
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM clientes
          WHERE clientes.user_id = auth.uid()
            AND clientes.rol = 'admin'
            AND clientes.activo = true
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin delete catalogo') THEN
    CREATE POLICY "Admin delete catalogo"
      ON public.catalogo_personalizacion
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM clientes
          WHERE clientes.user_id = auth.uid()
            AND clientes.rol = 'admin'
            AND clientes.activo = true
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin read all catalogo') THEN
    CREATE POLICY "Admin read all catalogo"
      ON public.catalogo_personalizacion
      FOR SELECT
      USING (
        activo = true
        OR EXISTS (
          SELECT 1 FROM clientes
          WHERE clientes.user_id = auth.uid()
            AND clientes.rol = 'admin'
            AND clientes.activo = true
        )
      );
  END IF;
END $$;

-- TambiÃ©n eliminar la polÃ­tica anterior de solo lectura pÃºblica (solo si existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Catalogo publico lectura') THEN
    DROP POLICY IF EXISTS "Catalogo publico lectura" ON public.catalogo_personalizacion;
  END IF;
END $$;


-- ==================================================
-- ARCHIVO: 20260728000000_rls_clientes.sql
-- ==================================================
-- RLS para la tabla clientes
-- Cada usuario puede leer y actualizar su propio registro
-- El service role / server actions bypass RLS automÃ¡ticamente

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clientes leen su propio registro" ON public.clientes;
-- Usuarios leen su propio registro
CREATE POLICY "Clientes leen su propio registro"
ON public.clientes
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Clientes actualizan su propio registro" ON public.clientes;
-- Usuarios actualizan su propio registro
CREATE POLICY "Clientes actualizan su propio registro"
ON public.clientes
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins leen todos los clientes" ON public.clientes;
-- Admins leen todos los registros (para panel admin)
CREATE POLICY "Admins leen todos los clientes"
ON public.clientes
FOR SELECT
USING (public.is_admin());


-- ==================================================
-- ARCHIVO: 20260728010000_trigger_auto_cliente.sql
-- ==================================================
-- Trigger para crear fila en 'clientes' automÃ¡ticamente cuando se crea un usuario en auth.users
-- Esto funciona incluso con confirmaciÃ³n de email porque el trigger corre en la DB

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.clientes (user_id, nombre, apellidos, correo, celular, rol, activo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nombre', split_part(NEW.raw_user_meta_data ->> 'full_name', ' ', 1), 'Cliente'),
    COALESCE(NEW.raw_user_meta_data ->> 'apellidos', trim(both ' ' from replace(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.raw_user_meta_data ->> 'full_name', ' ', 1), ''))),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'celular', ''),
    'cliente',
    true
  );
  RETURN NEW;
END;
$$;

-- Crear el trigger en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ==================================================
-- ARCHIVO: 20260728020000_rls_clientes_insert.sql
-- ==================================================
-- PolÃ­tica INSERT: permite al usuario autenticado crear su propio registro en clientes
-- Necesario para usuarios que se registraron antes del trigger

CREATE POLICY "Clientes crean su propio registro"
ON public.clientes
FOR INSERT
WITH CHECK (auth.uid() = user_id);


-- ==================================================
-- ARCHIVO: 20260728030000_disable_rls_clientes.sql
-- ==================================================
-- Deshabilitar RLS en clientes: la app maneja auth en cÃ³digo (server actions)
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;


-- ==================================================
-- ARCHIVO: 20260729000000_update_proyecto_statuses.sql
-- ==================================================
ALTER TABLE public.proyectos_personalizados
DROP CONSTRAINT IF EXISTS proyectos_estado_check;

ALTER TABLE public.proyectos_personalizados
ADD CONSTRAINT proyectos_estado_check
CHECK (
    estado IN (
        'pendiente',
        'cotizacion_enviada',
        'aprobado',
        'entregado',
        'anulado'
    )
);


-- ==================================================
-- ARCHIVO: 20260729010000_fix_proyecto_rls.sql
-- ==================================================
-- Fix RLS policies for proyectos_personalizados, proyecto_catalogos, proyecto_imagenes
-- The old policies used auth.uid() = cliente_id which is wrong because
-- cliente_id references clientes.id, but auth.uid() is auth.users.id.
-- The correct comparison is clientes.user_id = auth.uid().

-- =========================================================
-- Proyectos personalizados
-- =========================================================

DROP POLICY IF EXISTS "Clientes leen sus proyectos" ON public.proyectos_personalizados;
DROP POLICY IF EXISTS "Clientes actualizan sus proyectos" ON public.proyectos_personalizados;

CREATE POLICY "Usuarios leen sus proyectos"
  ON public.proyectos_personalizados
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clientes
      WHERE clientes.id = cliente_id
        AND clientes.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM clientes
      WHERE clientes.user_id = auth.uid()
        AND clientes.rol = 'admin'
        AND clientes.activo = true
    )
  );

CREATE POLICY "Usuarios actualizan sus proyectos"
  ON public.proyectos_personalizados
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clientes
      WHERE clientes.id = cliente_id
        AND clientes.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM clientes
      WHERE clientes.user_id = auth.uid()
        AND clientes.rol = 'admin'
        AND clientes.activo = true
    )
  );

CREATE POLICY "Admin elimina proyectos"
  ON public.proyectos_personalizados
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM clientes
      WHERE clientes.user_id = auth.uid()
        AND clientes.rol = 'admin'
        AND clientes.activo = true
    )
  );

-- =========================================================
-- Proyecto - CatÃ¡logos
-- =========================================================

DROP POLICY IF EXISTS "Leer proyecto catalogos" ON public.proyecto_catalogos;

CREATE POLICY "Usuarios leen proyecto catalogos"
  ON public.proyecto_catalogos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM proyectos_personalizados p
      JOIN clientes ON clientes.id = p.cliente_id
      WHERE p.id = proyecto_id
        AND clientes.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM clientes
      WHERE clientes.user_id = auth.uid()
        AND clientes.rol = 'admin'
        AND clientes.activo = true
    )
  );

-- =========================================================
-- Proyecto - ImÃ¡genes
-- =========================================================

DROP POLICY IF EXISTS "Leer proyecto imagenes" ON public.proyecto_imagenes;

CREATE POLICY "Usuarios leen proyecto imagenes"
  ON public.proyecto_imagenes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM proyectos_personalizados p
      JOIN clientes ON clientes.id = p.cliente_id
      WHERE p.id = proyecto_id
        AND clientes.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM clientes
      WHERE clientes.user_id = auth.uid()
        AND clientes.rol = 'admin'
        AND clientes.activo = true
    )
  );


-- ==================================================
-- ARCHIVO: 20260729020000_disable_rls_proyectos.sql
-- ==================================================
-- Deshabilitar RLS en tablas de proyectos: la app maneja auth en cÃ³digo (server actions)
ALTER TABLE public.proyectos_personalizados DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyecto_catalogos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyecto_imagenes DISABLE ROW LEVEL SECURITY;


-- ==================================================
-- ARCHIVO: 20260729030000_add_observaciones_consent.sql
-- ==================================================
alter table public.proyectos_personalizados
add column observaciones text;

alter table public.proyectos_personalizados
add column autoriza_comunicacion boolean not null default false;


-- ==================================================
-- ARCHIVO: 20260729050000_create_contactos.sql
-- ==================================================
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


-- ==================================================
-- ARCHIVO: 20260730060000_add_mas_vendido.sql
-- ==================================================
-- Agregar columna mas_vendido a la tabla productos
ALTER TABLE public.productos
ADD COLUMN IF NOT EXISTS mas_vendido boolean DEFAULT false;

-- Dar permisos a service_role
GRANT ALL ON public.productos TO service_role;


-- ==================================================
-- ARCHIVO: 20260730070000_create_catalogo_imagenes.sql
-- ==================================================
-- Tabla para almacenar mÃºltiples imÃ¡genes por catÃ¡logo
CREATE TABLE IF NOT EXISTS public.catalogo_imagenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalogo_id UUID NOT NULL REFERENCES public.catalogo_personalizacion(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  orden INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ãndices
CREATE INDEX IF NOT EXISTS idx_catalogo_imagenes_catalogo_id ON public.catalogo_imagenes(catalogo_id);
CREATE INDEX IF NOT EXISTS idx_catalogo_imagenes_media_id ON public.catalogo_imagenes(media_id);

-- Permisos
GRANT ALL ON public.catalogo_imagenes TO service_role;
GRANT ALL ON public.catalogo_imagenes TO anon;
GRANT ALL ON public.catalogo_imagenes TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- RLS
ALTER TABLE public.catalogo_imagenes ENABLE ROW LEVEL SECURITY;

-- PolÃ­tica de lectura pÃºblica
CREATE POLICY "Lectura pÃºblica de catalogo_imagenes"
  ON public.catalogo_imagenes
  FOR SELECT
  USING (true);


-- ==================================================
-- ARCHIVO: 20260803000000_008_cotizaciones_catering.sql
-- ==================================================
CREATE TABLE IF NOT EXISTS cotizaciones_catering (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_evento TEXT NOT NULL CHECK (tipo_evento IN ('cumpleanos', 'corporativo', 'otro')),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  celular TEXT NOT NULL,
  fecha_evento DATE NOT NULL,
  num_invitados INTEGER NOT NULL DEFAULT 0,
  descripcion TEXT NOT NULL,
  presupuesto TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'cotizado', 'aceptado', 'rechazado')),
  notas_admin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow authenticated users to insert
ALTER TABLE cotizaciones_catering ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit catering requests"
  ON cotizaciones_catering FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can view catering requests"
  ON cotizaciones_catering FOR SELECT
  USING (true);


-- ==================================================
-- ARCHIVO: 20260804100000_add_label_catering_catalog.sql
-- ==================================================
-- AÃ±ade columna `label` a catalogo_imagenes para titular cada tarjeta de catering
ALTER TABLE public.catalogo_imagenes
  ADD COLUMN IF NOT EXISTS label TEXT;

-- Permisos (ya existentes para SELECT/INSERT/DELETE, aquÃ­ reafirmamos UPDATE)
GRANT UPDATE ON public.catalogo_imagenes TO service_role;
GRANT UPDATE ON public.catalogo_imagenes TO authenticated;

-- Auto-crear catÃ¡logo "Catering" tipo catering_gallery (idempotente)
INSERT INTO public.catalogo_personalizacion (tipo, nombre, descripcion, orden, activo)
SELECT 'catering_gallery', 'Catering', 'GalerÃ­a de la pÃ¡gina de catering â€” 6 imÃ¡genes con tÃ­tulos editables', 1, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.catalogo_personalizacion WHERE tipo = 'catering_gallery'
);

-- Permisos reafirmados
GRANT ALL ON public.catalogo_personalizacion TO service_role;


-- ==================================================
-- ARCHIVO: 20260804110000_add_proyecto_id_to_catering.sql
-- ==================================================
-- AÃ±ade columna proyecto_id a cotizaciones_catering para enlazar un proyecto personalizado
ALTER TABLE public.cotizaciones_catering
  ADD COLUMN IF NOT EXISTS proyecto_id UUID REFERENCES public.proyectos_personalizados(id) ON DELETE SET NULL;

-- Permisos
GRANT UPDATE ON public.cotizaciones_catering TO service_role;
GRANT SELECT ON public.proyectos_personalizados TO service_role;


-- ==================================================
-- ARCHIVO: 20260804120000_add_precio_coffee_break.sql
-- ==================================================
-- AÃ±ade columna `precio` a catalogo_personalizacion (nullable, solo aplica a coffee_break)
ALTER TABLE public.catalogo_personalizacion
  ADD COLUMN IF NOT EXISTS precio NUMERIC(10,2);

-- Crear catÃ¡logo "Coffee Break" tipo coffee_break + items de ejemplo con precios
-- Si ya existe el catÃ¡logo (segÃºn el usuario ya estÃ¡ creado) no se duplica.
INSERT INTO public.catalogo_personalizacion (tipo, nombre, descripcion, orden, activo, precio)
SELECT 'coffee_break', 'Coffee Break', 'Opciones de coffee break con precio unitario', 1, true, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.catalogo_personalizacion WHERE tipo = 'coffee_break'
);

-- Items de coffee break (asumiendo que se pueden agregar como subitems con el mismo tipo)
-- Nota: El usuario indicÃ³ que ya tiene productos, asÃ­ que insertarlos solo si el tipo coffee_break estÃ¡ vacÃ­o.
DO $$
DECLARE
  has_items INTEGER;
BEGIN
  SELECT COUNT(*) INTO has_items FROM public.catalogo_personalizacion WHERE tipo = 'coffee_break' AND nombre <> 'Coffee Break';
  IF has_items = 0 THEN
    INSERT INTO public.catalogo_personalizacion (tipo, nombre, descripcion, orden, activo, precio) VALUES
      ('coffee_break', 'SÃ¡ndwich triangulares', 'SÃ¡ndwich surtidos en porciones triangulares (x10)', 1, true, 25.00),
      ('coffee_break', 'Miniaturas dulces', 'SelecciÃ³n de miniaturas dulces (x12)', 2, true, 30.00),
      ('coffee_break', 'TÃ© & CafÃ©', 'Servicio de tÃ©s y cafÃ© con leche', 3, true, 8.00),
      ('coffee_break', 'Jugos naturales', 'Jugos de frutas naturales (por vaso)', 4, true, 6.00),
      ('coffee_break', 'EstaciÃ³n de frutas', 'EstaciÃ³n de frutas de temporada', 5, true, 35.00),
      ('coffee_break', 'Queques individuales', 'Queques individuales variados (x6)', 6, true, 28.00);
  END IF;
END $$;

-- Permisos
GRANT UPDATE ON public.catalogo_personalizacion TO service_role;
GRANT SELECT ON public.catalogo_personalizacion TO anon;
GRANT SELECT ON public.catalogo_personalizacion TO authenticated;


-- ==================================================
-- ARCHIVO: 20260806000000_fix_coffee_break_public_reads.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- Fix: lectura pÃºblica del catÃ¡logo coffee break
-- 1) Permite a anon/authenticated leer clientes (usado por polÃ­ticas RLS)
-- 2) Asegura columna precio (idempotente)
-- ==========================================================

-- 1) Permisos: las polÃ­ticas RLS de catalogo_personalizacion
--    consultan clientes; sin este GRANT las lecturas pÃºblicas fallan.
GRANT SELECT ON public.clientes TO anon;
GRANT SELECT ON public.clientes TO authenticated;

-- 2) Columna precio (si ya existe, no hace nada)
ALTER TABLE public.catalogo_personalizacion
  ADD COLUMN IF NOT EXISTS precio NUMERIC(10,2);

-- 3) Permisos de lectura sobre el catÃ¡logo
GRANT SELECT ON public.catalogo_personalizacion TO anon;
GRANT SELECT ON public.catalogo_personalizacion TO authenticated;

-- 4) Recargar schema para PostgREST
NOTIFY pgrst, 'reload schema';


-- ==================================================
-- ARCHIVO: 20260806010000_cotizaciones.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- Cotizaciones: documento de cotizaciÃ³n generado por el admin
-- + soporte de items de cotizaciÃ³n en carrito y pedidos
-- ==========================================================

-- 1) Secuencia para el nÃºmero correlativo de cotizaciÃ³n
CREATE SEQUENCE IF NOT EXISTS cotizaciones_numero_seq;

-- 2) Tabla de cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero INTEGER NOT NULL DEFAULT nextval('cotizaciones_numero_seq'),
  catering_id UUID REFERENCES public.cotizaciones_catering(id) ON DELETE CASCADE,
  nombre TEXT,
  email TEXT,
  celular TEXT,
  tipo_evento TEXT,
  fecha_evento DATE,
  num_invitados INTEGER,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'enviada' CHECK (estado IN ('enviada', 'aceptada', 'rechazada')),
  token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger de updated_at reutilizando la funciÃ³n existente
DROP TRIGGER IF EXISTS set_cotizaciones_updated_at ON public.cotizaciones;
CREATE TRIGGER set_cotizaciones_updated_at
  BEFORE UPDATE ON public.cotizaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- RLS: la lectura pÃºblica se hace con service role desde la pÃ¡gina pÃºblica.
-- Se habilita RLS para impedir inserciones anÃ³nimas.
ALTER TABLE public.cotizaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read cotizaciones" ON public.cotizaciones;
CREATE POLICY "Public can read cotizaciones"
  ON public.cotizaciones FOR SELECT
  USING (true);

-- Permisos: service_role gestiona cotizaciones; anon/authenticated solo leen.
GRANT ALL ON public.cotizaciones TO service_role;
GRANT SELECT ON public.cotizaciones TO anon;
GRANT SELECT ON public.cotizaciones TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.cotizaciones_numero_seq TO service_role;
GRANT USAGE ON SEQUENCE public.cotizaciones_numero_seq TO anon;
GRANT USAGE ON SEQUENCE public.cotizaciones_numero_seq TO authenticated;

-- 3) carrito_items: soporte para items de cotizaciÃ³n con precio fijo
ALTER TABLE public.carrito_items
  ADD COLUMN IF NOT EXISTS precio_unitario NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS nombre TEXT,
  ADD COLUMN IF NOT EXISTS descripcion TEXT,
  ADD COLUMN IF NOT EXISTS imagen TEXT,
  ADD COLUMN IF NOT EXISTS cotizacion_id UUID REFERENCES public.cotizaciones(id) ON DELETE CASCADE;

-- Un item de carrito puede no referenciar un producto de catÃ¡logo (items de cotizaciÃ³n)
ALTER TABLE public.carrito_items ALTER COLUMN producto_id DROP NOT NULL;

-- 4) pedido_items: guardar nombre/descripcion/imagen de items de cotizaciÃ³n
ALTER TABLE public.pedido_items
  ADD COLUMN IF NOT EXISTS nombre TEXT,
  ADD COLUMN IF NOT EXISTS descripcion TEXT,
  ADD COLUMN IF NOT EXISTS imagen TEXT;

ALTER TABLE public.pedido_items ALTER COLUMN producto_id DROP NOT NULL;

-- 5) pedidos: registrar tipo de pago (abono/total), monto pagado y cotizaciÃ³n vinculada
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS tipo_pago TEXT,
  ADD COLUMN IF NOT EXISTS monto_pagado NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS cotizacion_id UUID REFERENCES public.cotizaciones(id) ON DELETE SET NULL;

NOTIFY pgrst, 'reload schema';


-- ==================================================
-- ARCHIVO: 20260807000000_fix_pedidos_pago.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- Fix pedidos: columnas de pago esperadas por la app
-- y permisos de service_role para el panel admin.
-- (Las tablas pedidos/pedido_items fueron creadas manualmente
--  y no incluyen las columnas ni los GRANT que usa el cÃ³digo.)
-- ==========================================================

-- 1) Columnas de pago que inserta create-order.action.ts
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS metodo_pago TEXT,
  ADD COLUMN IF NOT EXISTS referencia_pago TEXT,
  ADD COLUMN IF NOT EXISTS estado_pago TEXT;

-- 2) Permisos: el panel admin lee pedidos con service_role
GRANT ALL ON public.pedidos TO service_role;
GRANT ALL ON public.pedido_items TO service_role;
GRANT ALL ON public.carrito_items TO service_role;

NOTIFY pgrst, 'reload schema';


-- ==================================================
-- ARCHIVO: 20260807020000_pedidos_numero_admin_rls.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- Pedidos: nÃºmero correlativo para identificar pedidos
-- + polÃ­ticas admin para que el panel de administraciÃ³n
-- lea y actualice todos los pedidos usando la sesiÃ³n del
-- usuario (createClient), no solo los propios.
-- ==========================================================

-- 1) NÃºmero correlativo de pedido (identificaciÃ³n legible)
CREATE SEQUENCE IF NOT EXISTS public.pedidos_numero_seq;

ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS numero INTEGER;

-- Backfill en orden cronolÃ³gico
WITH numbered AS (
  SELECT id,
         row_number() OVER (ORDER BY created_at ASC, id ASC) AS n
  FROM public.pedidos
)
UPDATE public.pedidos p
SET numero = numbered.n
FROM numbered
WHERE p.id = numbered.id;

SELECT setval('public.pedidos_numero_seq',
              COALESCE((SELECT MAX(numero) FROM public.pedidos), 1));

ALTER TABLE public.pedidos
  ALTER COLUMN numero SET DEFAULT nextval('public.pedidos_numero_seq'),
  ALTER COLUMN numero SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS pedidos_numero_key ON public.pedidos (numero);

GRANT USAGE, SELECT ON SEQUENCE public.pedidos_numero_seq TO service_role;
GRANT USAGE ON SEQUENCE public.pedidos_numero_seq TO authenticated;

-- 2) PolÃ­ticas admin (mismo patrÃ³n que "Admins leen todos los clientes")

-- Admins ven todos los pedidos
DROP POLICY IF EXISTS "Admins ven todos los pedidos" ON public.pedidos;
CREATE POLICY "Admins ven todos los pedidos"
  ON public.pedidos FOR SELECT
  USING (public.is_admin());

-- Admins actualizan el estado de cualquier pedido
DROP POLICY IF EXISTS "Admins actualizan pedidos" ON public.pedidos;
CREATE POLICY "Admins actualizan pedidos"
  ON public.pedidos FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins ven los items de todos los pedidos
DROP POLICY IF EXISTS "Admins ven los items de todos los pedidos" ON public.pedido_items;
CREATE POLICY "Admins ven los items de todos los pedidos"
  ON public.pedido_items FOR SELECT
  USING (public.is_admin());

NOTIFY pgrst, 'reload schema';


-- ==================================================
-- ARCHIVO: 20260808000000_agenda_produccion.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- Agenda de producciÃ³n + anti-duplicaciÃ³n de solicitudes
-- ----------------------------------------------------------
-- 1) cotizaciones: soportar proyectos personalizados
--    (ademÃ¡s de catering) para que el flujo "personalizar"
--    tambiÃ©n emita cotizaciÃ³n y llegue a pedidos.
-- 2) pedidos: fecha/hora/tipo de entrega para programar
--    la agenda de producciÃ³n.
-- 3) Estados terminales 'finalizado' en cotizaciones_catering
--    y proyectos_personalizados: al confirmarse el pago la
--    solicitud origen se archiva y deja de listarse.
-- ==========================================================

-- 1) cotizaciones: enlace opcional a un proyecto personalizado
ALTER TABLE public.cotizaciones
  ADD COLUMN IF NOT EXISTS proyecto_id UUID REFERENCES public.proyectos_personalizados(id) ON DELETE SET NULL;

-- 2) pedidos: agenda de producciÃ³n
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS fecha_entrega DATE,
  ADD COLUMN IF NOT EXISTS hora_entrega TIME,
  ADD COLUMN IF NOT EXISTS tipo_entrega TEXT;

-- Backfill de fecha_entrega desde la cotizaciÃ³n vinculada
UPDATE public.pedidos p
SET fecha_entrega = c.fecha_evento,
    tipo_entrega = CASE
      WHEN c.proyecto_id IS NOT NULL THEN (
        SELECT pr.tipo_entrega FROM public.proyectos_personalizados pr WHERE pr.id = c.proyecto_id
      )
      ELSE NULL
    END
FROM public.cotizaciones c
WHERE p.cotizacion_id = c.id
  AND p.fecha_entrega IS NULL;

CREATE INDEX IF NOT EXISTS idx_pedidos_fecha_entrega
  ON public.pedidos (fecha_entrega);

-- 3) cotizaciones_catering: estado terminal 'finalizado'
ALTER TABLE public.cotizaciones_catering
  DROP CONSTRAINT IF EXISTS cotizaciones_catering_estado_check;

ALTER TABLE public.cotizaciones_catering
  ADD CONSTRAINT cotizaciones_catering_estado_check
  CHECK (estado IN ('pendiente', 'cotizado', 'aceptado', 'rechazado', 'finalizado'));

-- 4) proyectos_personalizados: estado terminal 'finalizado'
ALTER TABLE public.proyectos_personalizados
  DROP CONSTRAINT IF EXISTS proyectos_estado_check;

ALTER TABLE public.proyectos_personalizados
  ADD CONSTRAINT proyectos_estado_check
  CHECK (estado IN ('pendiente', 'cotizacion_enviada', 'aprobado', 'entregado', 'anulado', 'finalizado'));

NOTIFY pgrst, 'reload schema';


-- ==================================================
-- ARCHIVO: 20260809000000_catalogo_mostrar_en.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- Mostrar catÃ¡logos en pÃ¡ginas pÃºblicas
-- ----------------------------------------------------------
-- AÃ±ade columnas booleanas a catalogo_personalizacion para
-- controlar la visibilidad de los catÃ¡logos en cada Ã¡rea
-- pÃºblica/productos del admin.
-- ==========================================================

ALTER TABLE public.catalogo_personalizacion
  ADD COLUMN IF NOT EXISTS mostrar_en_productos BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mostrar_en_categorias BOOLEAN NOT NULL DEFAULT false;

-- Por defecto, los catÃ¡logos existentes que son de celebraciÃ³n
-- se muestran en la pÃ¡gina principal (manteniendo el behavior
-- anterior al filtro activo=true+celebration).
UPDATE public.catalogo_personalizacion
SET mostrar_en_categorias = true
WHERE tipo = 'celebration' AND activo = true;

NOTIFY pgrst, 'reload schema';


-- ==================================================
-- ARCHIVO: 20260809010000_catalogo_imagenes_portada.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- Foto de portada por catÃ¡logo
-- ----------------------------------------------------------
-- AÃ±ade la columna es_portada a catalogo_imagenes para que el
-- admin marque quÃ© foto representa al catÃ¡logo en el Ã¡rea de
-- "Explora nuestras categorÃ­as" de la pÃ¡gina principal.
-- ==========================================================

ALTER TABLE public.catalogo_imagenes
  ADD COLUMN IF NOT EXISTS es_portada BOOLEAN NOT NULL DEFAULT false;

-- Backfill: la primera imagen (menor orden) de cada catÃ¡logo de
-- celebraciÃ³n queda como portada por defecto.
WITH first_images AS (
  SELECT DISTINCT ON (catalogo_id)
    catalogo_id,
    id
  FROM public.catalogo_imagenes
  WHERE catalogo_id IN (
    SELECT id FROM public.catalogo_personalizacion
    WHERE tipo = 'celebration' AND activo = true
  )
  ORDER BY catalogo_id, orden ASC, id ASC
)
UPDATE public.catalogo_imagenes
SET es_portada = true
FROM first_images
WHERE public.catalogo_imagenes.id = first_images.id;

NOTIFY pgrst, 'reload schema';


-- ==================================================
-- ARCHIVO: 20260814000000_scalability_indexes.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- Escalabilidad: Ã­ndices faltantes para soportar gran volumen
-- de pedidos, clientes, productos y carritos.
--
-- Todos los Ã­ndices son NO UNIQUE y CONCURRENTLY-friendly:
-- se usan IF NOT EXISTS para que la migraciÃ³n sea idempotente.
-- ==========================================================

-- --------------------------------------------------------
-- pedidos: columnas mÃ¡s usadas en filtros/orden/JOINS
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id
  ON public.pedidos (cliente_id);

CREATE INDEX IF NOT EXISTS idx_pedidos_estado
  ON public.pedidos (estado);

CREATE INDEX IF NOT EXISTS idx_pedidos_estado_pago
  ON public.pedidos (estado_pago);

CREATE INDEX IF NOT EXISTS idx_pedidos_created_at
  ON public.pedidos (created_at DESC);

-- Concatenado: dashboard filtra estado + ordena por created_at
CREATE INDEX IF NOT EXISTS idx_pedidos_estado_created_at
  ON public.pedidos (estado, created_at DESC);

-- --------------------------------------------------------
-- pedido_items: JOIN FK a pedidos (todo listado de admin)
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido_id
  ON public.pedido_items (pedido_id);

CREATE INDEX IF NOT EXISTS idx_pedido_items_producto_id
  ON public.pedido_items (producto_id);

-- --------------------------------------------------------
-- carrito / carrito_items: alta frecuencia por cliente_id y carrito_id
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_carrito_cliente_id
  ON public.carrito (cliente_id);

CREATE INDEX IF NOT EXISTS idx_carrito_items_carrito_id
  ON public.carrito_items (carrito_id);

-- BÃºsqueda de "item existente" en addToCart: .eq("carrito_id").eq("producto_id").maybeSingle()
-- Composite UNIQUE evita duplicados incluso ante concurrencia y sirve como Ã­ndice cubridor.
-- Nota: si_existe duplicates previos, la migraciÃ³n lanzarÃ¡ error; en ese caso, ejecutar
-- un cleanup previo (DELETE duplicados por carrito_id+producto_id+cotizacion_id).
CREATE UNIQUE INDEX IF NOT EXISTS uq_carrito_items_carrito_producto_cotizacion
  ON public.carrito_items (carrito_id, producto_id, cotizacion_id);

CREATE INDEX IF NOT EXISTS idx_carrito_items_producto_id
  ON public.carrito_items (producto_id);

-- --------------------------------------------------------
-- clientes: lookup por user_id ya suele tener UNIQUE, pero
-- admin filtra por rol/activo; aÃ±adimos Ã­ndices parciales
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_clientes_rol_activo
  ON public.clientes (rol) WHERE activo = true;

-- --------------------------------------------------------
-- productos: filtros del storefront y admin
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_productos_slug
  ON public.productos (slug);

CREATE INDEX IF NOT EXISTS idx_productos_estado
  ON public.productos (estado);

CREATE INDEX IF NOT EXISTS idx_productos_catalogo_id
  ON public.productos (catalogo_id);

-- CatÃ¡logo pÃºblico: WHERE estado='publicado' AND catalogo_id=...
CREATE INDEX IF NOT EXISTS idx_productos_catalogo_estado
  ON public.productos (catalogo_id, estado);

CREATE INDEX IF NOT EXISTS idx_productos_destacado
  ON public.productos (destacado) WHERE destacado = true;

CREATE INDEX IF NOT EXISTS idx_productos_mas_vendido
  ON public.productos (mas_vendido) WHERE mas_vendido = true;

-- --------------------------------------------------------
-- producto_imagenes: FK a producto (listado de galerÃ­a)
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_producto_imagenes_producto_id
  ON public.producto_imagenes (producto_id);

-- --------------------------------------------------------
-- cotizaciones: lookup por proyecto/catering
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_cotizaciones_proyecto_id
  ON public.cotizaciones (proyecto_id);

CREATE INDEX IF NOT EXISTS idx_cotizaciones_catering_id
  ON public.cotizaciones (catering_id);

-- (token ya tiene UNIQUE que crea Ã­ndice automÃ¡tico)

-- --------------------------------------------------------
-- cotizaciones_catering: lookup por proyecto_id
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_cotizaciones_catering_proyecto_id
  ON public.cotizaciones_catering (proyecto_id);

CREATE INDEX IF NOT EXISTS idx_cotizaciones_catering_estado
  ON public.cotizaciones_catering (estado);

-- --------------------------------------------------------
-- proyectos_personalizados: filtros admin por estado
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_proyectos_estado_created_at
  ON public.proyectos_personalizados (estado, created_at DESC);

-- --------------------------------------------------------
-- contactos: leido/created_at para panel admin
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_contactos_created_at
  ON public.contactos (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contactos_leido
  ON public.contactos (leido) WHERE leido = false;

-- --------------------------------------------------------
-- media: orden por created_at en el admin gallery
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_media_created_at
  ON public.media (created_at DESC);

NOTIFY pgrst, 'reload schema';


-- ==================================================
-- ARCHIVO: 20260814010000_create_order_rpc.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- Escalabilidad + consistencia: creaciÃ³n atÃ³mica de pedidos
-- + idempotencia de webhooks de pago.
--
-- 1) Tabla `pago_webhooks`: registra notificaciones de pago
--    (MercadoPago/Culqi) y permite procesar cada evento una
--    sola vez (clave Ãºnica `external_reference`).
--
-- 2) FunciÃ³n `create_order(p_payload jsonb)` PL/pgSQL: inserta
--    pedidos + pedido_items + elimina carrito_items consumidos
--    + archiva la solicitud origen (cotizacion/catering/proyecto)
--    en una sola transacciÃ³n, con idempotencia por
--    `idempotency_key` y por `payment_reference`.
-- ==========================================================

-- --------------------------------------------------------
-- 1) Tabla de webhooks de pago (idempotencia)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pago_webhooks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  procesado       BOOLEAN NOT NULL DEFAULT false,
  fuente          TEXT NOT NULL,                      -- 'mercadopago' | 'culqi'
  external_reference TEXT,                            -- id de pago del proveedor
  topic           TEXT,                               -- 'payment' | 'merchant_order'
  payment_id      TEXT,                               -- id del pago en MP
  status          TEXT,                               -- status retornado por la API
  raw             JSONB,                              -- payload completo
  pedido_id       UUID REFERENCES public.pedidos(id) ON DELETE SET NULL,
  CONSTRAINT uq_pago_webhooks_fuente_external UNIQUE (fuente, external_reference)
);

CREATE INDEX IF NOT EXISTS idx_pago_webhooks_procesado
  ON public.pago_webhooks (procesado) WHERE procesado = false;

CREATE INDEX IF NOT EXISTS idx_pago_webhooks_pedido_id
  ON public.pago_webhooks (pedido_id);

-- RLS: solo service_role puede leer/escribir (es admin-only).
ALTER TABLE public.pago_webhooks ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- 2) FunciÃ³n create_order atÃ³mica
-- --------------------------------------------------------
-- Acepta un JSON con:
--   cliente_id, subtotal, envio, total,
--   metodo_pago, referencia_pago, estado_pago, tipo_pago, monto_pagado,
--   cotizacion_id, fecha_entrega, hora_entrega, tipo_entrega,
--   idempotency_key (opcional),
--   items: [{ carrito_item_id, producto_id, cantidad, precio,
--            nombre, descripcion, imagen }]
--
-- Devuelve: { pedido_id uuid, numero int, estado text, subtotal, envio, total }
-- ==========================================================

CREATE OR REPLACE FUNCTION public.create_order(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cliente_id       UUID        := (p_payload->>'cliente_id')::uuid;
  v_subtotal         NUMERIC(12,2) := COALESCE((p_payload->>'subtotal')::numeric, 0);
  v_envio            NUMERIC(12,2) := COALESCE((p_payload->>'envio')::numeric, 0);
  v_total            NUMERIC(12,2) := COALESCE((p_payload->>'total')::numeric, 0);
  v_metodo_pago      TEXT        := p_payload->>'metodo_pago';
  v_referencia_pago  TEXT        := p_payload->>'referencia_pago';
  v_estado_pago      TEXT        := COALESCE(p_payload->>'estado_pago', 'pendiente');
  v_tipo_pago        TEXT        := p_payload->>'tipo_pago';
  v_monto_pagado     NUMERIC(12,2) := (p_payload->>'monto_pagado')::numeric;
  v_cotizacion_id    UUID        := NULLIF(p_payload->>'cotizacion_id','')::uuid;
  v_fecha_entrega    DATE        := NULLIF(p_payload->>'fecha_entrega','')::date;
  v_hora_entrega     TIME        := NULLIF(p_payload->>'hora_entrega','')::time;
  v_tipo_entrega     TEXT        := NULLIF(p_payload->>'tipo_entrega','');
  v_idem_key         TEXT        := NULLIF(p_payload->>'idempotency_key','');

  v_items            JSONB       := p_payload->'items';
  v_pedido_id        UUID;
  v_numero           INTEGER;
  v_carrito_ids      UUID[]      := ARRAY[]::UUID[];
  v_existing         UUID;
  v_cat_catering_id  UUID;
  v_cat_proyecto_id  UUID;
  v_proy_hora        TIME;
  v_proy_tipo        TEXT;
BEGIN
  -- ==========================================================
  -- Idempotencia 1: por idempotency_key (cliente re-envÃ­a)
  -- ==========================================================
  IF v_idem_key IS NOT NULL THEN
    SELECT id INTO v_existing
      FROM public.pedidos
      WHERE referencia_pago = v_idem_key
        AND metodo_pago = v_metodo_pago
      LIMIT 1;

    IF v_existing IS NOT NULL THEN
      RETURN jsonb_build_object(
        'pedido_id', v_existing,
        'already_exists', true,
        'message', 'Pedido ya creado previamente.'
      );
    END IF;
  END IF;

  -- ==========================================================
  -- Validaciones bÃ¡sicas
  -- ==========================================================
  IF v_cliente_id IS NULL THEN
    RAISE EXCEPTION 'cliente_id es obligatorio';
  END IF;

  IF v_items IS NULL OR jsonb_array_length(v_items) = 0 THEN
    RAISE EXCEPTION 'El carrito estÃ¡ vacÃ­o.';
  END IF;

  -- ==========================================================
  -- Si hay cotizaciÃ³n vinculada, leer datos de entrega si no
  -- llegaron en el payload (fallback a los de la cotizaciÃ³n).
  -- ==========================================================
  IF v_cotizacion_id IS NOT NULL AND v_fecha_entrega IS NULL THEN
    SELECT c.fecha_evento, c.catering_id, c.proyecto_id
      INTO v_fecha_entrega, v_cat_catering_id, v_cat_proyecto_id
      FROM public.cotizaciones c
      WHERE c.id = v_cotizacion_id
      LIMIT 1;

    IF v_cat_proyecto_id IS NOT NULL AND v_hora_entrega IS NULL THEN
      SELECT p.hora_evento, p.tipo_entrega
        INTO v_proy_hora, v_proy_tipo
        FROM public.proyectos_personalizados p
        WHERE p.id = v_cat_proyecto_id
        LIMIT 1;

      v_hora_entrega := COALESCE(v_hora_entrega, v_proy_hora);
      v_tipo_entrega := COALESCE(v_tipo_entrega, v_proy_tipo);
    END IF;
  END IF;

  -- ==========================================================
  -- INSERT pedido (the .single())
  -- ==========================================================
  INSERT INTO public.pedidos (
    cliente_id, subtotal, envio, total,
    metodo_pago, referencia_pago, estado_pago,
    tipo_pago, monto_pagado,
    cotizacion_id,
    fecha_entrega, hora_entrega, tipo_entrega,
    estado
  ) VALUES (
    v_cliente_id, v_subtotal, v_envio, v_total,
    v_metodo_pago, COALESCE(v_referencia_pago, v_idem_key), v_estado_pago,
    v_tipo_pago,  v_monto_pagado,
    v_cotizacion_id,
    v_fecha_entrega, v_hora_entrega, v_tipo_entrega,
    'pendiente'
  )
  RETURNING id, numero INTO v_pedido_id, v_numero;

  -- ==========================================================
  -- INSERT pedido_items (batch insert)
  -- ==========================================================
  INSERT INTO public.pedido_items (
    pedido_id, producto_id, cantidad, precio,
    nombre, descripcion, imagen
  )
  SELECT
    v_pedido_id,
    NULLIF(el->>'producto_id','')::uuid,
    (el->>'cantidad')::integer,
    (el->>'precio')::numeric,
    el->>'nombre',
    el->>'descripcion',
    el->>'imagen'
  FROM jsonb_array_elements(v_items) AS el;

  -- ==========================================================
  -- Recolectar y eliminar los carrito_items consumidos
  -- ==========================================================
  SELECT array_agg(NULLIF(el->>'carrito_item_id','')::uuid) FILTER
         (WHERE el->>'carrito_item_id' IS NOT NULL)
    INTO v_carrito_ids
    FROM jsonb_array_elements(v_items) AS el;

  IF v_carrito_ids IS NOT NULL AND array_length(v_carrito_ids, 1) > 0 THEN
    DELETE FROM public.carrito_items
      WHERE id = ANY(v_carrito_ids);
  END IF;

  -- ==========================================================
  -- Archivar la solicitud origen solo si el pedido quedÃ³ pagado
  -- ==========================================================
  -- Archivar requiere leer nuevamente los ids si no vinieron por payload.
  IF v_cotizacion_id IS NOT NULL
     AND v_cat_catering_id IS NULL
     AND v_cat_proyecto_id IS NULL THEN
    SELECT c.catering_id, c.proyecto_id
      INTO v_cat_catering_id, v_cat_proyecto_id
      FROM public.cotizaciones c
      WHERE c.id = v_cotizacion_id
      LIMIT 1;
  END IF;

  IF v_cotizacion_id IS NOT NULL AND v_estado_pago = 'pagado' THEN
    -- catering
    IF v_cat_catering_id IS NOT NULL THEN
      UPDATE public.cotizaciones_catering
        SET estado = 'finalizado'
        WHERE id = v_cat_catering_id;
    END IF;

    -- proyecto personalizado
    IF v_cat_proyecto_id IS NOT NULL THEN
      UPDATE public.proyectos_personalizados
        SET estado = 'finalizado'
        WHERE id = v_cat_proyecto_id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'pedido_id', v_pedido_id,
    'numero', v_numero,
    'estado', 'pendiente',
    'estado_pago', v_estado_pago,
    'subtotal', v_subtotal,
    'envio', v_envio,
    'total', v_total,
    'already_exists', false
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'create_order failed: %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;

-- Permisos: solo service_role puede ejecutarla (los Server
-- Actions la invocan vÃ­a createAdminClient). El usuario anon
-- nunca debe invocarla directamente.
REVOKE EXECUTE ON FUNCTION public.create_order(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order(jsonb) TO service_role;

NOTIFY pgrst, 'reload schema';


-- ==================================================
-- ARCHIVO: 20260814020000_dashboard_stats_rpc.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- Dashboard: funciÃ³n para obtener el total de ventas sin
-- transferir todas las filas `pedidos.total` al cliente.
-- ==========================================================

CREATE OR REPLACE FUNCTION public.dashboard_stats()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'pedidos_total',          (SELECT COUNT(*) FROM public.pedidos),
    'productos_total',        (SELECT COUNT(*) FROM public.productos),
    'clientes_total',         (SELECT COUNT(*) FROM public.clientes),
    'proyectos_total',        (SELECT COUNT(*) FROM public.proyectos_personalizados),
    'ventas_total',           (SELECT COALESCE(SUM(total), 0) FROM public.pedidos WHERE estado_pago = 'pagado'),
    'pedidos_pendientes',    (SELECT COUNT(*) FROM public.pedidos WHERE estado = 'pendiente'),
    'productos_activos',     (SELECT COUNT(*) FROM public.productos WHERE estado = 'activo'),
    'clientes_activos',      (SELECT COUNT(*) FROM public.clientes WHERE activo = true),
    'proyectos_pendientes',  (SELECT COUNT(*) FROM public.proyectos_personalizados WHERE estado = 'pendiente')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.dashboard_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.dashboard_stats() TO authenticated, service_role;

NOTIFY pgrst, 'reload schema';


-- ==================================================
-- ARCHIVO: 20260815000000_tienda_config.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- ConfiguraciÃ³n general de la tienda (marketing digital).
--
-- Tabla `tienda_config`: key-value JSONB. Una fila por secciÃ³n
-- lÃ³gica (tienda, contacto, marketing, seo, pixeles, notif).
-- El admin actualiza vÃ­a Server Action; el storefront lee
-- la secciÃ³n pÃºblica que necesita en cada render.
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.tienda_config (
  seccion      TEXT PRIMARY KEY,
  data         JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by   UUID
);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tienda_config_updated ON public.tienda_config;
CREATE TRIGGER trg_tienda_config_updated
  BEFORE UPDATE ON public.tienda_config
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------------
-- Seed con valores por defecto (seeds idempotentes)
-- -------------------------------------------------------------
INSERT INTO public.tienda_config (seccion, data) VALUES
  (
    'tienda',
    '{
      "nombre": "Kelly''s Cake",
      "tagline": "Pasteles personalizados de alta costura",
      "descripcion": "Creamos pasteles artesanales personalizados para bodas, cumpleaÃ±os y ocasiones especiales. DiseÃ±os Ãºnicos, ingredientes premium.",
      "moneda": "PEN",
      "simbolo": "S/",
      "zona_cobertura": "Arequipa metropolitana y alrededores",
      "logo_url": null
    }'::jsonb
  ),
  (
    'contacto',
    '{
      "telefono": "",
      "whatsapp": "",
      "email": "",
      "direccion": "",
      "maps_url": "",
      "horario_lunes_viernes": "09:00 - 19:00",
      "horario_sabado": "10:00 - 14:00",
      "horario_domingo": "Cerrado",
      "instagram": "",
      "facebook": "",
      "tiktok": "",
      "youtube": "",
      "whatsapp_activo": false,
      "whatsapp_mensaje": "Hola, vengo de la web. Â¿Me podrÃ­as ayudar con un pastel personalizado?"
    }'::jsonb
  ),
  (
    'marketing',
    '{
      "banner_activo": false,
      "banner_titulo": "",
      "banner_texto": "",
      "banner_color": "#D8B07A",
      "banner_link": "",
      "envio_gratis_umbral": null,
      "mostrar_testimonios": true,
      "carrito_abandonado_minutos": null,
      "carrito_abandonado_mensaje": ""
    }'::jsonb
  ),
  (
    'seo',
    '{
      "title": "Kelly''s Cake | Pasteles Personalizados de Alta Costura",
      "description": "Creamos pasteles artesanales personalizados para bodas, cumpleaÃ±os y ocasiones especiales. DiseÃ±os Ãºnicos, ingredientes premium.",
      "keywords": "",
      "og_image_url": null,
      "google_site_verification": null
    }'::jsonb
  ),
  (
    'pixeles',
    '{
      "ga4_id": null,
      "gtm_id": null,
      "meta_pixel_id": null,
      "tiktok_pixel_id": null,
      "google_ads_id": null,
      "conversao_google_ads_id": null
    }'::jsonb
  ),
  (
    'notificaciones',
    '{
      "notificar_pedido_email_admin": true,
      "email_admin": "",
      "notificar_pedido_whatsapp_admin": false,
      "whatsapp_admin": "",
      "confirmacion_cliente_asunto": "Confirmamos tu pedido - Kelly''s Cake",
      "confirmacion_cliente_cuerpo": "Gracias por tu pedido. Nos pondremos en contacto para coordinar los detalles.",
      "recordatorio_cliente_asunto": "Tu pedido estÃ¡ listo para recojo",
      "recordatorio_cliente_cuerpo": "Tu pedido ya estÃ¡ listo. Te esperamos en tienda."
    }'::jsonb
  )
ON CONFLICT (seccion) DO NOTHING;

-- -------------------------------------------------------------
-- RLS: solo admins (rol admin en clientes) pueden leer y escribir.
-- Lectura pÃºblica la hace el service_role desde el storefront.
-- -------------------------------------------------------------
ALTER TABLE public.tienda_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins leen tienda_config" ON public.tienda_config;
CREATE POLICY "Admins leen tienda_config"
  ON public.tienda_config FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins actualizan tienda_config" ON public.tienda_config;
CREATE POLICY "Admins actualizan tienda_config"
  ON public.tienda_config FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins insertan tienda_config" ON public.tienda_config;
CREATE POLICY "Admins insertan tienda_config"
  ON public.tienda_config FOR INSERT
  WITH CHECK (public.is_admin());

-- Lectura pÃºblica (storefront) para secciones no sensibles.
-- Leemos las secciones explÃ­citamente pÃºblicas para no exponer
-- configuraciÃ³n interna (notificaciones admin, emails). Los IDs
-- de pÃ­xeles sÃ­ van visibles en HTML en cualquier sitio web.
DROP POLICY IF EXISTS "Publico lee configuracion publica" ON public.tienda_config;
CREATE POLICY "Publico lee configuracion publica"
  ON public.tienda_config FOR SELECT
  USING (
    seccion IN ('tienda','contacto','marketing','seo','pixeles')
  );

-- -------------------------------------------------------------
-- Privilegios explÃ­citos (en este proyecto los roles no heredan
-- privilegios por defecto sobre tablas nuevas).
-- -------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tienda_config TO service_role;
GRANT SELECT ON public.tienda_config TO anon, authenticated;

NOTIFY pgrst, 'reload schema';


-- ==================================================
-- ARCHIVO: 20260819000000_producto_precio_cantidad.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- Tabla de precios por cantidad para productos coffee_break
-- ----------------------------------------------------------
-- Permite definir tiers de precios: 25 und â†’ S/. X, 50 und â†’ S/. Y, etc.
-- El usuario ve el precio mÃ­nimo en la foto y puede desplegar
-- una lista con todas las relaciones cantidad â†’ precio.
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.producto_precio_cantidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  cantidad_minima INT NOT NULL,
  precio NUMERIC(10,2) NOT NULL,
  orden INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(producto_id, cantidad_minima)
);

-- Ãndices
CREATE INDEX IF NOT EXISTS idx_producto_precio_cantidad_producto
  ON public.producto_precio_cantidad(producto_id);

-- Permisos
GRANT ALL ON public.producto_precio_cantidad TO service_role;
GRANT SELECT ON public.producto_precio_cantidad TO anon;
GRANT SELECT ON public.producto_precio_cantidad TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- RLS
ALTER TABLE public.producto_precio_cantidad ENABLE ROW LEVEL SECURITY;

-- Admin full access
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access on producto_precio_cantidad') THEN
    CREATE POLICY "Admin full access on producto_precio_cantidad"
      ON public.producto_precio_cantidad
      FOR ALL
      USING (public.is_admin());
  END IF;
END $$;

-- Lectura pÃºblica
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read producto_precio_cantidad') THEN
    CREATE POLICY "Public read producto_precio_cantidad"
      ON public.producto_precio_cantidad
      FOR SELECT
      USING (true);
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';


-- ==================================================
-- ARCHIVO: 20260820000000_fix_presentaciones_y_tiers.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- Fix: acceso a producto_presentaciones y creaciÃ³n de
-- producto_precio_cantidad (tiers de precio por cantidad)
-- ----------------------------------------------------------
-- SÃ­ntomas que corrige:
--   1) "permission denied for table producto_presentaciones"
--      â†’ faltaban GRANTs y polÃ­ticas RLS.
--   2) "Could not find the table producto_precio_cantidad"
--      â†’ la tabla no existÃ­a en la BD.
-- ==========================================================

-- ==========================================================
-- 1) PRODUCTO_PRESENTACIONES
-- ==========================================================

-- Default de activo = true (el admin no siempre lo envÃ­a al insertar)
ALTER TABLE public.producto_presentaciones
  ALTER COLUMN activo SET DEFAULT true;

-- Permisos
GRANT SELECT ON public.producto_presentaciones TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.producto_presentaciones TO authenticated;
GRANT ALL ON public.producto_presentaciones TO service_role;

-- RLS
ALTER TABLE public.producto_presentaciones ENABLE ROW LEVEL SECURITY;

-- Lectura pÃºblica (la tienda filtra activo=false en la app)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Public read producto_presentaciones'
  ) THEN
    CREATE POLICY "Public read producto_presentaciones"
      ON public.producto_presentaciones
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Admin full access (mismo criterio que el resto de tablas del admin)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Admin full access on producto_presentaciones'
  ) THEN
    CREATE POLICY "Admin full access on producto_presentaciones"
      ON public.producto_presentaciones
      FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- ==========================================================
-- 2) PRODUCTO_PRECIO_CANTIDAD (tiers: 25 und â†’ S/. X)
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.producto_precio_cantidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  cantidad_minima INT NOT NULL,
  precio NUMERIC(10,2) NOT NULL,
  orden INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(producto_id, cantidad_minima)
);

CREATE INDEX IF NOT EXISTS idx_producto_precio_cantidad_producto
  ON public.producto_precio_cantidad(producto_id);

GRANT ALL ON public.producto_precio_cantidad TO service_role;
GRANT SELECT ON public.producto_precio_cantidad TO anon;
GRANT SELECT ON public.producto_precio_cantidad TO authenticated;

ALTER TABLE public.producto_precio_cantidad ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Admin full access on producto_precio_cantidad'
  ) THEN
    CREATE POLICY "Admin full access on producto_precio_cantidad"
      ON public.producto_precio_cantidad
      FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Public read producto_precio_cantidad'
  ) THEN
    CREATE POLICY "Public read producto_precio_cantidad"
      ON public.producto_precio_cantidad
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Recargar schema para PostgREST
NOTIFY pgrst, 'reload schema';


-- ==================================================
-- ARCHIVO: 20260820010000_carrito_items_presentacion.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- Carrito: soporte de presentaciones seleccionables
-- ==========================================================

ALTER TABLE public.carrito_items
  ADD COLUMN IF NOT EXISTS presentacion_id UUID
  REFERENCES public.producto_presentaciones(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_carrito_items_presentacion
  ON public.carrito_items(presentacion_id);

NOTIFY pgrst, 'reload schema';


-- ==================================================
-- ARCHIVO: 20260820020000_caja_personalizada.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- "Arma tu caja de bocaditos"
-- ----------------------------------------------------------
-- Crea un producto contenedor OCULTO de la tienda (estado
-- 'borrador') cuyas PRESENTACIONES definen los tamaÃ±os y
-- precios de la caja personalizada. El admin puede editar
-- tamaÃ±os/precios desde la pestaÃ±a Presentaciones del admin.
-- ==========================================================

DO $$
DECLARE
  v_producto_id UUID;
  v_catalogo_id UUID;
BEGIN
  -- Primer catÃ¡logo coffee_break activo (para cumplir la FK)
  SELECT id INTO v_catalogo_id
    FROM public.catalogo_personalizacion
    WHERE tipo = 'coffee_break' AND activo = true
    ORDER BY orden
    LIMIT 1;

  IF v_catalogo_id IS NULL THEN
    RAISE NOTICE 'No hay catÃ¡logo coffee_break activo; no se creÃ³ la caja.';
    RETURN;
  END IF;

  SELECT id INTO v_producto_id
    FROM public.productos
    WHERE slug = 'caja-personalizada'
    LIMIT 1;

  IF v_producto_id IS NULL THEN
    INSERT INTO public.productos (
      nombre, slug,
      descripcion_corta, descripcion,
      precio, catalogo_id, estado, disponible, mas_vendido
    ) VALUES (
      'Caja de bocaditos personalizada',
      'caja-personalizada',
      'Arma tu caja eligiendo tamaÃ±o y sabores.',
      'Caja personalizada de bocaditos dulces y salados. Elige el tamaÃ±o y distribuye las unidades entre tus sabores favoritos.',
      NULL, v_catalogo_id, 'borrador', true, false
    )
    RETURNING id INTO v_producto_id;

    -- TamaÃ±os iniciales (editables desde el admin)
    INSERT INTO public.producto_presentaciones (
      producto_id, nombre, precio, orden, activo, predeterminada
    ) VALUES
      (v_producto_id, '25 und',  40.00, 1, true, false),
      (v_producto_id, '50 und',  75.00, 2, true, false),
      (v_producto_id, '100 und', 140.00, 3, true, false);

    RAISE NOTICE 'Producto caja-personalizada creado con 3 presentaciones.';
  ELSE
    RAISE NOTICE 'El producto caja-personalizada ya existe.';
  END IF;
END $$;


-- ==================================================
-- ARCHIVO: 20260820030000_libro_reclamaciones.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- Libro de Reclamaciones (Ley 29571 / D.S. 011-2011-PCM)
-- ----------------------------------------------------------
-- Escritura pÃºblica (formulario anÃ³nimo), lectura/gestiÃ³n solo
-- desde el servidor con service_role (panel admin).
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.libro_reclamaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT UNIQUE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('reclamo', 'queja')),
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  tipo_documento TEXT NOT NULL CHECK (tipo_documento IN ('dni', 'ce', 'pasaporte', 'ruc')),
  numero_documento TEXT NOT NULL,
  direccion TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  producto_servicio TEXT NOT NULL,
  monto_reclamado NUMERIC(10, 2) NOT NULL DEFAULT 0,
  fecha_compra DATE,
  descripcion TEXT NOT NULL,
  peticion TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'resuelto')),
  respuesta TEXT,
  respondido_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.libro_reclamaciones ENABLE ROW LEVEL SECURITY;

-- Cualquier visitante puede registrar una solicitud...
CREATE POLICY "publico_puede_registrar"
  ON public.libro_reclamaciones
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ...pero nadie (salvo service_role) puede leerlas ni modificarlas.
GRANT INSERT ON public.libro_reclamaciones TO anon, authenticated;


-- ==================================================
-- ARCHIVO: 20260826000000_caja_6_12_18_24.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake â€” "Arma tu caja": producto contenedor
-- ----------------------------------------------------------
-- Crea el producto caja-personalizada (idempotente) con
-- presentaciones de 6 / 12 / 18 / 24 unidades. No depende de
-- un catÃ¡logo coffee_break activo (catalogo_id = NULL).
-- El admin puede editar nombres/precios desde el panel admin
-- (pestaÃ±a Presentaciones del producto).
-- ==========================================================

DO $$
DECLARE
  v_producto_id UUID;
BEGIN
  SELECT id INTO v_producto_id
    FROM public.productos
    WHERE slug = 'caja-personalizada'
    LIMIT 1;

  IF v_producto_id IS NULL THEN
    INSERT INTO public.productos (
      nombre, slug,
      descripcion_corta, descripcion,
      precio, catalogo_id, estado, disponible, mas_vendido
    ) VALUES (
      'Caja de bocaditos personalizada',
      'caja-personalizada',
      'Arma tu caja eligiendo tamaÃ±o y sabores.',
      'Caja personalizada de bocaditos dulces y salados. Elige el tamaÃ±o y distribuye las unidades entre tus sabores favoritos.',
      NULL, NULL, 'borrador', true, false
    )
    RETURNING id INTO v_producto_id;

    INSERT INTO public.producto_presentaciones (
      producto_id, nombre, precio, orden, activo, predeterminada
    ) VALUES
      (v_producto_id, '6 und',   12.00, 1, true, false),
      (v_producto_id, '12 und',  22.00, 2, true, false),
      (v_producto_id, '18 und',  32.00, 3, true, false),
      (v_producto_id, '24 und',  42.00, 4, true, false);

    RAISE NOTICE 'Caja creada con 4 presentaciones (6/12/18/24).';
  ELSE
    -- Si el producto ya existe, eliminar presentaciones anteriores
    -- y recrear con los nuevos tamaÃ±os (para reemplazar 25/50/100)
    DELETE FROM public.producto_presentaciones
      WHERE producto_id = v_producto_id
        AND nombre IN ('25 und','50 und','100 und');

    INSERT INTO public.producto_presentaciones (
      producto_id, nombre, precio, orden, activo, predeterminada
    )
    SELECT v_producto_id, n.nombre, n.precio, n.orden, true, false
    FROM (
      VALUES
        ('6 und',   12.00, 1),
        ('12 und',  22.00, 2),
        ('18 und',  32.00, 3),
        ('24 und',  42.00, 4)
    ) AS n(nombre, precio, orden)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.producto_presentaciones
      WHERE producto_id = v_producto_id AND nombre = n.nombre
    );

    RAISE NOTICE 'Presentaciones de la caja actualizadas a 6/12/18/24.';
  END IF;
END $$;


-- ==================================================
-- ARCHIVO: 20260905000000_rewards_fidelizacion.sql
-- ==================================================
-- ==========================================================
-- REWARDS Y FIDELIZACIÃ“N
-- ==========================================================

-- ==========================================================
-- 1. Table `rewards_niveles`
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.rewards_niveles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  emoji TEXT NOT NULL DEFAULT 'ðŸŒ±',
  puntos_minimos INTEGER NOT NULL DEFAULT 0,
  descuento_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  delivery_gratis_umbral NUMERIC(10,2),  -- NULL = no aplica, 0 = gratis siempre
  beneficios JSONB NOT NULL DEFAULT '[]'::jsonb,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed 4 levels
INSERT INTO public.rewards_niveles (nombre, slug, emoji, puntos_minimos, descuento_pct, delivery_gratis_umbral, beneficios, orden)
VALUES 
  ('Semilla', 'semilla', 'ðŸŒ±', 0, 0, NULL, '["Acceso a ofertas exclusivas", "Newsletter VIP"]'::jsonb, 0),
  ('Flor', 'flor', 'ðŸŒ¸', 100, 5, 150, '["5% descuento permanente", "DegustaciÃ³n gratis en pedidos +S/150", "Acceso anticipado a nuevos diseÃ±os"]'::jsonb, 1),
  ('Torta', 'torta', 'ðŸŽ‚', 300, 10, 100, '["10% descuento", "Delivery gratis en pedidos +S/100", "PersonalizaciÃ³n premium sin cargo", "AtenciÃ³n prioritaria"]'::jsonb, 2),
  ('Corona', 'corona', 'ðŸ‘‘', 600, 15, 0, '["15% descuento", "Delivery gratis siempre", "Torta sorpresa en tu cumpleaÃ±os", "InvitaciÃ³n a eventos exclusivos"]'::jsonb, 3)
ON CONFLICT (slug) DO NOTHING;

-- ==========================================================
-- 2. Table `rewards_puntos`
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.rewards_puntos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL UNIQUE REFERENCES public.clientes(id) ON DELETE CASCADE,
  puntos_totales INTEGER NOT NULL DEFAULT 0,
  puntos_disponibles INTEGER NOT NULL DEFAULT 0,
  nivel_id UUID REFERENCES public.rewards_niveles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================================
-- 3. Table `rewards_transacciones`
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.rewards_transacciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('ganancia', 'canje')),
  cantidad INTEGER NOT NULL,
  motivo TEXT NOT NULL,
  referencia_id UUID,
  referencia_tipo TEXT,  -- 'pedido', 'resena', 'referido', 'registro', 'canje', 'bonus'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================================
-- 4. Table `referidos`
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.referidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  referido_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  codigo TEXT NOT NULL UNIQUE,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'registrado', 'completado', 'expirado')),
  recompensa_referente INTEGER NOT NULL DEFAULT 30,  -- puntos
  recompensa_referido NUMERIC(5,2) NOT NULL DEFAULT 10, -- % descuento primera compra
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completado_at TIMESTAMPTZ
);

-- ==========================================================
-- 5. Table `fechas_especiales`
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.fechas_especiales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('cumpleanos', 'aniversario_boda', 'cumpleanos_hijo', 'otro')),
  nombre_relacion TEXT,
  fecha DATE NOT NULL,
  notificado_este_ano BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================================
-- 6. RPC Function `award_points`
-- ==========================================================
CREATE OR REPLACE FUNCTION public.award_points(
  p_cliente_id UUID,
  p_cantidad INTEGER,
  p_motivo TEXT,
  p_ref_id UUID DEFAULT NULL,
  p_ref_tipo TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nuevo_total INTEGER;
  v_nuevo_disponible INTEGER;
  v_nuevo_nivel_id UUID;
  v_nivel_nombre TEXT;
BEGIN
  -- Insert or update rewards_puntos
  INSERT INTO public.rewards_puntos (cliente_id, puntos_totales, puntos_disponibles)
  VALUES (p_cliente_id, p_cantidad, p_cantidad)
  ON CONFLICT (cliente_id) DO UPDATE
  SET puntos_totales = rewards_puntos.puntos_totales + p_cantidad,
      puntos_disponibles = rewards_puntos.puntos_disponibles + p_cantidad,
      updated_at = now();

  -- Get new totals
  SELECT puntos_totales, puntos_disponibles INTO v_nuevo_total, v_nuevo_disponible
  FROM public.rewards_puntos WHERE cliente_id = p_cliente_id;

  -- Recalculate level based on total points
  SELECT id, nombre INTO v_nuevo_nivel_id, v_nivel_nombre
  FROM public.rewards_niveles
  WHERE puntos_minimos <= v_nuevo_total
  ORDER BY puntos_minimos DESC
  LIMIT 1;

  -- Update level
  UPDATE public.rewards_puntos
  SET nivel_id = v_nuevo_nivel_id
  WHERE cliente_id = p_cliente_id;

  -- Record transaction
  INSERT INTO public.rewards_transacciones (cliente_id, tipo, cantidad, motivo, referencia_id, referencia_tipo)
  VALUES (p_cliente_id, 'ganancia', p_cantidad, p_motivo, p_ref_id, p_ref_tipo);

  RETURN jsonb_build_object(
    'success', true,
    'puntos_totales', v_nuevo_total,
    'puntos_disponibles', v_nuevo_disponible,
    'nivel', v_nivel_nombre
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ==========================================================
-- 7. RPC Function `redeem_points`
-- ==========================================================
CREATE OR REPLACE FUNCTION public.redeem_points(
  p_cliente_id UUID,
  p_cantidad INTEGER,
  p_motivo TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_disponibles INTEGER;
  v_nuevo_disponible INTEGER;
BEGIN
  -- Check available points
  SELECT puntos_disponibles INTO v_disponibles
  FROM public.rewards_puntos
  WHERE cliente_id = p_cliente_id;

  IF v_disponibles IS NULL OR v_disponibles < p_cantidad THEN
    RETURN jsonb_build_object('success', false, 'error', 'Puntos insuficientes.');
  END IF;

  -- Deduct points
  UPDATE public.rewards_puntos
  SET puntos_disponibles = puntos_disponibles - p_cantidad,
      updated_at = now()
  WHERE cliente_id = p_cliente_id;

  v_nuevo_disponible := v_disponibles - p_cantidad;

  -- Record transaction
  INSERT INTO public.rewards_transacciones (cliente_id, tipo, cantidad, motivo)
  VALUES (p_cliente_id, 'canje', p_cantidad, p_motivo);

  RETURN jsonb_build_object(
    'success', true,
    'puntos_disponibles', v_nuevo_disponible
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ==========================================================
-- 8. Modify trigger `handle_new_user`
-- ==========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cliente_id UUID;
  v_nivel_semilla UUID;
BEGIN
  INSERT INTO public.clientes (user_id, nombre, apellidos, correo, celular, rol, activo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nombre', split_part(NEW.raw_user_meta_data ->> 'full_name', ' ', 1), 'Cliente'),
    COALESCE(NEW.raw_user_meta_data ->> 'apellidos', trim(both ' ' from replace(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.raw_user_meta_data ->> 'full_name', ' ', 1), ''))),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'celular', ''),
    'cliente',
    true
  )
  RETURNING id INTO v_cliente_id;

  -- Get the starting level (Semilla)
  SELECT id INTO v_nivel_semilla
  FROM public.rewards_niveles
  WHERE slug = 'semilla'
  LIMIT 1;

  -- Create rewards row with 20 welcome points
  INSERT INTO public.rewards_puntos (cliente_id, puntos_totales, puntos_disponibles, nivel_id)
  VALUES (v_cliente_id, 20, 20, v_nivel_semilla);

  -- Record the welcome bonus transaction
  INSERT INTO public.rewards_transacciones (cliente_id, tipo, cantidad, motivo, referencia_tipo)
  VALUES (v_cliente_id, 'ganancia', 20, 'Bienvenida a Kelly''s Cake ðŸŽ‚', 'registro');

  RETURN NEW;
END;
$$;

-- ==========================================================
-- 9. Indexes
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_rewards_puntos_cliente ON public.rewards_puntos (cliente_id);
CREATE INDEX IF NOT EXISTS idx_rewards_puntos_nivel ON public.rewards_puntos (nivel_id);
CREATE INDEX IF NOT EXISTS idx_rewards_transacciones_cliente ON public.rewards_transacciones (cliente_id);
CREATE INDEX IF NOT EXISTS idx_rewards_transacciones_created ON public.rewards_transacciones (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referidos_referente ON public.referidos (referente_id);
CREATE INDEX IF NOT EXISTS idx_referidos_codigo ON public.referidos (codigo);
CREATE INDEX IF NOT EXISTS idx_referidos_referido ON public.referidos (referido_id);
CREATE INDEX IF NOT EXISTS idx_fechas_especiales_cliente ON public.fechas_especiales (cliente_id);
CREATE INDEX IF NOT EXISTS idx_fechas_especiales_fecha ON public.fechas_especiales (fecha);

-- ==========================================================
-- 10. RLS
-- ==========================================================
-- Disable RLS on all new tables since auth is handled in code via getCurrentClient/getCurrentAdmin
ALTER TABLE public.rewards_niveles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards_puntos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards_transacciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.referidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fechas_especiales DISABLE ROW LEVEL SECURITY;

-- ==========================================================
-- 11. GRANT permissions
-- ==========================================================
GRANT ALL ON public.rewards_niveles TO service_role;
GRANT SELECT ON public.rewards_niveles TO anon, authenticated;

GRANT ALL ON public.rewards_puntos TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.rewards_puntos TO authenticated;

GRANT ALL ON public.rewards_transacciones TO service_role;
GRANT SELECT, INSERT ON public.rewards_transacciones TO authenticated;

GRANT ALL ON public.referidos TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.referidos TO authenticated;

GRANT ALL ON public.fechas_especiales TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fechas_especiales TO authenticated;

REVOKE EXECUTE ON FUNCTION public.award_points(UUID, INTEGER, TEXT, UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_points(UUID, INTEGER, TEXT, UUID, TEXT) TO service_role, authenticated;

REVOKE EXECUTE ON FUNCTION public.redeem_points(UUID, INTEGER, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_points(UUID, INTEGER, TEXT) TO service_role, authenticated;

-- ==========================================================
-- 12. Schema reload
-- ==========================================================
NOTIFY pgrst, 'reload schema';


-- ==================================================
-- ARCHIVO: 20260906000000_resenas_sistema.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- Sistema de reseÃ±as de productos
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.resenas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE SET NULL,
  calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
  comentario TEXT,
  foto_url TEXT,
  aprobada BOOLEAN NOT NULL DEFAULT false,
  puntos_otorgados INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Un cliente solo puede reseÃ±ar un producto una vez
CREATE UNIQUE INDEX IF NOT EXISTS uq_resenas_cliente_producto
  ON public.resenas (cliente_id, producto_id);

CREATE INDEX IF NOT EXISTS idx_resenas_producto ON public.resenas (producto_id);
CREATE INDEX IF NOT EXISTS idx_resenas_cliente ON public.resenas (cliente_id);
CREATE INDEX IF NOT EXISTS idx_resenas_aprobada ON public.resenas (aprobada) WHERE aprobada = true;
CREATE INDEX IF NOT EXISTS idx_resenas_created ON public.resenas (created_at DESC);

-- RLS deshabilitado (auth manejada en cÃ³digo como en clientes)
ALTER TABLE public.resenas DISABLE ROW LEVEL SECURITY;

GRANT ALL ON public.resenas TO service_role;
GRANT SELECT, INSERT ON public.resenas TO authenticated;
GRANT SELECT ON public.resenas TO anon;

NOTIFY pgrst, 'reload schema';


-- ==================================================
-- ARCHIVO: 20260907000000_fix_rls_recursion_clientes.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- Corrige "infinite recursion" en policies de RLS sobre clientes
-- ----------------------------------------------------------
-- Las policies hacÃ­an una subconsulta a public.clientes dentro
-- de la propia tabla (SELECT 1 FROM public.clientes WHERE ...),
-- lo que re-evalÃºa RLS y causa recursiÃ³n infinita.
--
-- SoluciÃ³n: crear una funciÃ³n SECURITY DEFINER que consulta
-- clientes SIN pasar por RLS, y usarla en todas las policies.
-- ==========================================================

-- FunciÃ³n que indica si el usuario actual es admin (bypasa RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clientes c
    WHERE c.user_id = auth.uid()
      AND c.rol = 'admin'
      AND c.activo = true
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

NOTIFY pgrst, 'reload schema';


-- ==================================================
-- ARCHIVO: 20260907010000_clientes_dni.sql
-- ==================================================
-- Agrega columna dni a clientes para ediciÃ³n admin de datos del cliente.
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS dni TEXT;

-- ==================================================
-- ARCHIVO: 20260907020000_align_migration_history.sql
-- ==================================================
-- ==========================================================
-- AlineaciÃ³n del historial de migraciones
-- ----------------------------------------------------------
-- Las migraciones aplicadas manualmente (vÃ­a SQL editor) no
-- quedaron registradas en supabase_migrations.schema_migrations.
-- Este archivo:
--   1) Verifica que los objetos clave existan en la DB.
--   2) Registra las versiones pendientes para que el CLI las
--      considere ya aplicadas (sin re-ejecutar su DDL).
-- Es idempotente (ON CONFLICT DO NOTHING).
-- ==========================================================

DO $$
DECLARE
  v_missing text[] := ARRAY[]::text[];
BEGIN
  IF to_regclass('public.contactos') IS NULL THEN
    v_missing := array_append(v_missing, 'contactos');
  END IF;

  IF to_regclass('public.catalogo_imagenes') IS NULL THEN
    v_missing := array_append(v_missing, 'catalogo_imagenes');
  END IF;

  IF to_regclass('public.cotizaciones') IS NULL THEN
    v_missing := array_append(v_missing, 'cotizaciones');
  END IF;

  IF to_regclass('public.tienda_config') IS NULL THEN
    v_missing := array_append(v_missing, 'tienda_config');
  END IF;

  IF to_regclass('public.libro_reclamaciones') IS NULL THEN
    v_missing := array_append(v_missing, 'libro_reclamaciones');
  END IF;

  IF to_regclass('public.rewards_niveles') IS NULL THEN
    v_missing := array_append(v_missing, 'rewards_niveles');
  END IF;

  IF to_regclass('public.resenas') IS NULL THEN
    v_missing := array_append(v_missing, 'resenas');
  END IF;

  IF to_regprocedure('public.create_order(jsonb)') IS NULL THEN
    v_missing := array_append(v_missing, 'create_order()');
  END IF;

  IF to_regprocedure('public.is_admin()') IS NULL THEN
    v_missing := array_append(v_missing, 'is_admin()');
  END IF;

  IF array_length(v_missing, 1) > 0 THEN
    RAISE EXCEPTION 'AlineaciÃ³n abortada: faltan objetos en la DB: %', v_missing;
  END IF;
END $$;

INSERT INTO supabase_migrations.schema_migrations (version, name) VALUES
  ('20260728000000', 'rls_clientes'),
  ('20260728010000', 'trigger_auto_cliente'),
  ('20260728020000', 'rls_clientes_insert'),
  ('20260728030000', 'disable_rls_clientes'),
  ('20260729000000', 'update_proyecto_statuses'),
  ('20260729010000', 'fix_proyecto_rls'),
  ('20260729020000', 'disable_rls_proyectos'),
  ('20260729030000', 'add_observaciones_consent'),
  ('20260729050000', 'create_contactos'),
  ('20260730060000', 'add_mas_vendido'),
  ('20260730070000', 'create_catalogo_imagenes'),
  ('20260803000000', '008_cotizaciones_catering'),
  ('20260804100000', 'add_label_catering_catalog'),
  ('20260804110000', 'add_proyecto_id_to_catering'),
  ('20260804120000', 'add_precio_coffee_break'),
  ('20260806000000', 'fix_coffee_break_public_reads'),
  ('20260806010000', 'cotizaciones'),
  ('20260807000000', 'fix_pedidos_pago'),
  ('20260807020000', 'pedidos_numero_admin_rls'),
  ('20260808000000', 'agenda_produccion'),
  ('20260809000000', 'catalogo_mostrar_en'),
  ('20260809010000', 'catalogo_imagenes_portada'),
  ('20260814000000', 'scalability_indexes'),
  ('20260814010000', 'create_order_rpc'),
  ('20260814020000', 'dashboard_stats_rpc'),
  ('20260815000000', 'tienda_config'),
  ('20260819000000', 'producto_precio_cantidad'),
  ('20260820000000', 'fix_presentaciones_y_tiers'),
  ('20260820010000', 'carrito_items_presentacion'),
  ('20260820020000', 'caja_personalizada'),
  ('20260820030000', 'libro_reclamaciones'),
  ('20260826000000', 'caja_6_12_18_24'),
  ('20260905000000', 'rewards_fidelizacion'),
  ('20260906000000', 'resenas_sistema'),
  ('20260907000000', 'fix_rls_recursion_clientes')
ON CONFLICT (version) DO NOTHING;

-- ==================================================
-- ARCHIVO: 20260908000000_grants_clientes_update.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- Otorga privilegios faltantes sobre public.clientes
-- ----------------------------------------------------------
-- El panel admin actualiza/elimina clientes con service_role
-- y el perfil del usuario se actualiza con la sesiÃ³n
-- (authenticated). Solo existÃ­a GRANT SELECT, por lo que las
-- operaciones de UPDATE/DELETE fallaban con:
--   "permission denied for table clientes"
-- ==========================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clientes TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.clientes TO authenticated;

-- ==================================================
-- ARCHIVO: 20260909000000_catalogo_imagenes_precio_descripcion.sql
-- ==================================================
-- Precio y descripciÃ³n por imagen en catalogo_imagenes (catÃ¡logo Toppers)
ALTER TABLE public.catalogo_imagenes
  ADD COLUMN IF NOT EXISTS precio NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS descripcion TEXT;

-- Permisos UPDATE reafirmados para las nuevas columnas
GRANT UPDATE ON public.catalogo_imagenes TO service_role;
GRANT UPDATE ON public.catalogo_imagenes TO authenticated;

-- ==================================================
-- ARCHIVO: 20260909010000_grants_admin_delete_cliente.sql
-- ==================================================
-- ==========================================================
-- Kelly's Cake
-- Grants para el admin: eliminar clientes limpiando su
-- informaciÃ³n (carrito, carrito_items, pedidos, pedido_items)
-- ----------------------------------------------------------
-- El panel usa el client con service_role, que no tenÃ­a
-- privilegios DELETE sobre carrito/pedidos/pedido_items
-- (tablas creadas manualmente, sin grants explÃ­citos):
--   permission denied for table carrito
-- ==========================================================

GRANT ALL ON public.carrito TO service_role;
GRANT ALL ON public.carrito_items TO service_role;
GRANT ALL ON public.pedidos TO service_role;
GRANT ALL ON public.pedido_items TO service_role;

NOTIFY pgrst, 'reload schema';

-- ==================================================
-- ARCHIVO: 20260918102500_foodos_core_mvp1.sql
-- ==================================================
-- ============================================
-- FOODOS AI - MVP1: CORE Y COSTOS
-- ============================================

-- 1. CORE (Multi-tenancy + Usuarios)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  ruc VARCHAR(11) UNIQUE,
  tipo_negocio VARCHAR(50) NOT NULL DEFAULT 'pasteleria',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sucursales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  es_principal BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sucursal_id UUID REFERENCES sucursales(id),
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'viewer',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. INGREDIENTES
CREATE TABLE IF NOT EXISTS categorias_ingredientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  color VARCHAR(7),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ingredientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorias_ingredientes(id),
  nombre VARCHAR(255) NOT NULL,
  unidad_compra VARCHAR(20) NOT NULL,
  unidad_uso VARCHAR(20) NOT NULL,
  factor_conversion DECIMAL(10,4) NOT NULL DEFAULT 1000,
  costo_unitario DECIMAL(10,4) NOT NULL DEFAULT 0,
  costo_por_unidad_uso DECIMAL(10,6) GENERATED ALWAYS AS (
    CASE WHEN factor_conversion > 0 THEN costo_unitario / factor_conversion ELSE 0 END
  ) STORED,
  porcentaje_rendimiento DECIMAL(5,2) DEFAULT 100,
  porcentaje_merma_estandar DECIMAL(5,2) DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PRODUCTOS Y RECETAS
CREATE TABLE IF NOT EXISTS categorias_productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorias_productos(id),
  nombre VARCHAR(255) NOT NULL,
  precio_venta DECIMAL(10,2),
  precio_costo DECIMAL(10,4),
  margen_porcentaje DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN precio_venta > 0 AND precio_costo > 0
      THEN ((precio_venta - precio_costo) / precio_venta) * 100
      ELSE NULL END
  ) STORED,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recetas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  nombre VARCHAR(255) DEFAULT 'Receta Principal',
  rendimiento DECIMAL(10,2) NOT NULL DEFAULT 1,
  es_activa BOOLEAN DEFAULT true,
  costo_total DECIMAL(10,4) DEFAULT 0,
  costo_unitario DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS receta_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receta_id UUID NOT NULL REFERENCES recetas(id) ON DELETE CASCADE,
  ingrediente_id UUID REFERENCES ingredientes(id),
  sub_receta_id UUID REFERENCES recetas(id),
  cantidad DECIMAL(10,4) NOT NULL,
  unidad VARCHAR(20) NOT NULL,
  merma_porcentaje DECIMAL(5,2) DEFAULT 0,
  costo_linea DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE recetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE receta_items ENABLE ROW LEVEL SECURITY;

-- Nota: Las políticas RLS específicas para cada tabla se definirán 
-- en un archivo de migración posterior para simplificar.


-- ==================================================
-- ARCHIVO: 20260918102800_foodos_rls_policies.sql
-- ==================================================
-- ============================================
-- FOODOS AI - POLÍTICAS DE SEGURIDAD RLS
-- ============================================

-- 1. Función Helper para obtener el tenant del usuario actual
-- Esto evita tener que escribir el SELECT completo en cada política
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$$
  SELECT tenant_id FROM usuarios WHERE id = auth.uid() LIMIT 1;
$$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Políticas para 'tenants' (Los usuarios solo pueden ver/editar su propio negocio)
CREATE POLICY "Ver su propio negocio" ON tenants FOR SELECT
USING (id = get_user_tenant_id());

CREATE POLICY "Editar su propio negocio" ON tenants FOR UPDATE
USING (id = get_user_tenant_id());

-- 3. Políticas para 'usuarios' (Pueden ver a los empleados de su mismo negocio)
CREATE POLICY "Ver usuarios de su negocio" ON usuarios FOR SELECT
USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Los admin pueden gestionar usuarios" ON usuarios FOR ALL
USING (
  tenant_id = get_user_tenant_id() AND 
  (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('owner', 'admin')
);

-- 4. Macro Política General para Tablas Operativas (Ingredientes, Productos, Recetas, etc.)
-- Como todas tienen 'tenant_id', podemos aplicar políticas universales.

DO $$$
DECLARE
  table_name TEXT;
BEGIN
  FOR table_name IN 
    SELECT t.table_name 
    FROM information_schema.tables t
    WHERE t.table_schema = 'public' 
      AND t.table_name IN (
        'sucursales', 
        'categorias_ingredientes', 
        'ingredientes', 
        'categorias_productos', 
        'productos', 
        'recetas'
      )
  LOOP
    EXECUTE format('CREATE POLICY "Aislamiento total por tenant ALL" ON %I FOR ALL USING (tenant_id = get_user_tenant_id()) WITH CHECK (tenant_id = get_user_tenant_id());', table_name);
  END LOOP;
END;
$$$;

-- 5. Políticas para 'receta_items' (No tienen tenant_id directo, heredan de 'recetas')
CREATE POLICY "Ver items de sus propias recetas" ON receta_items FOR ALL
USING (
  receta_id IN (SELECT id FROM recetas WHERE tenant_id = get_user_tenant_id())
)
WITH CHECK (
  receta_id IN (SELECT id FROM recetas WHERE tenant_id = get_user_tenant_id())
);



-- ==================================================
-- ARCHIVO: 20260918110500_foodos_compras_y_triggers.sql
-- ==================================================
-- ============================================
-- FOODOS AI - MÓDULO DE COMPRAS Y CASCADA DE COSTOS
-- ============================================

-- 1. TABLAS
CREATE TABLE IF NOT EXISTS proveedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  contacto VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  proveedor_id UUID REFERENCES proveedores(id),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  numero_factura VARCHAR(100),
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compra_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compra_id UUID NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  ingrediente_id UUID NOT NULL REFERENCES ingredientes(id),
  cantidad DECIMAL(10,4) NOT NULL,
  precio_total DECIMAL(10,4) NOT NULL,
  precio_unitario DECIMAL(10,4) GENERATED ALWAYS AS (
    CASE WHEN cantidad > 0 THEN precio_total / cantidad ELSE 0 END
  ) STORED
);

-- RLS
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE compra_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aislamiento por tenant ALL" ON proveedores FOR ALL USING (tenant_id = get_user_tenant_id()) WITH CHECK (tenant_id = get_user_tenant_id());
CREATE POLICY "Aislamiento por tenant ALL" ON compras FOR ALL USING (tenant_id = get_user_tenant_id()) WITH CHECK (tenant_id = get_user_tenant_id());
CREATE POLICY "Items compras heredan de compras" ON compra_items FOR ALL
USING (compra_id IN (SELECT id FROM compras WHERE tenant_id = get_user_tenant_id()))
WITH CHECK (compra_id IN (SELECT id FROM compras WHERE tenant_id = get_user_tenant_id()));

-- ============================================
-- 2. LÓGICA DE ACTUALIZACIÓN DE PRECIOS
-- ============================================

-- Trigger: Al registrar compra, actualizar costo_unitario del ingrediente
CREATE OR REPLACE FUNCTION update_ingrediente_cost_from_compra()
RETURNS TRIGGER AS $$
BEGIN
  -- Usamos el último precio de compra para el costeo de reposición
  UPDATE ingredientes
  SET costo_unitario = NEW.precio_unitario
  WHERE id = NEW.ingrediente_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ingrediente_cost
AFTER INSERT OR UPDATE ON compra_items
FOR EACH ROW
EXECUTE FUNCTION update_ingrediente_cost_from_compra();


-- ============================================
-- 3. EFECTO CASCADA (RECÁLCULO DE RECETAS)
-- ============================================

-- Helper: Calcula costo línea exacto con mermas
CREATE OR REPLACE FUNCTION calculate_costo_linea(p_cantidad NUMERIC, p_merma_ingrediente NUMERIC, p_merma_item NUMERIC, p_costo_uso NUMERIC)
RETURNS NUMERIC AS $$
DECLARE
  merma_total NUMERIC;
  factor NUMERIC;
BEGIN
  merma_total := (COALESCE(p_merma_ingrediente, 0) + COALESCE(p_merma_item, 0)) / 100.0;
  IF merma_total >= 1.0 THEN merma_total := 0.99; END IF;
  factor := 1.0 - merma_total;
  RETURN (p_cantidad / factor) * p_costo_uso;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger: Efecto cascada
CREATE OR REPLACE FUNCTION recalculate_recipes_on_ingredient_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el costo de uso y la merma no cambiaron, no hacemos nada
  IF OLD.costo_por_unidad_uso = NEW.costo_por_unidad_uso AND OLD.porcentaje_merma_estandar = NEW.porcentaje_merma_estandar THEN
    RETURN NEW;
  END IF;

  -- 1. Actualizar el costo_linea de todos los receta_items afectados
  UPDATE receta_items ri
  SET costo_linea = calculate_costo_linea(ri.cantidad, NEW.porcentaje_merma_estandar, ri.merma_porcentaje, NEW.costo_por_unidad_uso)
  WHERE ri.ingrediente_id = NEW.id;

  -- 2. Recalcular costo total de las recetas afectadas
  WITH recipe_costs AS (
    SELECT r.id as receta_id, COALESCE(SUM(ri.costo_linea), 0) as total
    FROM recetas r
    JOIN receta_items ri ON ri.receta_id = r.id
    WHERE r.id IN (SELECT receta_id FROM receta_items WHERE ingrediente_id = NEW.id)
    GROUP BY r.id
  )
  UPDATE recetas
  SET 
    costo_total = rc.total,
    costo_unitario = (rc.total / NULLIF(rendimiento, 0))
  FROM recipe_costs rc
  WHERE recetas.id = rc.receta_id;

  -- 3. Actualizar precio_costo en productos finales
  UPDATE productos p
  SET precio_costo = r.costo_unitario
  FROM recetas r
  WHERE p.id = r.producto_id
    AND r.id IN (SELECT receta_id FROM receta_items WHERE ingrediente_id = NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_recalculate_recipes
AFTER UPDATE ON ingredientes
FOR EACH ROW
EXECUTE FUNCTION recalculate_recipes_on_ingredient_change();



-- ==================================================
-- ARCHIVO: 20260918111000_foodos_produccion.sql
-- ==================================================
-- ============================================
-- FOODOS AI - MÓDULO DE PRODUCCIÓN
-- ============================================

CREATE TABLE IF NOT EXISTS ordenes_produccion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  fecha_prevista DATE NOT NULL DEFAULT CURRENT_DATE,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente', -- pendiente, completada, cancelada
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orden_produccion_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id UUID NOT NULL REFERENCES ordenes_produccion(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id),
  cantidad DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE ordenes_produccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE orden_produccion_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aislamiento por tenant ordenes" ON ordenes_produccion FOR ALL 
USING (tenant_id = get_user_tenant_id()) 
WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Items heredan de ordenes" ON orden_produccion_items FOR ALL
USING (orden_id IN (SELECT id FROM ordenes_produccion WHERE tenant_id = get_user_tenant_id()))
WITH CHECK (orden_id IN (SELECT id FROM ordenes_produccion WHERE tenant_id = get_user_tenant_id()));


-- ==================================================
-- ARCHIVO: 20260918111500_foodos_cotizador.sql
-- ==================================================
-- ============================================
-- FOODOS AI - MÓDULO DE COTIZADOR DE EVENTOS
-- ============================================

CREATE TABLE IF NOT EXISTS cotizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  cliente_nombre VARCHAR(255) NOT NULL,
  fecha_evento DATE,
  estado VARCHAR(20) NOT NULL DEFAULT 'borrador',
  total_costo DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_venta DECIMAL(10,2) NOT NULL DEFAULT 0,
  margen_porcentaje DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_venta > 0 AND total_costo >= 0
      THEN ((total_venta - total_costo) / total_venta) * 100
      ELSE 0 END
  ) STORED,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cotizacion_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotizacion_id UUID NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
  tipo_item VARCHAR(20) NOT NULL DEFAULT 'producto', -- 'producto' o 'extra'
  producto_id UUID REFERENCES productos(id),
  nombre_descripcion VARCHAR(255) NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL DEFAULT 1,
  costo_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  precio_venta_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizacion_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aislamiento por tenant cotizaciones" ON cotizaciones FOR ALL 
USING (tenant_id = get_user_tenant_id()) 
WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Items heredan de cotizaciones" ON cotizacion_items FOR ALL
USING (cotizacion_id IN (SELECT id FROM cotizaciones WHERE tenant_id = get_user_tenant_id()))
WITH CHECK (cotizacion_id IN (SELECT id FROM cotizaciones WHERE tenant_id = get_user_tenant_id()));


-- ==================================================
-- ARCHIVO: SEED Premium PREMIUM
-- ==================================================
-- =========================================================
-- SCRIPT DE CARGA MASIVA: RECETAS OFICIALES PREMEZCLAS Premium
-- =========================================================

DO $$ 
DECLARE
  v_tenant_id UUID;
  
  -- IDs Ingredientes (Premezclas Premium)
  id_ing_prem_vainilla UUID := gen_random_uuid();
  id_ing_prem_choco UUID := gen_random_uuid();
  id_ing_prem_redvelvet UUID := gen_random_uuid();
  id_ing_prem_brownie UUID := gen_random_uuid();
  id_ing_prem_chifon UUID := gen_random_uuid();
  id_ing_prem_carrot UUID := gen_random_uuid();
  
  -- IDs Ingredientes (Complementos)
  id_ing_huevos UUID := gen_random_uuid();
  id_ing_aceite UUID := gen_random_uuid();
  id_ing_agua UUID := gen_random_uuid();
  id_ing_zanahoria UUID := gen_random_uuid();
  id_ing_pecanas UUID := gen_random_uuid();

  -- IDs Productos
  id_prod_vainilla UUID := gen_random_uuid();
  id_prod_choco UUID := gen_random_uuid();
  id_prod_redvelvet UUID := gen_random_uuid();
  id_prod_brownie UUID := gen_random_uuid();
  id_prod_chifon UUID := gen_random_uuid();
  id_prod_carrot UUID := gen_random_uuid();

  -- IDs Recetas
  id_rec_vainilla UUID := gen_random_uuid();
  id_rec_choco UUID := gen_random_uuid();
  id_rec_redvelvet UUID := gen_random_uuid();
  id_rec_brownie UUID := gen_random_uuid();
  id_rec_chifon UUID := gen_random_uuid();
  id_rec_carrot UUID := gen_random_uuid();

BEGIN
  -- 1. Obtener tenant
  INSERT INTO tenants (nombre) SELECT 'Kellys Cake' WHERE NOT EXISTS (SELECT 1 FROM tenants); SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
  IF v_tenant_id IS NULL THEN RAISE EXCEPTION 'No se encontró el negocio registrado.'; END IF;

  -- 2. INSERTAR INGREDIENTES (Con precios referenciales por bolsa de 5kg o 1kg)
  INSERT INTO ingredientes (id, tenant_id, nombre, unidad_compra, cantidad_compra, costo_unitario, unidad_uso, factor_conversion, porcentaje_merma_estandar) VALUES
  (id_ing_prem_vainilla, v_tenant_id, 'Deluxe Creme Cake Vainilla ', 'Saco', 5, 75.00, 'gramos', 5000, 0),
  (id_ing_prem_choco, v_tenant_id, 'Deluxe Creme Cake Chocolate ', 'Saco', 5, 80.00, 'gramos', 5000, 0),
  (id_ing_prem_redvelvet, v_tenant_id, 'Premezcla Red Velvet ', 'Bolsa', 1, 22.00, 'gramos', 1000, 0),
  (id_ing_prem_brownie, v_tenant_id, 'Premezcla Brownie ', 'Bolsa', 1, 18.00, 'gramos', 1000, 0),
  (id_ing_prem_chifon, v_tenant_id, 'Chifón ChocoMix ', 'Bolsa', 1, 19.50, 'gramos', 1000, 0),
  (id_ing_prem_carrot, v_tenant_id, 'Premezcla Carrot Cake ', 'Bolsa', 1, 20.00, 'gramos', 1000, 0),
  
  -- Complementos básicos
  (id_ing_huevos, v_tenant_id, 'Huevos (Complemento)', 'Plancha', 30, 16.00, 'gramos', 1800, 5), -- 1800g por plancha aprox
  (id_ing_aceite, v_tenant_id, 'Aceite Vegetal (Complemento)', 'Litro', 1, 8.50, 'gramos', 1000, 0),
  (id_ing_agua, v_tenant_id, 'Agua Filtrada', 'Litro', 1, 1.00, 'gramos', 1000, 0),
  (id_ing_zanahoria, v_tenant_id, 'Zanahoria Fresca', 'Kilo', 1, 3.50, 'gramos', 1000, 15), -- 15% merma al pelar
  (id_ing_pecanas, v_tenant_id, 'Pecanas Picadas', 'Kilo', 1, 45.00, 'gramos', 1000, 0);

  -- 3. INSERTAR PRODUCTOS
  INSERT INTO productos (id, tenant_id, nombre, descripcion, precio_venta) VALUES
  (id_prod_vainilla, v_tenant_id, 'Torta Húmeda Vainilla  - 20 Porciones', 'Miga suave y húmeda', 65.00),
  (id_prod_choco, v_tenant_id, 'Torta Húmeda Chocolate  - 20 Porciones', 'Intenso sabor a cacao', 70.00),
  (id_prod_redvelvet, v_tenant_id, 'Torta Red Velvet  - 15 Porciones', 'Rojo vibrante', 85.00),
  (id_prod_brownie, v_tenant_id, 'Plancha de Brownies Premium', 'Melcochudo y denso', 55.00),
  (id_prod_chifon, v_tenant_id, 'Chifón de Chocolate Premium', 'Súper esponjoso y alto', 40.00),
  (id_prod_carrot, v_tenant_id, 'Carrot Cake Premium - 15 Porciones', 'Con zanahoria y pecanas', 75.00);

  -- 4. INSERTAR RECETAS (Rendimiento 1 batch por cada kilo de premezcla)
  INSERT INTO recetas (id, tenant_id, producto_id, nombre, rendimiento, costo_total, costo_unitario, es_activa) VALUES
  (id_rec_vainilla, v_tenant_id, id_prod_vainilla, 'Formulación Premium Vainilla', 1, 0, 0, true),
  (id_rec_choco, v_tenant_id, id_prod_choco, 'Formulación Premium Chocolate', 1, 0, 0, true),
  (id_rec_redvelvet, v_tenant_id, id_prod_redvelvet, 'Formulación Premium Red Velvet', 1, 0, 0, true),
  (id_rec_brownie, v_tenant_id, id_prod_brownie, 'Formulación Premium Brownie', 1, 0, 0, true),
  (id_rec_chifon, v_tenant_id, id_prod_chifon, 'Formulación Premium Chifón', 1, 0, 0, true),
  (id_rec_carrot, v_tenant_id, id_prod_carrot, 'Formulación Premium Carrot Cake', 1, 0, 0, true);

  -- 5. INSERTAR FORMULACIONES (RECETA ITEMS)
  
  -- 5.1 Vainilla (Base: 1kg polvo, 350g huevo, 300g aceite, 225g agua)
  INSERT INTO receta_items (receta_id, ingrediente_id, cantidad, unidad, merma_porcentaje, costo_linea) VALUES
  (id_rec_vainilla, id_ing_prem_vainilla, 1000, 'gramos', 0, 0),
  (id_rec_vainilla, id_ing_huevos, 350, 'gramos', 0, 0),
  (id_rec_vainilla, id_ing_aceite, 300, 'gramos', 0, 0),
  (id_rec_vainilla, id_ing_agua, 225, 'gramos', 0, 0);

  -- 5.2 Chocolate (Base: 1kg polvo, 350g huevo, 300g aceite, 225g agua)
  INSERT INTO receta_items (receta_id, ingrediente_id, cantidad, unidad, merma_porcentaje, costo_linea) VALUES
  (id_rec_choco, id_ing_prem_choco, 1000, 'gramos', 0, 0),
  (id_rec_choco, id_ing_huevos, 350, 'gramos', 0, 0),
  (id_rec_choco, id_ing_aceite, 300, 'gramos', 0, 0),
  (id_rec_choco, id_ing_agua, 225, 'gramos', 0, 0);

  -- 5.3 Red Velvet (Base: 1kg polvo, 350g huevo, 300g aceite, 225g agua)
  INSERT INTO receta_items (receta_id, ingrediente_id, cantidad, unidad, merma_porcentaje, costo_linea) VALUES
  (id_rec_redvelvet, id_ing_prem_redvelvet, 1000, 'gramos', 0, 0),
  (id_rec_redvelvet, id_ing_huevos, 350, 'gramos', 0, 0),
  (id_rec_redvelvet, id_ing_aceite, 300, 'gramos', 0, 0),
  (id_rec_redvelvet, id_ing_agua, 225, 'gramos', 0, 0);

  -- 5.4 Brownie (Base: 1kg polvo, 200g huevo, 200g aceite, 100g agua, 100g pecanas)
  INSERT INTO receta_items (receta_id, ingrediente_id, cantidad, unidad, merma_porcentaje, costo_linea) VALUES
  (id_rec_brownie, id_ing_prem_brownie, 1000, 'gramos', 0, 0),
  (id_rec_brownie, id_ing_huevos, 200, 'gramos', 0, 0),
  (id_rec_brownie, id_ing_aceite, 200, 'gramos', 0, 0),
  (id_rec_brownie, id_ing_agua, 100, 'gramos', 0, 0),
  (id_rec_brownie, id_ing_pecanas, 100, 'gramos', 0, 0);

  -- 5.5 Chifón ChocoMix (Base: 1kg polvo, 650g huevo, 150g aceite, 150g agua)
  INSERT INTO receta_items (receta_id, ingrediente_id, cantidad, unidad, merma_porcentaje, costo_linea) VALUES
  (id_rec_chifon, id_ing_prem_chifon, 1000, 'gramos', 0, 0),
  (id_rec_chifon, id_ing_huevos, 650, 'gramos', 0, 0),
  (id_rec_chifon, id_ing_aceite, 150, 'gramos', 0, 0),
  (id_rec_chifon, id_ing_agua, 150, 'gramos', 0, 0);

  -- 5.6 Carrot Cake (Base: 1kg polvo, 300g huevo, 300g aceite, 200g agua, 200g zanahoria)
  INSERT INTO receta_items (receta_id, ingrediente_id, cantidad, unidad, merma_porcentaje, costo_linea) VALUES
  (id_rec_carrot, id_ing_prem_carrot, 1000, 'gramos', 0, 0),
  (id_rec_carrot, id_ing_huevos, 300, 'gramos', 0, 0),
  (id_rec_carrot, id_ing_aceite, 300, 'gramos', 0, 0),
  (id_rec_carrot, id_ing_agua, 200, 'gramos', 0, 0),
  (id_rec_carrot, id_ing_zanahoria, 200, 'gramos', 0, 0);

  -- 6. Trigger Cascada de Costos: Obligamos a la BD a recalcular todo actualizando el costo por sí mismo.
  UPDATE ingredientes SET costo_unitario = costo_unitario WHERE tenant_id = v_tenant_id;

END $$;


