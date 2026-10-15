"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

/** Claves de localStorage usadas por los stores de checkout (Zustand persist). */
const CHECKOUT_STORAGE_KEYS = ["checkout-data", "checkout-wizard"];

/** Limpia el checkout del localStorage para que no persista entre usuarios. */
function clearCheckoutStorage() {
  if (typeof window === "undefined") return;
  CHECKOUT_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Guardamos el ID del usuario anterior para detectar cambios de sesión.
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (mounted) {
        setUser(user);
        setLoading(false);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const incomingUserId = session?.user?.id ?? null;

      // Si el usuario cambió (logout o login con otra cuenta), limpiamos el checkout.
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== incomingUserId
      ) {
        clearCheckoutStorage();
      }

      prevUserIdRef.current = incomingUserId;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}