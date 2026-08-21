import AuthCard from "@/features/auth/components/AuthCard";
import RegisterForm from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Crear cuenta"
      description="Regístrate en Kelly's Cake para realizar tus pedidos."
    >
      <RegisterForm />
    </AuthCard>
  );
}