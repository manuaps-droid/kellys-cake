const SCRIPT_URL = "https://checkout.culqi.com/js/v4";

let scriptPromise: Promise<void> | null = null;

function loadCulqi(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Culqi solo funciona en el navegador."));
  }

  if ((window as any).Culqi?.ready || (window as any).Culqi?.token) {
    return Promise.resolve();
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    // Si ya existe la etiqueta de script en el documento
    const existing = document.querySelector(`script[src="${SCRIPT_URL}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("No se pudo cargar la pasarela de Culqi. Por favor verifica tu conexión o intenta con Yape/Plin."));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

type CulqiChargeOptions = {
  amount: number;
  email: string;
  description?: string;
};

export async function chargeWithCulqi(
  options: CulqiChargeOptions
): Promise<{ token: string }> {
  const publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error("Configura NEXT_PUBLIC_CULQI_PUBLIC_KEY en .env.local.");
  }

  await loadCulqi();

  const Culqi = (window as any).Culqi;

  Culqi.publicKey = publicKey;

  Culqi.settings({
    title: "Kelly's Cake",
    currency: "PEN",
    description: options.description || "Pedido Kelly's Cake",
    amount: Math.round(options.amount * 100),
  });

  // Habilitar medios de pago Culqi Checkout v4: tarjetas y Yape.
  // El flujo Yape (número de celular + código de aprobación) se
  // cobra con el mismo endpoint /v2/charges usando el token generado.
  if (typeof Culqi.options === "function") {
    Culqi.options({
      lang: "es",
      installments: false,
      paymentMethods: {
        tarjeta: true,
        yape: true,
        bancaMovil: false,
        agente: false,
        billetera: false,
        cuotealo: false,
      },
    });
  }

  return new Promise((resolve, reject) => {
    // 1. Manejador para el callback global estándar de Culqi
    (window as any).culqi = function () {
      const CulqiInstance = (window as any).Culqi;
      if (CulqiInstance?.token) {
        const tokenId = CulqiInstance.token.id;
        CulqiInstance.close?.();
        resolve({ token: tokenId });
      } else if (CulqiInstance?.error) {
        const errMsg = CulqiInstance.error.user_message || CulqiInstance.error.merchant_message || "Error al procesar la tarjeta.";
        reject(new Error(errMsg));
      }
    };

    // 2. Manejador para eventos de CustomEvent (v4 moderno)
    function handleEvent(event: any) {
      const detail = event?.detail ?? {};
      const object = detail.object;

      if (object === "token" || detail.id?.startsWith("tkn_")) {
        window.removeEventListener("culqi", handleEvent);
        (window as any).Culqi?.close?.();
        resolve({ token: detail.id });
      } else if (object === "error") {
        window.removeEventListener("culqi", handleEvent);
        reject(new Error(detail.user_message || detail.merchant_message || "Error al procesar la tarjeta."));
      }
    }

    window.addEventListener("culqi", handleEvent);

    // 3. Abrir el modal de checkout de Culqi
    if (typeof Culqi.open === "function") {
      Culqi.open();
    } else if (typeof Culqi.token === "function") {
      Culqi.token();
    } else {
      reject(new Error("No se pudo iniciar el checkout de Culqi."));
    }
  });
}
