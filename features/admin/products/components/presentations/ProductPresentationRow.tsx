"use client";

import type { ProductPresentation } from "../../types/product-presentation";

type Props = {
  presentation: ProductPresentation;
  onEdit: (presentation: ProductPresentation) => void;
  onDelete: (presentation: ProductPresentation) => void;
};

export default function ProductPresentationRow({
  presentation,
  onEdit,
  onDelete,
}: Props) {
  return (
    <tr className="border-b">
      <td className="px-4 py-3">
        {presentation.nombre}
      </td>

      <td className="px-4 py-3 text-right">
        {presentation.precio}
      </td>

      <td className="px-4 py-3 text-right">
        {presentation.stock ?? "-"}
      </td>

      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() =>
              onEdit(presentation)
            }
            className="text-blue-600 hover:underline"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete(presentation)
            }
            className="text-red-600 hover:underline"
          >
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  );
}