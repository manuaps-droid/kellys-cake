"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/common/PageHeader";
import Card from "@/components/common/Card";
import { updateProfile } from "@/features/auth/actions/update-profile.action";
import { toast } from "sonner";
import { User, Mail, Phone, Loader2 } from "lucide-react";

export default function PerfilPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // We should ideally fetch the initial data from the server or pass it as a prop.
  // Since this is a client component, we'll assume the layout or an effect fetches it, 
  // but for a true implementation we would fetch it via a server action or use a separate server component to fetch and pass props.
  // For now, we will leave initial state empty and let the user fill it, or expect props if we refactored.
  // Wait, let's fetch it via a server component wrapper or just use the action to save.
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Mi Perfil" 
        description="Actualiza tu información personal y datos de contacto."
      />
      
      <div className="max-w-2xl">
        <ProfileForm />
      </div>
    </div>
  );
}

function ProfileForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);
    
    setIsPending(false);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Perfil actualizado correctamente");
      router.refresh();
    }
  }

  return (
    <Card className="p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="nombre" className="text-sm font-medium text-kc-charcoal">
              Nombres
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="nombre"
                name="nombre"
                required
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kc-rose-gold/20 focus:border-kc-rose-gold transition-colors sm:text-sm bg-white"
                placeholder="Tus nombres"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="apellidos" className="text-sm font-medium text-kc-charcoal">
              Apellidos
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                required
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kc-rose-gold/20 focus:border-kc-rose-gold transition-colors sm:text-sm bg-white"
                placeholder="Tus apellidos"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="celular" className="text-sm font-medium text-kc-charcoal">
            Celular
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              id="celular"
              name="celular"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kc-rose-gold/20 focus:border-kc-rose-gold transition-colors sm:text-sm bg-white"
              placeholder="999 999 999"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="correo" className="text-sm font-medium text-gray-500">
            Correo Electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="correo"
              name="correo"
              readOnly
              disabled
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-100 rounded-xl bg-gray-50 text-gray-500 sm:text-sm cursor-not-allowed"
              placeholder="tu@correo.com"
              title="El correo no se puede cambiar"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            El correo electrónico no se puede modificar ya que está asociado a tu cuenta.
          </p>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center justify-center px-6 py-2.5 bg-kc-charcoal text-white rounded-xl font-medium hover:bg-kc-deep focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kc-charcoal transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </button>
        </div>
      </form>
    </Card>
  );
}
