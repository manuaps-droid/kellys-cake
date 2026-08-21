import { cache } from "react";

import { getPublicConfigRepository } from "@/features/admin/configuracion/repositories/config.repository";
import type {
  SeccionConfig,
  TiendaConfig,
  ContactoConfig,
  MarketingConfig,
  SeoConfig,
  PixelesConfig,
} from "@/features/admin/configuracion/validations/config.schema";

/**
 * Cachea por request la lectura pública de cada sección visible
 * en el storefront (las demás están protegidas por RLS).
 * Invocar desde Server Components.
 */
export const getPublicTienda = cache(async () => {
  return (await getPublicConfigRepository("tienda")) as TiendaConfig | null;
});

export const getPublicContacto = cache(async () => {
  return (await getPublicConfigRepository("contacto")) as ContactoConfig | null;
});

export const getPublicMarketing = cache(async () => {
  return (await getPublicConfigRepository("marketing")) as MarketingConfig | null;
});

export const getPublicSeo = cache(async () => {
  return (await getPublicConfigRepository("seo")) as SeoConfig | null;
});

export const getPublicPixeles = cache(async () => {
  return (await getPublicConfigRepository("pixeles")) as PixelesConfig | null;
});

export async function getPublicConfig<T extends SeccionConfig>(
  seccion: T
): Promise<unknown> {
  return getPublicConfigRepository(seccion);
}
