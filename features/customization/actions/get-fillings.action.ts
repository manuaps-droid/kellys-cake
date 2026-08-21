"use server";

import { getFillingsService } from "../services/filling.service";

export async function getFillingsAction() {
  try {
    const fillings =
      await getFillingsService();

    return {
      success: true,
      fillings,
    };
  } catch {
    return {
      success: false,
      fillings: [],
    };
  }
}