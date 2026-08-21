export type ProductImage = {
  id: string;
  producto_id: string;
  media_id: string;
  orden: number;
  principal: boolean;
  created_at: string;

  media: {
    id: string;
    nombre: string;
    url: string;
  }[];
};