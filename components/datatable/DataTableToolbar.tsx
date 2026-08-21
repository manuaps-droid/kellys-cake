import type { ReactNode } from "react";

type DataTableToolbarProps = {
  children: ReactNode;
};

export default function DataTableToolbar({
  children,
}: DataTableToolbarProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {children}
    </div>
  );
}