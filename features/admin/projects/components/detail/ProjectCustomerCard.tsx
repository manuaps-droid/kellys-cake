import Card from "@/components/ui/Card";

import type { AdminProjectCustomer } from "../../types/project.type";

type Props = {
  customer: AdminProjectCustomer;
};

export default function ProjectCustomerCard({ customer }: Props) {
  return (
    <Card>
      <h2 className="mb-6 text-xl font-semibold">Cliente</h2>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Nombre</p>
          <p className="font-medium">
            {customer.nombre} {customer.apellidos ?? ""}
          </p>
        </div>

        {customer.correo && (
          <div>
            <p className="text-sm text-gray-500">Correo</p>
            <p>{customer.correo}</p>
          </div>
        )}

        {customer.celular && (
          <div>
            <p className="text-sm text-gray-500">Celular</p>
            <p>{customer.celular}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
