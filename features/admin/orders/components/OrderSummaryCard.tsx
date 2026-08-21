import Card from "@/components/ui/Card";
import Price from "@/components/ui/Price";

type Props = {
  subtotal: number;
  envio: number;
  total: number;
};

export default function OrderSummaryCard({
  subtotal,
  envio,
  total,
}: Props) {
  return (
    <Card>
      <h2 className="mb-6 text-xl font-semibold">
        Resumen
      </h2>

      <div className="space-y-4">
        <div className="flex justify-between">
          <span>Subtotal</span>

          <Price value={subtotal} />
        </div>

        <div className="flex justify-between">
          <span>Envío</span>

          <Price value={envio} />
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>

            <Price value={total} />
          </div>
        </div>
      </div>
    </Card>
  );
}