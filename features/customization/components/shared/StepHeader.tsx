type StepHeaderProps = {
  step: number;

  total: number;

  title: string;

  description: string;
};

export default function StepHeader({
  step,
  total,
  title,
  description,
}: StepHeaderProps) {
  return (
    <>
      <span className="text-sm font-semibold uppercase tracking-widest text-[#D8B07A]">
        Paso {step} de {total}
      </span>

      <h1 className="mt-4 font-playfair text-5xl font-bold text-[#0B1423]">
        {title}
      </h1>

      <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
        {description}
      </p>
    </>
  );
}