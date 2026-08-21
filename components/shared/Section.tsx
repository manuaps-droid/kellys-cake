type SectionProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Section({
  children,
  className = "",
}: SectionProps) {
  return (
    <section
      className={`py-24 ${className}`}
    >
      <div className="mx-auto w-full max-w-7xl px-6">
        {children}
      </div>
    </section>
  );
}