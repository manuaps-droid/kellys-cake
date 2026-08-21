"use client";

import { ArrowUpDown } from "lucide-react";

type DataTableSortButtonProps = {
  label: string;

  onClick?: () => void;

  active?: boolean;

  direction?: "asc" | "desc";
};

export default function DataTableSortButton({
  label,
  onClick,
  active = false,
  direction = "asc",
}: DataTableSortButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 font-semibold transition-colors",
        active
          ? "text-cake-gold"
          : "text-gray-700 hover:text-cake-gold",
      ].join(" ")}
    >
      <span>{label}</span>

      <ArrowUpDown
        size={16}
        className={
          active && direction === "desc"
            ? "rotate-180 transition-transform"
            : "transition-transform"
        }
      />
    </button>
  );
}