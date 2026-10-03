export type VisitaDia = {
  fecha: string; // "YYYY-MM-DD"
  total: number; // Cantidad total de visualizaciones de página
  unicos: number; // Cantidad de personas / sesiones distintas
  rutas: Record<string, number>; // Ej: { "/": 40, "/productos": 25 }
  dispositivos: {
    movil: number;
    desktop: number;
  };
};

export type ResumenVisitas = {
  hoy: { total: number; unicos: number };
  ayer: { total: number; unicos: number };
  ultimos7Dias: { total: number; unicos: number };
  ultimos30Dias: { total: number; unicos: number };
  totalHistorico: number;
  historialDias: VisitaDia[]; // Lista ordenada de días recientes
  topRutas: { ruta: string; visitas: number }[];
};
