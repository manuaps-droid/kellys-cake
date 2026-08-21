import { ArrowUpDown } from "lucide-react";

type SortButtonProps = {
  children: React.ReactNode;

  onClick?: () => void;
};

export default function SortButton({
  children,
  onClick,
}: SortButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 font-semibold transition hover:text-cake-gold"
    >
      {children}

      <ArrowUpDown size={15} />
    </button>
  );
}