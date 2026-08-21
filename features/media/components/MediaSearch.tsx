"use client";

import { Input } from "@/components/ui/Input";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function MediaSearch({
  value,
  onChange,
}: Props) {
  return (
    <Input
      placeholder="Buscar imagen..."
      value={value}
      onChange={(e) =>
        onChange(e.target.value)
      }
    />
  );
}