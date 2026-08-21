"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ASUNTOS = [
  "Cotización personalizada",
  "Consulta sobre productos",
  "Pedido especial",
  "Evento corporativo",
  "Sugerencia",
  "Otro",
];

export default function ContactForm() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    asunto: "",
    mensaje: "",
  });
  const [enviando, setEnviando] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.nombre.trim() || !form.email.trim() || !form.asunto || !form.mensaje.trim()) {
      toast.error("Completa todos los campos obligatorios.");
      return;
    }

    setEnviando(true);

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Mensaje enviado con éxito. Te responderemos pronto.");
      setForm({ nombre: "", email: "", telefono: "", asunto: "", mensaje: "" });
    } catch {
      toast.error("Error al enviar. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm text-gray-800 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F6] via-white to-[#FFF8F6]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-400">
            Conversemos
          </span>

          <h1 className="mt-6 font-playfair text-5xl font-bold leading-tight text-[#1A0F0A]">
            Cuéntanos tu idea
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-500">
            Estamos a un mensaje de distancia. Cuéntanos qué necesitas y te responderemos en menos de 24 horas.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mx-auto mt-16 max-w-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-rose-100 bg-white/80 p-10 shadow-xl shadow-rose-100/50 backdrop-blur-sm">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#1A0F0A]">
                  Nombre <span className="text-rose-400">*</span>
                </label>
                <input value={form.nombre} onChange={(e) => update("nombre", e.target.value)} placeholder="¿Cómo te llamas?" className={inputClass} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1A0F0A]">
                  Correo <span className="text-rose-400">*</span>
                </label>
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="tu@correo.com" className={inputClass} />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#1A0F0A]">
                  Teléfono <span className="text-xs text-gray-400">(opcional)</span>
                </label>
                <input type="tel" value={form.telefono} onChange={(e) => update("telefono", e.target.value)} placeholder="999 888 777" className={inputClass} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1A0F0A]">
                  Asunto <span className="text-rose-400">*</span>
                </label>
                <select value={form.asunto} onChange={(e) => update("asunto", e.target.value)} className={`${inputClass} appearance-none`}>
                  <option value="">Selecciona un asunto</option>
                  {ASUNTOS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#1A0F0A]">
                Mensaje <span className="text-rose-400">*</span>
              </label>
              <textarea rows={5} value={form.mensaje} onChange={(e) => update("mensaje", e.target.value)}
                placeholder="Cuéntanos en detalle lo que necesitas... ¿Para qué ocasión? ¿Qué estilo te gusta? ¿Cuántas personas?"
                className={`${inputClass} resize-y`}
              />
            </div>

            <button type="submit" disabled={enviando}
              className="w-full rounded-xl bg-[#1A0F0A] py-4 text-sm font-semibold tracking-wide text-white transition-all duration-300 hover:bg-[#D8B07A] hover:shadow-lg hover:shadow-rose-200/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviando ? "Enviando..." : "Enviar mensaje"}
            </button>

            <p className="text-center text-xs text-gray-400">
              Te responderemos en menos de 24 horas hábiles. Tus datos están protegidos.
            </p>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mx-auto mt-16 grid max-w-3xl gap-8 text-center md:grid-cols-3"
        >
          <div className="rounded-2xl bg-white/60 p-6">
            <p className="text-2xl font-bold text-[#D8B07A]">&lt; 24h</p>
            <p className="mt-1 text-sm text-gray-500">Tiempo de respuesta</p>
          </div>

          <div className="rounded-2xl bg-white/60 p-6">
            <p className="text-2xl font-bold text-[#D8B07A]">Diseño único</p>
            <p className="mt-1 text-sm text-gray-500">Cada pastel es una pieza exclusiva</p>
          </div>

          <div className="rounded-2xl bg-white/60 p-6">
            <p className="text-2xl font-bold text-[#D8B07A]">Premium</p>
            <p className="mt-1 text-sm text-gray-500">Ingredientes de primera calidad</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
