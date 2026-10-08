type AttemptRecord = {
  count: number;
  lastAttempt: number;
  blockedUntil: number | null;
};

// Almacén en memoria por clave (email normalizado)
// Máximo 5 intentos fallidos
const MAX_ATTEMPTS = 5;
// Bloqueo de 15 minutos en milisegundos
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
// Ventana de observación: 15 minutos
const WINDOW_DURATION_MS = 15 * 60 * 1000;

const attemptsMap = new Map<string, AttemptRecord>();

function cleanKey(email: string): string {
  return email.trim().toLowerCase();
}

export function checkLoginAttempts(email: string): {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds?: number;
} {
  const key = cleanKey(email);
  const now = Date.now();
  const record = attemptsMap.get(key);

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // Si está actualmente bloqueado
  if (record.blockedUntil && now < record.blockedUntil) {
    const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
    };
  }

  // Si ya pasó el bloqueo o la ventana de observación, resetear
  if (now - record.lastAttempt > WINDOW_DURATION_MS) {
    attemptsMap.delete(key);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - record.count);
  return {
    allowed: remaining > 0,
    remainingAttempts: remaining,
  };
}

export function registerFailedLoginAttempt(email: string): {
  isBlocked: boolean;
  remainingAttempts: number;
  retryAfterMinutes?: number;
} {
  const key = cleanKey(email);
  const now = Date.now();
  const record = attemptsMap.get(key) || { count: 0, lastAttempt: now, blockedUntil: null };

  // Si ya pasó la ventana anterior, empezar conteo nuevo
  if (now - record.lastAttempt > WINDOW_DURATION_MS) {
    record.count = 0;
    record.blockedUntil = null;
  }

  record.count += 1;
  record.lastAttempt = now;

  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = now + LOCKOUT_DURATION_MS;
    attemptsMap.set(key, record);
    return {
      isBlocked: true,
      remainingAttempts: 0,
      retryAfterMinutes: Math.ceil(LOCKOUT_DURATION_MS / 60000),
    };
  }

  attemptsMap.set(key, record);
  return {
    isBlocked: false,
    remainingAttempts: MAX_ATTEMPTS - record.count,
  };
}

export function resetLoginAttempts(email: string): void {
  const key = cleanKey(email);
  attemptsMap.delete(key);
}
