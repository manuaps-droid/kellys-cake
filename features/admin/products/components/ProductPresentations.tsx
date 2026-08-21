"use client";

import { useEffect, useState } from "react";

import {
  deleteProductPresentationAction,
  getProductPresentationsAction,
} from "../actions/product-presentations.actions";

import type { ProductPresentation } from "../types/product-presentation";

import ProductPresentationTable from "./presentations/ProductPresentationTable";
import ProductPresentationDialog from "./presentations/ProductPresentationDialog";

type Props = {
  productId: string;
};

export default function ProductPresentations({
  productId,
}: Props) {
  const [presentations, setPresentations] = useState<
    ProductPresentation[]
  >([]);

  const [open, setOpen] = useState(false);

  const [selected, setSelected] = useState<
    ProductPresentation | undefined
  >(undefined);

  async function loadPresentations() {
    const data =
      await getProductPresentationsAction(
        productId
      );

    setPresentations(data);
  }

  useEffect(() => {
    loadPresentations();
  }, [productId]);

  async function handleDelete(
    presentation: ProductPresentation
  ) {
    if (
      !confirm(
        "¿Eliminar esta presentación?"
      )
    ) {
      return;
    }

    await deleteProductPresentationAction(
      presentation.id
    );

    await loadPresentations();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setSelected(undefined);
            setOpen(true);
          }}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          Nueva presentación
        </button>
      </div>

      <ProductPresentationTable
        presentations={presentations}
        onEdit={(presentation) => {
          setSelected(presentation);
          setOpen(true);
        }}
        onDelete={handleDelete}
      />

      <ProductPresentationDialog
        open={open}
        productId={productId}
        presentation={selected}
        onClose={() => {
          setOpen(false);
          setSelected(undefined);
        }}
        onSaved={loadPresentations}
      />
    </div>
  );
}