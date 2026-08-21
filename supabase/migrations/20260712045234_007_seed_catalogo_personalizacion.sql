-- ==========================================================
-- Kelly's Cake
-- Migración 007
-- Datos iniciales catálogo personalización
-- ==========================================================

insert into public.catalogo_personalizacion
(tipo, nombre, orden)
values

('celebration','Cumpleaños',1),
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