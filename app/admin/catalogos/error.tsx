"use client";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({
  error,
  reset,
}: ErrorProps) {
  console.error(error);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">
        Ocurrió un error
      </h2>

      <p className="text-gray-500">
        No se pudo cargar esta página.
      </p>

      <button
        onClick={reset}
        className="rounded-lg bg-cake-espresso px-5 py-3 text-white"
      >
        Reintentar
      </button>
    </div>
  );
}