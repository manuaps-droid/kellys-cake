import { ChatUI } from "@/features/copilot/components/ChatUI";

export default function CopilotPage() {
  return (
    <div className="p-6 h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          ✨ FoodOS AI Copilot
        </h1>
        <p className="text-gray-500 text-sm">Tu experto financiero impulsado por IA, conectado directamente a tu base de datos de costos.</p>
      </div>
      <ChatUI />
    </div>
  );
}
