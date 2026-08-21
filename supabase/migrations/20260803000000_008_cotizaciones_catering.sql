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
