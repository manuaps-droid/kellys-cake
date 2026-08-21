type SpinnerProps = {
  size?: number;

  className?: string;
};

export default function Spinner({
  size = 20,
  className = "",
}: SpinnerProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
      }}
      className={[
        "inline-block animate-spin rounded-full border-2 border-gray-300 border-t-[#D8B07A]",
        className,
      ].join(" ")}
    />
  );
}