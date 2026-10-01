"use client";

import { useState, useRef, useCallback } from "react";

type OcrResult = {
  proveedor?: string | null;
  ruc?: string | null;
  numero_factura?: string | null;
  fecha?: string | null;
  items: Array<{
    nombre: string;
    cantidad: number;
    unidad?: string;
    precio_unitario?: number;
    precio_total: number;
  }>;
  subtotal?: number | null;
  igv?: number | null;
  total?: number | null;
};

export function FacturaUploader({
  onResult,
}: {
  onResult: (data: OcrResult) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      // Validar que sea imagen
      if (!file.type.startsWith("image/")) {
        setError("Solo se aceptan imágenes (JPG, PNG, WEBP)");
        return;
      }

      // Validar tamaño (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("La imagen es muy grande. Máximo 10MB.");
        return;
      }

      // Preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      // Enviar a la API
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/factura-ocr", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          setError(data.error || "Error al procesar la imagen");
          setIsLoading(false);
          return;
        }

        onResult(data);
      } catch {
        setError("Error de conexión. Intenta de nuevo.");
      }

      setIsLoading(false);
    },
    [onResult]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Zona de drop */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-2xl p-6 sm:p-12 text-center
          transition-all duration-200
          ${isDragging
            ? "border-blue-500 bg-blue-50 scale-[1.02]"
            : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
          }
          ${isLoading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        {/* Input directo a cámara para móviles */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Input estándar para galería / archivos */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {isLoading ? (
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-lg font-semibold text-blue-600">
              Leyendo tu factura con IA...
            </p>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Gemini Flash está analizando cada ítem, cantidad y precio de tu comprobante
            </p>
            {preview && (
              <img
                src={preview}
                alt="Factura subida"
                className="mx-auto mt-4 max-h-48 rounded-xl shadow-md opacity-60 object-contain"
              />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-5xl sm:text-6xl">📸</div>
            <div>
              <p className="text-base sm:text-lg font-bold text-gray-800">
                Sube una foto de tu factura o boleta
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Apunta con buena luz al detalle de productos y precios
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                JPG, PNG o WEBP · Máximo 10MB
              </p>
            </div>

            {/* Botones de acción móvil / desktop */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
              >
                <span>📷 Tomar foto con cámara</span>
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-5 py-3 rounded-xl font-semibold hover:bg-gray-200 border border-gray-300 transition-colors active:scale-95 text-xs sm:text-sm"
              >
                <span>📁 Elegir de galería o archivo</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-start gap-2">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-medium">Error al leer la factura</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
