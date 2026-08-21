import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <main className="min-h-screen bg-cake-ivory p-10">
      <div className="mx-auto max-w-6xl">

        <h1 className="text-4xl font-bold text-pink-700">
          Bienvenido, {user.user_metadata.nombre ?? "Cliente"} 🎂
        </h1>

        <p className="mt-2 text-gray-600">
          {user.email}
        </p>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-2xl font-semibold">
            Panel del Cliente
          </h2>

          <p className="mt-2 text-gray-500">
            Aquí aparecerán tus pedidos, favoritos y perfil.
          </p>
        </div>

      </div>
    </main>
  );
}