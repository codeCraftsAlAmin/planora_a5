import type { AuthUser } from "@/types";

const BASE_URL =
  typeof window === "undefined"
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "http://localhost:5000"}/api/v1`
    : "/api/v1";

interface ApiResponse<T> {
  ok: boolean;
  message: string;
  data: T;
}

interface AuthCredentials {
  email: string;
  password: string;
}

interface SignUpPayload extends AuthCredentials {
  name: string;
}

interface VerifyOtpPayload {
  email: string;
  otp: string;
}

interface ResendOtpPayload {
  email: string;
  type?: string;
}

type QueryParams = Record<string, string | number | boolean | undefined>;

function getErrorMessage(body: unknown) {
  if (
    body &&
    typeof body === "object" &&
    "message" in body &&
    typeof body.message === "string"
  ) {
    return body.message;
  }

  return null;
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const headers = {
    ...options.headers,
  } as Record<string, string>;

  // Only set application/json if body is not FormData
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Essential for handling cookies
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJsonResponse = contentType.includes("application/json");
  const rawBody = await response.text();
  const body: unknown = rawBody && isJsonResponse ? JSON.parse(rawBody) : null;

  if (!response.ok) {
    if (response.status === 404 && !isJsonResponse) {
      throw new Error(
        "API route not found. Check NEXT_PUBLIC_BACKEND_URL and restart the Next.js dev server so proxy rewrites are enabled."
      );
    }

    throw new Error(getErrorMessage(body) || `API request failed with status ${response.status}.`);
  }

  return (body ?? {
    ok: true,
    message: "",
    data: null,
  }) as ApiResponse<T>;
}

export const authService = {
  signUp: (data: SignUpPayload) => apiFetch<unknown>("/auth/sign-up/email", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  signIn: (data: AuthCredentials) => apiFetch<unknown>("/auth/sign-in/email", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  verifyOtp: (data: VerifyOtpPayload) => apiFetch<unknown>("/auth/email-otp/verify-email", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  resendOtp: (data: ResendOtpPayload) =>
    apiFetch<unknown>("/auth/email-otp/send-verification-otp", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  signOut: () => apiFetch<unknown>("/auth/sign-out", {
    method: "POST",
  }),

  getProfile: () => apiFetch<AuthUser>("/users/my-profile"),

  updateProfile: (formData: FormData) => apiFetch<unknown>("/users/update/my-profile", {
    method: "PUT",
    body: formData,
  }),

  becomeHost: () => apiFetch<unknown>("/users/become-host", {
    method: "PUT",
  }),

  getAllUsers: (params?: QueryParams) => {
    const filteredParams = Object.entries(params ?? {}).reduce<Record<string, string>>(
      (accumulator, [key, value]) => {
        if (value !== undefined) {
          accumulator[key] = String(value);
        }

        return accumulator;
      },
      {}
    );
    const searchParams = new URLSearchParams(filteredParams).toString();
    return apiFetch<unknown>(`/users/?${searchParams}`);
  },
};
