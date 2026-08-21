import {
  getAgendaOrdersRepository,
  getAgendaOrdersSinFechaRepository,
} from "../repositories/get-agenda-orders.repository";

export async function getAgendaOrdersService() {
  const [programados, sinFecha] = await Promise.all([
    getAgendaOrdersRepository(),
    getAgendaOrdersSinFechaRepository(),
  ]);

  return { programados, sinFecha };
}
