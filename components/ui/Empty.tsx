import type { ReactNode } from "react";

type EmptyProps = {
  title: string;

  description?: string;

  action?: ReactNode;
};

export default function Empty({
  title,
  description,
  action,
}: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-8 py-16 text-center">
      <h2 className="text-2xl font-semibold text-[#0B1423]">
        {title}
      </h2>

      {description && (
        <p className="mt-3 max-w-lg text-gray-500">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-8">
          {action}
        </div>
      )}
    </div>
  );
}