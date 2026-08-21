type SectionTitleProps = {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
};

export default function SectionTitle({
  title,
  subtitle,
  align = "center",
}: SectionTitleProps) {
  return (
    <div
      className={align === "center" ? "text-center" : "text-left"}
    >
      <div
        className={`flex items-center gap-4 ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        <span className="h-px w-12 bg-kc-rose-gold" />
        <h2 className="font-[family-name:var(--font-playfair)] text-4xl font-semibold tracking-tight text-kc-charcoal lg:text-5xl">
          {title}
        </h2>
        <span className="h-px w-12 bg-kc-rose-gold" />
      </div>

      {subtitle && (
        <p className="mt-4 text-lg leading-relaxed text-kc-mocha">
          {subtitle}
        </p>
      )}
    </div>
  );
}
