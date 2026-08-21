const SCRIPT_URL = "https://js.culqi.com/v3";

let scriptPromise: Promise<void> | null = null;

function loadCulqi(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Culqi solo funciona en el navegador."));
  }

  if ((window as any).Culqi?.ready) {
    return Promise.resolve();
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("No se pudo cargar Culqi. Revisa tu conexión."));
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

  return new Promise((resolve, reject) => {
    function handleEvent(event: any) {
      const detail = event.detail ?? {};
      const object = detail.object;

      if (object === "token") {
        window.removeEventListener("culqi", handleEvent);
        resolve({ token: detail.id });
      } else if (object === "error") {
        window.removeEventListener("culqi", handleEvent);
        reject(new Error(detail.user_message || detail.merchant_message || "Error al procesar la tarjeta."));
      }
    }

    window.addEventListener("culqi", handleEvent);
    Culqi.token();
  });
}
