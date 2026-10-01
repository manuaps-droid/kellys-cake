import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_OCR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
];

const MAX_OCR_SIZE = 8 * 1024 * 1024; // 8 MB

export async function POST(req: Request) {
  try {
    // 1. Validar autenticación
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión en FoodOS para usar el escáner." },
        { status: 401 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY no configurada. Agrega tu API Key gratuita de Google AI Studio en .env.local" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se recibió ninguna imagen" }, { status: 400 });
    }

    // 2. Validar tamaño y tipo de archivo
    if (file.size > MAX_OCR_SIZE) {
      return NextResponse.json(
        { error: "La imagen excede el límite de 8 MB permitidos." },
        { status: 400 }
      );
    }

    if (!ALLOWED_OCR_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato no válido. Solo se permiten imágenes (JPEG, PNG, WebP) o documentos PDF." },
        { status: 400 }
      );
    }

    // Convertir imagen a base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "image/jpeg";

    // Prompt especializado para facturas peruanas
    const prompt = `Eres un experto en leer facturas y boletas de venta peruanas de proveedores de insumos de pastelería y panadería.

Analiza esta imagen de factura/boleta y extrae TODOS los productos listados.

Para cada producto extraído, devuelve:
- "nombre": el nombre del producto tal como aparece en la factura
- "cantidad": la cantidad comprada (número)
- "unidad": la unidad de medida (kg, unidad, litro, caja, saco, bolsa, etc.)
- "precio_unitario": el precio por unidad en soles
- "precio_total": el precio total de esa línea en soles

También extrae los datos generales:
- "proveedor": nombre del proveedor/empresa
- "ruc": número de RUC si aparece
- "numero_factura": número de factura o boleta
- "fecha": fecha del documento (formato YYYY-MM-DD)
- "subtotal": subtotal sin IGV
- "igv": monto del IGV
- "total": total general

IMPORTANTE: 
- Si no puedes leer un valor con certeza, pon null en ese campo.
- Los precios deben ser números decimales (no strings).
- Si la imagen no es una factura o no se puede leer, devuelve un JSON con "error": "No se pudo leer la factura".

Responde SOLAMENTE con el JSON, sin texto adicional.`;

    // Llamada a Gemini Flash API
    const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64,
                },
              },
              { text: prompt },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              error: { type: "STRING", nullable: true },
              proveedor: { type: "STRING", nullable: true },
              ruc: { type: "STRING", nullable: true },
              numero_factura: { type: "STRING", nullable: true },
              fecha: { type: "STRING", nullable: true },
              items: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    nombre: { type: "STRING" },
                    cantidad: { type: "NUMBER" },
                    unidad: { type: "STRING" },
                    precio_unitario: { type: "NUMBER" },
                    precio_total: { type: "NUMBER" },
                  },
                  required: ["nombre", "cantidad", "precio_total"],
                },
              },
              subtotal: { type: "NUMBER", nullable: true },
              igv: { type: "NUMBER", nullable: true },
              total: { type: "NUMBER", nullable: true },
            },
            required: ["items"],
          },
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Error de Gemini API:", errText);
      return NextResponse.json(
        { error: "Error al procesar la imagen con IA. Verifica tu API Key." },
        { status: 502 }
      );
    }

    const geminiData = await geminiResponse.json();

    // Extraer el texto JSON de la respuesta de Gemini
    const responseText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return NextResponse.json(
        { error: "La IA no pudo extraer información de esta imagen" },
        { status: 422 }
      );
    }

    // Parsear el JSON
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        { error: "La IA devolvió un formato inesperado. Intenta con otra foto." },
        { status: 422 }
      );
    }

    if (parsedData.error) {
      return NextResponse.json({ error: parsedData.error }, { status: 422 });
    }

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Error en factura-ocr:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
