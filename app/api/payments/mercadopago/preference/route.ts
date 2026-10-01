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
    const { title, email, deliveryFee, tipoPago } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Correo requerido." },
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

    if (finalAmount < 1) {
      return NextResponse.json(
        { success: false, message: "Monto inválido para el pedido." },
        { status: 400 }
      );
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Configura MP_ACCESS_TOKEN en .env.local." },
        { status: 400 }
      );
    }

    // 4. Create checkout preference via Mercado Pago API
    const origin = request.nextUrl.origin;
    const backUrl = `${origin}/checkout/success?mp=1`;
    const webhookUrl = `${origin}/api/payments/mercadopago/webhook`;

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: title || "Pedido Kelly's Cake",
            quantity: 1,
            unit_price: Number(finalAmount.toFixed(2)),
            currency_id: "PEN",
          },
        ],
        payer: { email },
        back_urls: {
          success: backUrl,
          pending: backUrl,
          failure: backUrl,
        },
        auto_return: "approved",
        notification_url: webhookUrl,
      }),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok || !mpData.init_point) {
      console.error("MercadoPago preference error:", mpData);
      return NextResponse.json(
        { success: false, message: mpData.message || "Error al crear el pago." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      init_point: mpData.init_point,
      preferenceId: mpData.id,
    });
  } catch (error) {
    console.error("Preference error:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
