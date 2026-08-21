import type { ReactNode } from "react";

import PageHeader from "@/components/common/PageHeader";

type AdminPageProps = {
  title: string;

  description?: string;

  actions?: ReactNode;

  children: ReactNode;
};

export default function AdminPage({
  title,
  description,
  actions,
  children,
}: AdminPageProps) {
  return (
    <section className="space-y-8">
      <PageHeader
        title={title}
        description={description}
        actions={actions}
      />

      {children}
    </section>
  );
}