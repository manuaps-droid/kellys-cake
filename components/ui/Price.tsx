type PriceProps = {
  value: number;
  className?: string;
  currency?: string;
};

export default function Price({
  value,
  className = "",
  currency = "S/.",
}: PriceProps) {
  return (
    <span
      className={`font-bold text-[#D8B07A] ${className}`}
    >
      {currency} {value.toFixed(2)}
    </span>
  );
}