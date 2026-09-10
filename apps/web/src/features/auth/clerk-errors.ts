interface ClerkError {
  errors?: { longMessage?: string; message?: string }[];
}

export function clerkMessage(error: unknown, fallback: string) {
  const detail = (error as ClerkError)?.errors?.[0];
  return detail?.longMessage ?? detail?.message ?? fallback;
}
