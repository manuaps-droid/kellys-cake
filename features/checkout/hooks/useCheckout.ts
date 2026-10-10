import { useCheckoutStore } from "../store/checkout.store";

export function useCheckout() {
  const {
    data,
    prefillCustomer,
    updateCustomer,
    updateAddress,
    setDeliveryInfo,
    setDeliveryMethod,
    setDeliverySchedule,
    setPaymentMethod,
    setPaymentType,
    setPaymentReference,
    setNeedsInvoice,
    updateInvoice,
    reset,
  } = useCheckoutStore();

  return {
    checkout: data,

    prefillCustomer,

    updateCustomer,

    updateAddress,

    setDeliveryInfo,

    setDeliveryMethod,

    setDeliverySchedule,

    setPaymentMethod,

    setPaymentType,

    setPaymentReference,

    setNeedsInvoice,

    updateInvoice,

    reset,
  };
}
