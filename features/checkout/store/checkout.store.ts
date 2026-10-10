import { create } from "zustand";
import { persist } from "zustand/middleware";

import { CheckoutData } from "../types/checkout.types";

interface CheckoutStore {
  data: CheckoutData;

  prefillCustomer: (
    customer: Partial<CheckoutData["customer"]>
  ) => void;

  updateCustomer: (
    customer: Partial<CheckoutData["customer"]>
  ) => void;

  updateAddress: (
    address: Partial<CheckoutData["address"]>
  ) => void;

  setDeliveryInfo: (
    distance: number | null,
    fee: number | null
  ) => void;

  setDeliveryMethod: (
    method: CheckoutData["deliveryMethod"]
  ) => void;

  setDeliverySchedule: (
    date?: string,
    time?: string
  ) => void;

  setPaymentMethod: (
    method: CheckoutData["paymentMethod"]
  ) => void;

  setPaymentType: (
    paymentType: CheckoutData["paymentType"]
  ) => void;

  setPaymentReference: (reference: string) => void;

  setNeedsInvoice: (needsInvoice: boolean) => void;

  updateInvoice: (
    invoice: Partial<CheckoutData["invoice"]>
  ) => void;

  reset: () => void;
}

const initialData: CheckoutData = {
  customer: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    recipientName: "",
  },

  deliveryMethod: "delivery",
  deliveryDate: "",
  deliveryTime: "11:00 - 13:00",

  address: {
    department: "",
    province: "",
    district: "",
    address: "",
    reference: "",
    lat: null,
    lng: null,
    deliveryDistance: null,
    deliveryFee: null,
  },

  paymentMethod: "",
  paymentType: "total",
  paymentReference: "",
  needsInvoice: false,
  invoice: {
    ruc: "",
    razonSocial: "",
    direccionFiscal: "",
  },
};

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set, get) => ({
      data: initialData,

      prefillCustomer: (customer) => {
        const current = get().data.customer;
        const isPristine =
          !current.firstName &&
          !current.lastName &&
          !current.email &&
          !current.phone;

        if (isPristine) {
          set((state) => ({
            data: {
              ...state.data,
              customer: {
                ...state.data.customer,
                ...customer,
              },
            },
          }));
        }
      },

      updateCustomer: (customer) =>
        set((state) => ({
          data: {
            ...state.data,
            customer: {
              ...state.data.customer,
              ...customer,
            },
          },
        })),

      updateAddress: (address) =>
        set((state) => ({
          data: {
            ...state.data,
            address: {
              ...state.data.address,
              ...address,
            },
          },
        })),

      setDeliveryInfo: (deliveryDistance, deliveryFee) =>
        set((state) => ({
          data: {
            ...state.data,
            address: {
              ...state.data.address,
              deliveryDistance,
              deliveryFee,
            },
          },
        })),

      setDeliveryMethod: (deliveryMethod) =>
        set((state) => ({
          data: {
            ...state.data,
            deliveryMethod,
          },
        })),

      setDeliverySchedule: (date, time) =>
        set((state) => ({
          data: {
            ...state.data,
            deliveryDate: date !== undefined ? date : state.data.deliveryDate,
            deliveryTime: time !== undefined ? time : state.data.deliveryTime,
          },
        })),

      setPaymentMethod: (paymentMethod) =>
        set((state) => ({
          data: {
            ...state.data,
            paymentMethod,
          },
        })),

      setPaymentType: (paymentType) =>
        set((state) => ({
          data: {
            ...state.data,
            paymentType,
          },
        })),

      setPaymentReference: (paymentReference) =>
        set((state) => ({
          data: {
            ...state.data,
            paymentReference,
          },
        })),

      setNeedsInvoice: (needsInvoice) =>
        set((state) => ({
          data: {
            ...state.data,
            needsInvoice,
            invoice: needsInvoice
              ? { ruc: "", razonSocial: "", direccionFiscal: "" }
              : initialData.invoice,
          },
        })),

      updateInvoice: (invoice) =>
        set((state) => ({
          data: {
            ...state.data,
            invoice: {
              ...(state.data.invoice ?? { ruc: "", razonSocial: "", direccionFiscal: "" }),
              ...invoice,
            },
          },
        })),

      reset: () =>
        set({
          data: initialData,
        }),
    }),
    {
      name: "checkout-data",
      version: 2,
      migrate: (persistedState: unknown) => {
        const state = persistedState as { data: Record<string, unknown> } | undefined;
        if (!state?.data || state.data.invoice === undefined) {
          return { data: { ...initialData } };
        }
        return { data: { ...initialData, ...state.data } };
      },
    }
  )
);
