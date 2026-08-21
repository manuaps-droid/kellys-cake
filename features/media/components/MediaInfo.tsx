"use client";

type Props = {
  nombre: string;
  carpeta: string;
};

export default function MediaInfo({
  nombre,
  carpeta,
}: Props) {
  return (
    <>
      <p className="truncate text-sm font-semibold">
        {nombre}
      </p>

      <p className="text-xs text-gray-500">
        {carpeta}
      </p>
    </>
  );
}