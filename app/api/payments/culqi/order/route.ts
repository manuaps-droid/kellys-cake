import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createOrderService } from "@/features/checkout/services/checkout.service";

/**
 * Crea una "Order" de Culqi para pagos con billeteras móviles (Plin).
 * El cliente escaneará un QR y el pago se confirma vía webhook
 * (order.status.changed => /api/payments/culqi/webhook).
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "No autorizado." },
        { status: 401 }
      );
    }

    const secret = process.env.CULQI_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { success: false, message: "Configura CULQI_SECRET_KEY en el servidor." },
        { status: 400 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      description?: string;
      deliveryFee?: number;
    };

    const email = body.email || user.email || "";

    // Monto autoritativo desde el carrito del servidor
    const deliveryFee = Math.max(0, Number(body.deliveryFee) || 0);
    const orderData = await createOrderService(deliveryFee);
    const amountInCents = Math.round(orderData.total * 100);

    // Billeteras móviles: mínimo S/ 6 y máximo S/ 500
    if (amountInCents < 600) {
      return NextResponse.json(
        { success: false, message: "El monto mínimo por billetera móvil es S/ 6.00." },
        { status: 400 }
      );
    }
    if (amountInCents > 50000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "El pago con Plin (billetera móvil) admite un máximo de S/ 500. Elige tarjeta o transferencia.",
        },
        { status: 400 }
      );
    }

    const orderNumber = `kc-${Date.now()}`;
    const expiration = Math.floor(Date.now() / 1000) + 30 * 60; // 30 minutos de vigencia del QR

    const culqiRes = await fetch("https://api.culqi.com/v2/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        amount: amountInCents,
        currency_code: "PEN",
        description: body.description || "Pedido Kelly's Cake",
        order_number: orderNumber,
        client_details: { email },
        expiration_date: expiration,
        confirm: true,
      }),
    });

    const data = await culqiRes.json();

    if (!culqiRes.ok || !data?.id) {
      console.error("Culqi order error:", data);
      return NextResponse.json(
        {
          success: false,
          message:
            data?.user_message || data?.merchant_message || "No se pudo crear la orden de pago.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: data.id as string,
      orderNumber,
    });
  } catch (error) {
    console.error("Culqi order route error:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
