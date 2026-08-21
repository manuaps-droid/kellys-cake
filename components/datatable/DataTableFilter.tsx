"use client";

import type { ReactNode } from "react";

type DataTableFilterProps = {
  label: string;

  children: ReactNode;
};

export default function DataTableFilter({
  label,
  children,
}: DataTableFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-600">
        {label}
      </label>

      {children}
    </div>
  );
}