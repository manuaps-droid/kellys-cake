import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOrderService } from "@/features/checkout/services/checkout.service";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "No autorizado." },
        { status: 401 }
      );
    }

    // 2. Parse and validate body
    const body = await request.json();
    const { token, currency = "PEN", email, description, deliveryFee, tipoPago } = body;

    if (!token || !email) {
      return NextResponse.json(
        { success: false, message: "Datos incompletos." },
        { status: 400 }
      );
    }

    // 3. Recalcular el monto de forma autoritativa en el servidor (Anti-Price Tampering)
    let finalAmount: number;
    try {
      const orderData = await createOrderService(Math.max(0, Number(deliveryFee) || 0));
      const serverTotal = orderData.total;
      const serverAbono = Math.round(serverTotal * 0.5 * 100) / 100;
      finalAmount = tipoPago === "abono" ? serverAbono : serverTotal;
    } catch (cartErr) {
      return NextResponse.json(
        {
          success: false,
          message: cartErr instanceof Error ? cartErr.message : "Error al validar el carrito.",
        },
        { status: 400 }
      );
    }

    const amountInCents = Math.round(finalAmount * 100);

    if (amountInCents < 100) {
      return NextResponse.json(
        { success: false, message: "Monto mínimo: S/ 1.00" },
        { status: 400 }
      );
    }

    // 4. Create charge via Culqi API
    const culqiResponse = await fetch("https://api.culqi.com/v2/charges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CULQI_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: amountInCents,
        currency_code: currency,
        email,
        source_id: token,
        description: description || "Pedido Kelly's Cake",
      }),
    });

    const culqiData = await culqiResponse.json();

    if (!culqiResponse.ok) {
      console.error("Culqi error:", culqiData);

      return NextResponse.json(
        {
          success: false,
          message: culqiData.user_message || "Error al procesar el pago.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      chargeId: culqiData.id,
      reference: culqiData.reference_code,
    });
  } catch (error) {
    console.error("Payment error:", error);

    return NextResponse.json(
      { success: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
