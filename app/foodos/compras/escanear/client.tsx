"use client";

import { useState, useCallback } from "react";
import { FacturaUploader } from "@/features/compras/components/FacturaUploader";
import { FacturaReview } from "@/features/compras/components/FacturaReview";

export function EscanearFacturaClient({
  ingredientes,
  almacenes = []
}: {
  ingredientes: Array<{ id: string; nombre: string }>;
  almacenes?: Array<{ id: string; nombre: string; es_principal?: boolean }>;
}) {
  const [ocrResult, setOcrResult] = useState<any | null>(null);

  const handleResult = useCallback((data: any) => {
    setOcrResult(data);
  }, []);

  const handleBack = useCallback(() => {
    setOcrResult(null);
  }, []);

  if (ocrResult) {
    return (
      <FacturaReview
        data={ocrResult}
        ingredientes={ingredientes}
        almacenes={almacenes}
        onBack={handleBack}
      />
    );
  }

  return <FacturaUploader onResult={handleResult} />;
}
