"use client";

import type { ProductPresentation } from "../../types/product-presentation";
import ProductPresentationRow from "./ProductPresentationRow";

type Props = {
  presentations: ProductPresentation[];
  onEdit: (presentation: ProductPresentation) => void;
  onDelete: (presentation: ProductPresentation) => void;
};

export default function ProductPresentationTable({
  presentations,
  onEdit,
  onDelete,
}: Props) {
  if (presentations.length === 0) {
    return (
      <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
        No existen presentaciones para este producto.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left">
              Nombre
            </th>

            <th className="px-4 py-3 text-right">
              Precio
            </th>

            <th className="px-4 py-3 text-right">
              Stock
            </th>

            <th className="px-4 py-3 text-right">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody>
          {presentations.map((presentation) => (
            <ProductPresentationRow
              key={presentation.id}
              presentation={presentation}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}