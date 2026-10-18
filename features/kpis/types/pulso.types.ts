export type EstadoMerma =
  | "sin-registro"
  | "saludable"
  | "alerta"
  | "critico";

export type EstadoRotacion = "alta" | "media" | "baja";

export type FilaRotacion = {
  nombre: string;
  unidadesSemana: number;
  horasPorUnidad: number | null;
  estado: EstadoRotacion;
};

export type CanalResumen = {
  canal: "web" | "vending" | "directo";
  etiqueta: string;
  pedidosMes: number;
  totalMes: number;
  ticket: number;
  pctParticipacion: number;
};

export type DatosPulso = {
  tieneDatos: boolean;
  ticket: {
    actual: number;
    anterior: number | null;
    diferencia: number;
    pedidosMes: number;
    totalMes: number;
  };
  lealtad: {
    pct: number;
    recurrentes: number;
    nuevos: number;
    totalMes: number;
    clientesNuevos: number;
  };
  merma: {
    registrada: boolean;
    monto: number;
    pct: number;
    estado: EstadoMerma;
  };
  rotacion: FilaRotacion[];
  canales: CanalResumen[];
};
