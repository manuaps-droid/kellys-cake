import { Search } from "lucide-react";

type SearchInputProps = {
  value?: string;

  placeholder?: string;

  onChange?: (
    value: string
  ) => void;
};

export default function SearchInput({
  value = "",
  placeholder = "Buscar...",
  onChange,
}: SearchInputProps) {
  return (
    <div className="relative w-full max-w-sm">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange?.(e.target.value)
        }
        className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 outline-none transition focus:border-cake-gold"
      />
    </div>
  );
}