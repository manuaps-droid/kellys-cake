"use client";

import { useState } from "react";

export default function SeedCategoriasButton() {
  const [loading, setLoading] = useState<"seed" | "delete" | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleSeed() {
    setLoading("seed");
    setMessage(null);
    const res = await fetch("/api/admin/categorias/seed", { method: "POST" });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) {
      setMessage({ type: "error", text: data.error ?? "Error al crear" });
    } else {
      setMessage({ type: "ok", text: `Creadas ${data.created?.length ?? 0} categorías` });
      setTimeout(() => window.location.reload(), 1000);
    }
  }

  async function handleDelete() {
    setLoading("delete");
    setMessage(null);
    const res = await fetch("/api/admin/categorias/seed", { method: "DELETE" });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) {
      setMessage({ type: "error", text: data.error ?? "Error al eliminar" });
    } else {
      setMessage({ type: "ok", text: `Eliminadas ${data.deleted?.length ?? 0} categorías` });
      setTimeout(() => window.location.reload(), 1000);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {message && (
        <span className={`text-sm ${message.type === "ok" ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </span>
      )}
      <button
        onClick={handleSeed}
        disabled={loading !== null}
        className="rounded-xl bg-[#D8B07A] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading === "seed" ? "..." : "Crear catálogos default"}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading !== null}
        className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
      >
        {loading === "delete" ? "..." : "Eliminar"}
      </button>
    </div>
  );
}
