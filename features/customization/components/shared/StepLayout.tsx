type StepLayoutProps = {
  children: React.ReactNode;
};

export default function StepLayout({
  children,
}: StepLayoutProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 lg:py-20">
      {children}
    </section>
  );
}