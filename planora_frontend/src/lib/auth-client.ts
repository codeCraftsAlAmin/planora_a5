import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

const BASE_URL =
  typeof window === "undefined"
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "http://localhost:5000"}/api/v1`
    : "/api/v1";

export const authClient = createAuthClient({
  baseURL: BASE_URL,
  plugins: [emailOTPClient()],
});

export const { useSession, signIn, signUp, signOut } = authClient;
