"use client";

export default function ExportButton() {
  async function handleExport() {
    try {
      const res = await fetch(
        "/api/admin/export"
      );

      if (!res.ok) {
        const err =
          await res.json();
        alert(
          err.message ??
            "Error al exportar."
        );

        return;
      }

      const blob =
        await res.blob();
      const url =
        URL.createObjectURL(
          blob
        );
      const a =
        document.createElement(
          "a"
        );
      a.href = url;
      a.download = `kellys-cake-export-${
        new Date()
          .toISOString()
          .split("T")[0]
      }.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert(
        "Error al exportar datos."
      );
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
    >
      Exportar datos
    </button>
  );
}
