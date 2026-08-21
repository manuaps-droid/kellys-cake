"use client";

import { Button } from "@/components/ui/Button";

type Props = {
  onRename: () => void;
  onEditAlt: () => void;
  onCopy: () => void;
  onDelete: () => void;
};

export default function MediaActions({
  onRename,
  onEditAlt,
  onCopy,
  onDelete,
}: Props) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onRename}
      >
        Renombrar
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onEditAlt}
      >
        ALT
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onCopy}
      >
        Copiar URL
      </Button>

      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={onDelete}
      >
        Eliminar
      </Button>
    </div>
  );
}