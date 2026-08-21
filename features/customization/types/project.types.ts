export type ProjectData = {
  descripcion: string;

  mensaje: string;

  personas: number;

  presupuesto: number | null;

  alergias: string;

  fechaEvento: string;

  horaEvento: string;

  tipoEntrega: "delivery" | "pickup";

  direccion: string;

  referencia: string;

  latitud: number | null;

  longitud: number | null;

  catalogos: string[];

  imagenes: string[];

  observaciones: string;

  autorizaComunicacion: boolean;
};