import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;

  className?: string;

  hover?: boolean;
};

export default function Card({
  children,
  className = "",
  hover = false,
}: CardProps) {
  return (
    <div
      className={[
        "rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all",
        hover
          ? "hover:-translate-y-1 hover:shadow-lg"
          : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}