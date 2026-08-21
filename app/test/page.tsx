import { createClient } from "@/lib/supabase/server";

export default async function TestPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  return (
    <main className="mx-auto max-w-3xl p-10">
      <h1 className="mb-6 text-3xl font-bold">
        Prueba de conexión con Supabase
      </h1>

      <pre className="rounded-lg bg-gray-100 p-4">
        {JSON.stringify(
          {
            user: data.user,
            error: error?.message,
          },
          null,
          2
        )}
      </pre>
    </main>
  );
}