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
    const { token, email, description, installments = 1, deliveryFee, tipoPago } = body;

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
      finalAmount = orderData.total;
    } catch (cartErr) {
      return NextResponse.json(
        {
          success: false,
          message: cartErr instanceof Error ? cartErr.message : "Error al validar el carrito.",
        },
        { status: 400 }
      );
    }

    if (finalAmount < 1) {
      return NextResponse.json(
        { success: false, message: "Monto mínimo: S/ 1.00" },
        { status: 400 }
      );
    }

    // 4. Create payment via Mercado Pago API
    const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        "X-Idempotency-Key": `${user.id}-${Date.now()}`,
      },
      body: JSON.stringify({
        transaction_amount: Number(finalAmount.toFixed(2)),
        token,
        description: description || "Pedido Kelly's Cake",
        installments,
        payer: {
          email,
        },
      }),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok || mpData.status === "rejected") {
      console.error("MercadoPago error:", mpData);

      const message =
        mpData.status_detail === "cc_rejected_call_for_authorize"
          ? "Tarjeta rechazada. Contacta a tu banco."
          : mpData.status_detail === "cc_rejected_insufficient_amount"
          ? "Fondos insuficientes."
          : mpData.message || "Error al procesar el pago.";

      return NextResponse.json(
        { success: false, message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: mpData.id,
      status: mpData.status,
      reference: mpData.id?.toString(),
    });
  } catch (error) {
    console.error("Payment error:", error);

    return NextResponse.json(
      { success: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
