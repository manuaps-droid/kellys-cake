import Card from "@/components/ui/Card";

type Props = {
  nombre: string;
  correo?: string | null;
  celular?: string | null;
  direccion?: string | null;
};

export default function OrderCustomerCard({
  nombre,
  correo,
  celular,
  direccion,
}: Props) {
  return (
    <Card>
      <h2 className="mb-6 text-xl font-semibold">
        Cliente
      </h2>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">
            Nombre
          </p>

          <p className="font-medium">
            {nombre}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Correo
          </p>

          <p>
            {correo ?? "-"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Celular
          </p>

          <p>
            {celular ?? "-"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Dirección
          </p>

          <p>
            {direccion ?? "-"}
          </p>
        </div>
      </div>
    </Card>
  );
}