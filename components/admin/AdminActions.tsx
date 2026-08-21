import type { ReactNode } from "react";

type AdminActionsProps = {
  children: ReactNode;
};

export default function AdminActions({
  children,
}: AdminActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {children}
    </div>
  );
}