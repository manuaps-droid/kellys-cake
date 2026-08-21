import Link from "next/link";

export default function AuthPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cake-ivory px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl">

        <div className="mb-8 text-center">
          <div className="mb-4 text-6xl">
            👤
          </div>

          <h1 className="text-4xl font-bold text-cake-espresso">
            Mi Cuenta
          </h1>

          <p className="mt-3 text-gray-500">
            Bienvenido a Kelly's Cake
          </p>
        </div>

        <div className="space-y-5">

          <Link
            href="/auth/login"
            className="block rounded-xl bg-cake-espresso px-6 py-4 text-center text-lg font-semibold text-white transition hover:bg-cake-chocolate"
          >
            Iniciar sesión
          </Link>

          <Link
            href="/auth/registro"
            className="block rounded-xl border-2 border-cake-gold px-6 py-4 text-center text-lg font-semibold text-cake-gold transition hover:bg-cake-gold hover:text-white"
          >
            Crear una cuenta
          </Link>

        </div>

      </div>
    </main>
  );
}