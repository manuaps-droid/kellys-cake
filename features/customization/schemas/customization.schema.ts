import { z } from "zod";

export const customizationSchema = z.object({
  celebration: z.string().min(1),

  description: z.string().min(10),

  people: z.number().min(1),

  flavor: z.string(),

  filling: z.string(),

  frosting: z.string(),

  message: z.string(),

  allergies: z.string(),

  budget: z.number().nullable(),

  deliveryDate: z.string(),

  deliveryTime: z.string(),

  deliveryType: z.enum([
    "delivery",
    "pickup",
  ]),

  address: z.string(),

  reference: z.string(),

  latitude: z.number().nullable(),

  longitude: z.number().nullable(),
});

export type CustomizationInput =
  z.infer<typeof customizationSchema>;