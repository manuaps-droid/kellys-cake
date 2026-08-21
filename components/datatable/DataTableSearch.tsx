"use client";

import { useEffect, useState } from "react";

import { Search } from "lucide-react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

type DataTableSearchProps = {
  placeholder?: string;
};

export default function DataTableSearch({
  placeholder = "Buscar...",
}: DataTableSearchProps) {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams =
    useSearchParams();

  const [value, setValue] =
    useState(
      searchParams.get("search") ?? ""
    );

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(
        searchParams.toString()
      );

      if (value.trim()) {
        params.set("search", value);
      } else {
        params.delete("search");
      }

      router.replace(
        `${pathname}?${params.toString()}`
      );
    }, 400);

    return () =>
      clearTimeout(timeout);
  }, [
    value,
    pathname,
    router,
    searchParams,
  ]);

  return (
    <div className="relative w-full max-w-sm">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="text"
        value={value}
        onChange={(e) =>
          setValue(e.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 outline-none transition focus:border-cake-gold"
      />
    </div>
  );
}