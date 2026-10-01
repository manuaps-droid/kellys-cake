"use client";

import { cn } from "@/lib/utils";

interface InputProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  labelClassName?: string;
}

export default function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
  className,
  label,
  labelClassName,
}: InputProps) {
  const inputClassName = cn(
    "block w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm",
    disabled && "cursor-not-allowed opacity-50"
  );

  const labelWrapperClassName = cn(
    "block mb-2 text-sm font-medium text-gray-700",
    labelClassName
  );

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor="input" className={labelWrapperClassName}>
          {label}
        </label>
      )}

      <input
        id="input"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={inputClassName}
      />
    </div>
  );
}