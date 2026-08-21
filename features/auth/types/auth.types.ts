export type AuthProvider = "email";

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordCredentials {
  email: string;
}

export interface UpdatePasswordCredentials {
  password: string;
  confirmPassword: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
}