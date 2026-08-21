"use client";

import { useState, useRef, useEffect } from "react";

import { toast } from "sonner";

type Props = {
  projectId: string;
  value: number | null;
};

export default function EditablePresupuesto({
  projectId,
  value,
}: Props) {
  const [editing, setEditing] =
    useState(false);
  const [inputValue, setInputValue] =
    useState(
      value != null
        ? value.toFixed(2)
        : ""
    );
  const inputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  async function save() {
    const trimmed =
      inputValue.trim();

    const nuevo =
      trimmed === ""
        ? null
        : parseFloat(trimmed);

    if (
      nuevo !== null &&
      (isNaN(nuevo) || nuevo < 0)
    ) {
      toast.error(
        "Ingresa un monto válido."
      );
      return;
    }

    setEditing(false);

    const res = await fetch(
      `/api/admin/proyectos/${projectId}/presupuesto`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          presupuesto: nuevo,
        }),
      }
    );

    const result =
      await res.json();

    if (!result.success) {
      toast.error(
        result.message ??
          "No se pudo actualizar."
      );

      setInputValue(
        value != null
          ? value.toFixed(2)
          : ""
      );
    }
  }

  function handleKeyDown(
    e: React.KeyboardEvent
  ) {
    if (e.key === "Enter") {
      save();
    }
    if (e.key === "Escape") {
      setInputValue(
        value != null
          ? value.toFixed(2)
          : ""
      );
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center justify-end gap-1">
        <span className="text-xs text-gray-400">
          S/.
        </span>

        <input
          ref={inputRef}
          type="number"
          step="0.01"
          min="0"
          value={inputValue}
          onChange={(e) =>
            setInputValue(
              e.target.value
            )
          }
          onBlur={save}
          onKeyDown={
            handleKeyDown
          }
          className="w-24 rounded border border-[#D8B07A] px-2 py-1 text-right text-sm font-semibold outline-none"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() =>
        setEditing(true)
      }
      className="cursor-pointer text-right font-semibold hover:text-[#D8B07A]"
      title="Editar presupuesto"
    >
      {value != null
        ? `S/. ${value.toFixed(2)}`
        : "-"}
    </button>
  );
}
