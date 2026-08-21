"use server";

import { getFrostingsService } from "../services/frosting.service";

export async function getFrostingsAction() {
  try {
    const frostings =
      await getFrostingsService();

    return {
      success: true,
      frostings,
    };
  } catch {
    return {
      success: false,
      frostings: [],
    };
  }
}