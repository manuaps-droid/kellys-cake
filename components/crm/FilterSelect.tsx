type Option = {
  label: string;

  value: string;
};

type FilterSelectProps = {
  value?: string;

  options: Option[];

  onChange?: (
    value: string
  ) => void;
};

export default function FilterSelect({
  value = "",
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) =>
        onChange?.(e.target.value)
      }
      className="rounded-xl border border-gray-200 bg-white px-4 py-2 outline-none transition focus:border-cake-gold"
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}