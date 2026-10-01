"use client";

import { cn } from "@/lib/utils";

type AlertVariants = "default" | "success" | "error" | "warning";

interface AlertProps {
  type?: AlertVariants;
  description?: string;
  className?: string;
}

export default function Alert({
  type = "default",
  description,
  className,
}: AlertProps) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800 border-green-200",
    error: "bg-red-100 text-red-800 border-red-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };

  return (
    <div
      role="alert"
      className={cn(
        "rounded-md border p-4 mb-4",
        variants[type],
        className
      )}
    >
      {description && <p className="text-sm">{description}</p>}
    </div>
  );
}