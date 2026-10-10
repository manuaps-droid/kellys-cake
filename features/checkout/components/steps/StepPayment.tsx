import PaymentForm from "./PaymentForm";

export default function StepPayment({ pagoNumero }: { pagoNumero?: string | null }) {
  return <PaymentForm pagoNumero={pagoNumero} />;
}
