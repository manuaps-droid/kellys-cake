import AuthCard from "@/features/auth/components/AuthCard";
import RegisterForm from "@/features/auth/components/RegisterForm";

type PageProps = {
  searchParams: Promise<{
    ref?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: PageProps) {
  const { ref } = await searchParams;

  return (
    <AuthCard
      title="Crear cuenta"
      description={
        ref
          ? "¡Te invitaron! Regístrate y obtén 10% de descuento en tu primera compra."
          : "Regístrate en Kelly's Cake para realizar tus pedidos."
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}