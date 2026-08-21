"use client";

export default function StepNavigation({
  onBack,
  onNext,
  nextDisabled = false,
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-14 flex justify-between">
      <button
        type="button"
        onClick={onBack}
        className="rounded-lg border px-6 py-3"
      >
        Atrás
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="rounded-lg bg-black px-6 py-3 text-white disabled:opacity-50"
      >
        Continuar
      </button>
    </div>
  );
}