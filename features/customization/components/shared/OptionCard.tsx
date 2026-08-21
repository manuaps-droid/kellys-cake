type OptionCardProps = {
  title: string;
  description?: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export default function OptionCard({
  title,
  description,
  selected,
  disabled = false,
  onClick,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      className={`rounded-3xl border p-6 text-left transition-all ${
        selected
          ? "border-[#D8B07A] bg-[#D8B07A]/10 shadow-md ring-2 ring-[#D8B07A]"
          : disabled
          ? "cursor-not-allowed border-gray-100 bg-gray-50 opacity-50"
          : "border-gray-200 bg-white hover:border-[#D8B07A] hover:shadow-lg"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className={`text-xl font-semibold ${
          selected ? "text-[#D8B07A]" : "text-[#0B1423]"
        }`}>
          {title}
        </h3>

        {selected && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D8B07A]">
            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
      </div>

      {description && (
        <p className="mt-2 text-sm text-gray-500">
          {description}
        </p>
      )}
    </button>
  );
}
