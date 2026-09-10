import { env } from "@/lib/env";

const ACCESS_KEY = "vf.access";
const REFRESH_KEY = "vf.refresh";

type TokenReader = () => Promise<string | null>;

let externalTokenReader: TokenReader | null = null;
let inFlight: Promise<string | null> | null = null;

export function useExternalTokens(reader: TokenReader | null) {
  externalTokenReader = reader;
}

export function storeSession(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export async function getAccessToken() {
  if (externalTokenReader) return externalTokenReader();
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export async function refreshSession() {
  if (externalTokenReader) return externalTokenReader();
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) {
      clearSession();
      return null;
    }

    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      clearSession();
      return null;
    }

    const tokens = await response.json();
    storeSession(tokens.access_token, tokens.refresh_token);
    return tokens.access_token as string;
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
}
