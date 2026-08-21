export type Media = {
  id: string;
  nombre: string;
  archivo: string;
  url: string;
  bucket: string;
  carpeta: string;
  mime_type: string | null;
  size: number | null;
  ancho: number | null;
  alto: number | null;
  alt: string | null;
  created_at: string;
};