"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import Alert from "@/components/common/Alert";

import { createProductAction } from "@/features/products/actions/create-product.action";

type Media = {
  id: string;
  url: string;
};

export default function ImageCreationForm() {
  const searchParams = useSearchParams();
  const imageId = searchParams.get("imageId");

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedCatalog, setSelectedCatalog] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Catálogos por defecto
  const defaultCatalogs = [
    { value: "Macarrones", label: "Macarrones" },
    { value: "Alfajores", label: "Alfajores" },
    { value: "Cinta Básica", label: "Cinta Básica" },
    { value: "Cinta Premium", label: "Cinta Premium" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createProductAction({
        id: "temp-uuid",
        nombre: name || `Producto`,
        descripcion: description || "",
        catalogo: selectedCatalog || "Macarrones",
        precio: 0,
        imagen_principal_id: imageId || "",
        estado: "publicado",
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError("Error al crear el producto. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <Alert type="success" description="Producto creado exitosamente y asociado a la imagen." />
    );
  }

  if (error) {
    return <Alert type="error" description={error} />;
  }

  // Si no hay imageId, no mostramos nada (la página padre se encargará)
  if (!imageId) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Crear Producto desde Imagen</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Nombre del producto"
          value={name}
          onChange={(val) => setName(val)}
        />

        <Input
          type="text"
          placeholder="Descripción del producto"
          value={description}
          onChange={(val) => setDescription(val)}
        />

        <Select
          options={defaultCatalogs}
          value={selectedCatalog || ""}
          onChange={(val) => setSelectedCatalog(val)}
          placeholder="Seleccionar catálogo"
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear Producto"}
        </Button>
      </form>
    </div>
  );
}