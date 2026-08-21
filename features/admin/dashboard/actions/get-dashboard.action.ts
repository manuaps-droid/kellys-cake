"use server";

import { getDashboardService } from "../services/get-dashboard.service";

export async function getDashboardAction() {
  try {
    const stats =
      await getDashboardService();

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      stats: null,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo cargar el dashboard.",
    };
  }
}