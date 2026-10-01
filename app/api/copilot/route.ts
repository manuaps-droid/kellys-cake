import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const cookieStore = await cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: { get(name: string) { return cookieStore.get(name)?.value; } }
    });

    // 1. Autenticación
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { data: cliente } = await supabase
      .from('clientes')
      .select('nombre, rol')
      .eq('user_id', user.id)
      .maybeSingle();

    if (cliente?.rol !== 'admin') {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!tenant?.id) return NextResponse.json({ error: "Tenant no encontrado" }, { status: 403 });

    const tenantId = tenant.id;
    const nombreUsuario = cliente?.nombre || "Chef";

    // 2. Extracción de Contexto del Negocio (RAG Dinámico)
    const { data: productos } = await supabase
      .from('foodos_productos')
      .select('nombre, precio_venta, precio_costo, margen_porcentaje')
      .eq('tenant_id', tenantId);

    const contextoFinanciero = productos?.map(p => 
      `- ${p.nombre}: Venta S/${p.precio_venta} | Costo S/${p.precio_costo} | Margen: ${p.margen_porcentaje}%`
    ).join("\n") || "No hay productos registrados.";

    // 3. System Prompt Maestral
    const systemPrompt = `
Eres FoodOS Copilot, un asesor experto en gastronomía y finanzas para pastelerías y restaurantes.
Estás hablando con ${nombreUsuario}.

Este es el catálogo de productos actual de su negocio con costos y márgenes 100% reales extraídos de su base de datos:
${contextoFinanciero}

Tu objetivo es responder sus preguntas basándote ESTRICTAMENTE en estos datos financieros.
Da respuestas directas, profesionales y enfocadas en mejorar su rentabilidad.
    `.trim();

    // =====================================================================
    // ZONA DE CONEXIÓN SLM / LLM (Plug-and-Play)
    // =====================================================================
    // Aquí puedes conectar tu modelo local (Ollama) o una API como OpenAI.
    // Ejemplo de cómo se haría con OpenAI:
    /*
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: message }]
      })
    });
    const data = await response.json();
    const iaResponse = data.choices[0].message.content;
    */

    // SIMULACIÓN MVP PARA FOODOS (Quita esto cuando conectes tu IA)
    console.log("[FoodOS AI] System Prompt inyectado:\n", systemPrompt);
    let iaResponse = "He analizado tus datos. ";
    if (message.toLowerCase().includes("rentable") || message.toLowerCase().includes("margen")) {
      iaResponse += "Basado en tu base de datos actual, te sugiero revisar tus productos y priorizar la venta de aquellos que superen el 50% de margen. Puedes ver los detalles exactos en tu Dashboard.";
    } else {
      iaResponse += "Estoy conectado a tu base de datos y veo tu catálogo. (Nota: Para respuestas dinámicas, conecta tu API Key o Servidor Local de IA en app/api/copilot/route.ts).";
    }
    // =====================================================================

    return NextResponse.json({ reply: iaResponse });

  } catch (error) {
    console.error("Error en Copilot API:", error);
    return NextResponse.json({ error: "Error procesando tu mensaje" }, { status: 500 });
  }
}


