import type { ReactNode } from "react";

type DataTableActionsProps = {
  children: ReactNode;
};

export default function DataTableActions({
  children,
}: DataTableActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      {children}
    </div>
  );
}