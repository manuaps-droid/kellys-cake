"use server";

import {
  getCoffeeBreakItemsRepository,
  type CoffeeBreakData,
} from "../repositories/get-coffee-break.repository";

export async function getCoffeeBreakItemsAction(): Promise<CoffeeBreakData> {
  try {
    return await getCoffeeBreakItemsRepository();
  } catch (error) {
    console.error("Error en getCoffeeBreakItemsAction:", error);
    return { items: [] };
  }
}
