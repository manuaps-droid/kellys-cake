alter table public.proyectos_personalizados
add column observaciones text;

alter table public.proyectos_personalizados
add column autoriza_comunicacion boolean not null default false;
