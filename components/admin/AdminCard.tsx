import type { ReactNode } from "react";

type AdminCardProps = {
  title?: string;

  description?: string;

  children: ReactNode;

  actions?: ReactNode;
};

export default function AdminCard({
  title,
  description,
  children,
  actions,
}: AdminCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {(title || description || actions) && (
        <div className="flex items-start justify-between border-b border-gray-100 p-6">
          <div>
            {title && (
              <h3 className="text-xl font-semibold text-cake-espresso">
                {title}
              </h3>
            )}

            {description && (
              <p className="mt-2 text-sm text-gray-500">
                {description}
              </p>
            )}
          </div>

          {actions}
        </div>
      )}

      <div className="p-6">
        {children}
      </div>
    </div>
  );
}