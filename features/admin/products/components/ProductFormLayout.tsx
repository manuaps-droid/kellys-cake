import type { ReactNode } from "react";

import Card from "@/components/ui/Card";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function ProductFormLayout({
  title,
  description,
  children,
}: Props) {
  return (
    <Card className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        )}
      </div>

      {children}
    </Card>
  );
}