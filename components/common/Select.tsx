"use client";

import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

type SelectSize = "sm" | "md" | "lg";

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  size?: SelectSize;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export default function Select({
  options,
  value,
  onChange,
  size = "md",
  disabled = false,
  className,
  placeholder = "Seleccionar",
}: SelectProps) {
  const sizeStyles = {
    sm: "py-1 px-2 text-sm rounded",
    md: "py-2 px-3 text rounded",
    lg: "py-3 px-4 text-lg rounded",
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "absolute left-0 inset-y-0 pl-3 pointer-events-none",
          sizeStyles[size]
        )}
      >
        {/* Placeholder icon would go here */}
      </div>

      <select
        onChange={(e) => onChange(e.target.value)}
        value={value}
        disabled={disabled}
        className={cn(
          "block w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}