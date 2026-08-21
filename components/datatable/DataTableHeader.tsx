import type { ReactNode } from "react";

type DataTableHeaderProps = {
  children: ReactNode;
};

export default function DataTableHeader({
  children,
}: DataTableHeaderProps) {
  return (
    <thead className="border-b bg-gray-50">
      {children}
    </thead>
  );
}