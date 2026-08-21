import PageHeader from "@/components/common/PageHeader";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/Tabs";

import { getConfigAction } from "@/features/admin/configuracion/actions/config.action";
import ConfigSectionForm from "@/features/admin/configuracion/components/ConfigSectionForm";
import { z } from "zod";

import {
  tiendaSchema,
  contactoSchema,
  marketingSchema,
  seoSchema,
  pixelesSchema,
  notificacionesSchema,
  type TiendaConfig,
  type ContactoConfig,
  type MarketingConfig,
  type SeoConfig,
  type PixelesConfig,
  type NotificacionesConfig,
} from "@/features/admin/configuracion/validations/config.schema";
import {
  TIENDA_FIELDS,
  CONTACTO_FIELDS,
  MARKETING_FIELDS,
  SEO_FIELDS,
  PIXELES_FIELDS,
  NOTIF_FIELDS,
} from "@/features/admin/configuracion/config/fields.config";

const SECTIONS = [
  { value: "tienda", label: "Tienda" },
  { value: "contacto", label: "Contacto & Redes" },
  { value: "marketing", label: "Marketing" },
  { value: "seo", label: "SEO & Analytics" },
  { value: "pixeles", label: "Píxeles" },
  { value: "notificaciones", label: "Notificaciones" },
] as const;

export default async function AdminConfiguracionPage() {
  const result = await getConfigAction();
  if (!result.success) {
    return (
      <>
        <PageHeader
          title="Configuración"
          description="Administra la información y preferencias de la tienda."
        />
        <p className="text-red-500">
          {result.message ?? "No se pudo cargar la configuración."}
        </p>
      </>
    );
  }

  const data = result.data as Record<string, unknown>;

  const tienda = (data.tienda ?? {}) as Partial<TiendaConfig>;
  const contacto = (data.contacto ?? {}) as Partial<ContactoConfig>;
  const marketing = (data.marketing ?? {}) as Partial<MarketingConfig>;
  const seo = (data.seo ?? {}) as Partial<SeoConfig>;
  const pixeles = (data.pixeles ?? {}) as Partial<PixelesConfig>;
  const notif = (data.notificaciones ?? {}) as Partial<NotificacionesConfig>;

  function withDefaults(schema: z.ZodType, raw: unknown): Record<string, unknown> {
    const r = schema.safeParse(raw);
    if (!r.success) return {};
    return (r.data as Record<string, unknown>) ?? {};
  }

  return (
    <>
      <PageHeader
        title="Configuración"
        description="Administra la información de tu tienda, métodos de contacto, marketing, SEO y de tu equipo de conversión."
      />

      <Tabs defaultValue="tienda" className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted p-2">
          {SECTIONS.map((s) => (
            <TabsTrigger
              key={s.value}
              value={s.value}
              className="rounded-md px-4 py-2 text-sm font-medium"
            >
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="tienda">
          <div className="rounded-2xl border bg-white p-6">
            <ConfigSectionForm
              seccion="tienda"
              fields={TIENDA_FIELDS}
              defaultValues={withDefaults(tiendaSchema, tienda)}
            />
          </div>
        </TabsContent>

        <TabsContent value="contacto">
          <div className="rounded-2xl border bg-white p-6">
            <ConfigSectionForm
              seccion="contacto"
              fields={CONTACTO_FIELDS}
              defaultValues={withDefaults(contactoSchema, contacto)}
            />
          </div>
        </TabsContent>

        <TabsContent value="marketing">
          <div className="rounded-2xl border bg-white p-6">
            <ConfigSectionForm
              seccion="marketing"
              fields={MARKETING_FIELDS}
              defaultValues={withDefaults(marketingSchema, marketing)}
            />
          </div>
        </TabsContent>

        <TabsContent value="seo">
          <div className="rounded-2xl border bg-white p-6">
            <ConfigSectionForm
              seccion="seo"
              fields={SEO_FIELDS}
              defaultValues={withDefaults(seoSchema, seo)}
            />
          </div>
        </TabsContent>

        <TabsContent value="pixeles">
          <div className="rounded-2xl border bg-white p-6">
            <ConfigSectionForm
              seccion="pixeles"
              fields={PIXELES_FIELDS}
              defaultValues={withDefaults(pixelesSchema, pixeles)}
            />
          </div>
        </TabsContent>

        <TabsContent value="notificaciones">
          <div className="rounded-2xl border bg-white p-6">
            <ConfigSectionForm
              seccion="notificaciones"
              fields={NOTIF_FIELDS}
              defaultValues={withDefaults(notificacionesSchema, notif)}
            />
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
