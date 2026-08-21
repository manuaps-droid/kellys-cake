"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import ProductPresentationFormContainer from "./ProductPresentationFormContainer";

import type { ProductPresentation } from "../../types/product-presentation";

type Props = {
  open: boolean;
  productId: string;
  presentation?: ProductPresentation;
  onClose: () => void;
  onSaved: () => void;
};

export default function ProductPresentationDialog({
  open,
  productId,
  presentation,
  onClose,
  onSaved,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {presentation
              ? "Editar presentación"
              : "Nueva presentación"}
          </DialogTitle>

          <DialogDescription>
            Completa la información de la presentación del producto.
          </DialogDescription>
        </DialogHeader>

        <ProductPresentationFormContainer
          productId={productId}
          presentation={presentation}
          onSuccess={() => {
            onSaved();
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}