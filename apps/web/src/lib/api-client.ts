import { env } from "@/lib/env";
import { getAccessToken, refreshSession } from "@/lib/session";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

async function execute<T>(path: string, options: RequestOptions, retry: boolean): Promise<T> {
  const { body, auth = true, headers, ...rest } = options;
  const token = auth ? await getAccessToken() : null;

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/v1${path}`, {
    ...rest,
    headers: {
      ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && auth && retry) {
    await refreshSession();
    return execute<T>(path, options, false);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const detail = payload?.detail ?? {};
    throw new ApiError(
      response.status,
      detail.code ?? "unknown_error",
      detail.message ?? "Something went wrong",
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, options: RequestOptions = {}) =>
    execute<T>(path, { ...options, method: "GET" }, true),
  post: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    execute<T>(path, { ...options, method: "POST", body }, true),
  patch: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    execute<T>(path, { ...options, method: "PATCH", body }, true),
  put: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    execute<T>(path, { ...options, method: "PUT", body }, true),
  delete: <T>(path: string, options: RequestOptions = {}) =>
    execute<T>(path, { ...options, method: "DELETE" }, true),
};
