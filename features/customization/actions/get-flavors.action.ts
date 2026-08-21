"use server";

import { getFlavorsService } from "../services/flavor.service";

export async function getFlavorsAction() {
  try {
    const flavors = await getFlavorsService();

    return {
      success: true,
      flavors,
    };
  } catch {
    return {
      success: false,
      flavors: [],
    };
  }
}