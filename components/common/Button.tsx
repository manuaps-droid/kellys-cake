"use client";

import { cn } from "@/lib/utils";

type ButtonSize = "sm" | "md" | "lg";
type ButtonVariant = "default" | "primary" | "secondary" | "danger" | "ghost";
type ButtonType = "button" | "submit" | "reset";

interface ButtonProps {
  children: React.ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
  type?: ButtonType;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function Button({
  children,
  size = "md",
  variant = "primary",
  type = "button",
  disabled = false,
  className,
  onClick,
}: ButtonProps) {
  const sizeStyles = {
    sm: "h-8 px-3 text-sm rounded",
    md: "h-10 px-4 text rounded",
    lg: "h-12 px-6 text-lg rounded",
  };

  const variantStyles = {
    default:
      "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50",
    primary:
      "bg-kc-charcoal text-white border-kc-charcoal hover:bg-kc-charcoal-dark",
    secondary:
      "bg-gray-200 text-gray-700 border border-gray-300 hover:bg-gray-300",
    danger:
      "bg-red-100 text-red-800 border border-red-200 hover:bg-red-200",
    ghost:
      "bg-transparent text-kc-charcoal underline-offset-4 hover:bg-gray-50",
  };

  const baseClasses = cn(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
    `h-10 px-4 ${sizeStyles[size]}`,
    variantStyles[variant]
  );

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(baseClasses, className)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}