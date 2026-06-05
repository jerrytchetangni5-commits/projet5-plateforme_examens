import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { verifyToken } from "./lib/jwt";

export type UserRole = "admin" | "ecole" | "secretaire";

export type AuthUser = {
  id: number;
  role: UserRole;
  username?: string;
  email?: string;
  nom?: string;
};

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user: AuthUser | null;
};

export async function createContext(
  opts: FetchCreateContextFnOptions
): Promise<TrpcContext> {
  const authHeader = opts.req.headers.get("authorization");
  let user: AuthUser | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = await verifyToken(token);

    if (
      payload &&
      typeof payload.userId === "number" &&
      typeof payload.role === "string"
    ) {
      user = {
        id: payload.userId,
        role: payload.role as UserRole,
        username:
          typeof payload.username === "string" ? payload.username : undefined,
        email: typeof payload.email === "string" ? payload.email : undefined,
        nom: typeof payload.nom === "string" ? payload.nom : undefined,
      };
    }
  }

  return { req: opts.req, resHeaders: opts.resHeaders, user };
}
