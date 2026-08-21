import type { ReactNode } from "react";

type DataTableProps = {
  children: ReactNode;
};

export default function DataTable({
  children,
}: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          {children}
        </table>
      </div>
    </div>
  );
}