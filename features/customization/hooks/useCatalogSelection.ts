"use client";

import { useEffect, useRef, useState } from "react";

import type { CatalogOption } from "../types/catalog.types";

type LoadFunction = () => Promise<{
  success: boolean;
  flavors?: CatalogOption[];
  fillings?: CatalogOption[];
  frostings?: CatalogOption[];
}>;

type Config = {
  loader: LoadFunction;
  key: "flavors" | "fillings" | "frostings";
};

export function useCatalogSelection({
  loader,
  key,
}: Config) {
  const [options, setOptions] = useState<CatalogOption[]>([]);
  const loaderRef = useRef(loader);

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await loaderRef.current();
      if (cancelled || !result.success) return;

      const data =
        key === "flavors"
          ? result.flavors
          : key === "fillings"
          ? result.fillings
          : result.frostings;

      setOptions(data ?? []);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [key]);

  return options;
}
