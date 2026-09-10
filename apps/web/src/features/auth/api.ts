import { api } from "@/lib/api-client";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  email_verified_at: string | null;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: TokenPair;
}

export const authApi = {
  signUp: (body: {
    full_name: string;
    email: string;
    password: string;
    accepted_terms: boolean;
  }) => api.post<AuthResponse>("/auth/signup", body, { auth: false }),

  logIn: (body: { email: string; password: string; remember_me: boolean }) =>
    api.post<AuthResponse>("/auth/login", body, { auth: false }),

  logOut: () => api.post<void>("/auth/logout"),

  forgotPassword: (body: { email: string }) =>
    api.post<{ status: string }>("/auth/forgot-password", body, { auth: false }),

  resetPassword: (body: { token: string; password: string }) =>
    api.post<{ status: string }>("/auth/reset-password", body, { auth: false }),

  verifyEmail: (body: { code: string }) => api.post<AuthUser>("/auth/verify-email", body),

  resendVerification: () => api.post<{ status: string }>("/auth/verify-email/resend"),

  me: () => api.get<AuthUser>("/users/me"),
};
