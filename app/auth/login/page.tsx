import AuthCard from "@/features/auth/components/AuthCard";
import LoginForm from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <AuthCard
      title="Iniciar sesión"
      description="Accede a tu cuenta de Kelly's Cake."
    >
      <LoginForm />
    </AuthCard>
  );
}