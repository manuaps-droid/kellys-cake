import { cookies, headers } from "next/headers";
import { getConfigRepository, updateConfigRepository } from "@/features/admin/configuracion/repositories/config.repository";
import type {
  SeguridadDispositivosConfig,
  DispositivoItem,
} from "@/features/admin/configuracion/validations/config.schema";

const DEVICE_COOKIE_NAME = "kc_device_token";

/**
 * Obtiene la configuración actual de seguridad de dispositivos.
 */
export async function getSeguridadDispositivosConfig(): Promise<SeguridadDispositivosConfig> {
  const result = await getConfigRepository("seguridad_dispositivos");
  return (
    (result.seguridad_dispositivos as SeguridadDispositivosConfig) ?? {
      restringir_acceso: true,
      clave_maestra: "KELLY-2026-SEGURA",
      max_dispositivos: 3,
      dispositivos: [],
    }
  );
}

/**
 * Comprueba si la solicitud actual proviene de uno de los 3 equipos autorizados.
 */
export async function isCurrentDeviceAuthorized(): Promise<{
  authorized: boolean;
  device?: DispositivoItem;
  config: SeguridadDispositivosConfig;
}> {
  const config = await getSeguridadDispositivosConfig();

  // Si la restricción está desactivada manualmente
  if (!config.restringir_acceso) {
    return { authorized: true, config };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(DEVICE_COOKIE_NAME)?.value;

  if (!token) {
    return { authorized: false, config };
  }

  const device = config.dispositivos.find(
    (d) => d.token === token && d.activo !== false
  );

  if (!device) {
    return { authorized: false, config };
  }

  return { authorized: true, device, config };
}

/**
 * Registra y autoriza el dispositivo actual (siempre que no supere los 3 equipos).
 */
export async function registerCurrentDevice(data: {
  nombre: string;
  claveMaestra: string;
  tipo?: "pc" | "android" | "otro";
}): Promise<{ success: boolean; message: string; device?: DispositivoItem }> {
  const config = await getSeguridadDispositivosConfig();

  // 1. Validar clave maestra
  if (data.claveMaestra.trim() !== config.clave_maestra.trim()) {
    return {
      success: false,
      message: "La clave maestra de seguridad es incorrecta.",
    };
  }

  // 2. Comprobar límite de equipos
  const activos = config.dispositivos.filter((d) => d.activo !== false);
  if (activos.length >= config.max_dispositivos) {
    return {
      success: false,
      message: `Ya se alcanzó el límite máximo de ${config.max_dispositivos} equipos autorizados. Debes desvincular uno para autorizar este equipo.`,
    };
  }

  // 3. Extraer metadata de red
  const headerList = await headers();
  const userAgent = headerList.get("user-agent") || "Desconocido";
  const forwardedFor = headerList.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

  // Detección automática del tipo si no se especificó
  let detectedType: "pc" | "android" | "otro" = data.tipo || "pc";
  if (!data.tipo) {
    if (/android/i.test(userAgent)) detectedType = "android";
    else if (/windows|macintosh|linux/i.test(userAgent)) detectedType = "pc";
    else detectedType = "otro";
  }

  // 4. Generar token criptográfico único
  const deviceToken = `kc_dev_${crypto.randomUUID().replace(/-/g, "")}`;
  const now = new Date().toISOString();

  const newDevice: DispositivoItem = {
    id: crypto.randomUUID(),
    token: deviceToken,
    nombre: data.nombre.trim() || (detectedType === "android" ? "Celular Android" : "PC Principal"),
    tipo: detectedType,
    ip,
    userAgent: userAgent.slice(0, 120),
    creadoEn: now,
    ultimoAcceso: now,
    activo: true,
  };

  const updatedConfig: SeguridadDispositivosConfig = {
    ...config,
    dispositivos: [...config.dispositivos, newDevice],
  };

  await updateConfigRepository("seguridad_dispositivos", updatedConfig);

  // 5. Asignar cookie permanente (10 años de vigencia)
  const cookieStore = await cookies();
  cookieStore.set(DEVICE_COOKIE_NAME, deviceToken, {
    maxAge: 60 * 60 * 24 * 365 * 10, // 10 años
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return {
    success: true,
    message: "¡Equipo vinculado y autorizado con éxito!",
    device: newDevice,
  };
}

/**
 * Revoca un dispositivo por ID.
 */
export async function revokeDevice(deviceId: string): Promise<{ success: boolean; message: string }> {
  const config = await getSeguridadDispositivosConfig();
  const updated = config.dispositivos.filter((d) => d.id !== deviceId);

  await updateConfigRepository("seguridad_dispositivos", {
    ...config,
    dispositivos: updated,
  });

  return { success: true, message: "Dispositivo desvinculado con éxito." };
}

/**
 * Actualiza la clave maestra de seguridad.
 */
export async function updateClaveMaestra(nuevaClave: string): Promise<{ success: boolean; message: string }> {
  if (!nuevaClave || nuevaClave.trim().length < 4) {
    return { success: false, message: "La clave debe tener al menos 4 caracteres." };
  }

  const config = await getSeguridadDispositivosConfig();
  await updateConfigRepository("seguridad_dispositivos", {
    ...config,
    clave_maestra: nuevaClave.trim(),
  });

  return { success: true, message: "Clave maestra actualizada correctamente." };
}

/**
 * Alterna la restricción activa/inactiva.
 */
export async function toggleRestriccionDispositivos(activar: boolean): Promise<{ success: boolean; message: string }> {
  const config = await getSeguridadDispositivosConfig();
  await updateConfigRepository("seguridad_dispositivos", {
    ...config,
    restringir_acceso: activar,
  });

  return {
    success: true,
    message: activar
      ? "Restricción por dispositivo activada."
      : "Restricción por dispositivo desactivada temporalmente.",
  };
}
