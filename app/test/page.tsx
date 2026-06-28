import { supabase } from "@/lib/supabase";

export default async function TestPage() {
  const { data, error } = await supabase.auth.getSession();

  return (
    <main className="mx-auto max-w-3xl p-10">
      <h1 className="mb-6 text-3xl font-bold">
        Prueba de conexión con Supabase
      </h1>

      <pre className="rounded-lg bg-gray-100 p-4">
        {JSON.stringify(
          {
            session: data.session,
            error: error?.message,
          },
          null,
          2
        )}
      </pre>
    </main>
  );
}