import type { ReactNode } from "react";

type Variant =
  | "info"
  | "success"
  | "warning"
  | "danger";

type AlertProps = {
  title?: string;

  children: ReactNode;

  variant?: Variant;
};

const variants = {
  info: {
    container:
      "border-blue-200 bg-blue-50",
    title: "text-blue-900",
    body: "text-blue-700",
  },

  success: {
    container:
      "border-green-200 bg-green-50",
    title: "text-green-900",
    body: "text-green-700",
  },

  warning: {
    container:
      "border-yellow-200 bg-yellow-50",
    title: "text-yellow-900",
    body: "text-yellow-700",
  },

  danger: {
    container:
      "border-red-200 bg-red-50",
    title: "text-red-900",
    body: "text-red-700",
  },
};

export default function Alert({
  title,
  children,
  variant = "info",
}: AlertProps) {
  const styles =
    variants[variant];

  return (
    <div
      className={`rounded-2xl border p-5 ${styles.container}`}
    >
      {title && (
        <h3
          className={`font-semibold ${styles.title}`}
        >
          {title}
        </h3>
      )}

      <div
        className={`mt-1 text-sm ${styles.body}`}
      >
        {children}
      </div>
    </div>
  );
}