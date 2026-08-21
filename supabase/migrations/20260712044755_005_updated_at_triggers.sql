-- ==========================================================
-- Kelly's Cake
-- Migración 005
-- updated_at automático
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