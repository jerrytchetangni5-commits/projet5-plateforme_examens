import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }
  return next({ ctx });
});

const isAdmin = t.middleware(({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access only",
    });
  }
  return next({ ctx });
});

const isSecretaireOrAdmin = t.middleware(({ ctx, next }) => {
  if (
    !ctx.user ||
    (ctx.user.role !== "admin" && ctx.user.role !== "secretaire")
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Secretaire or admin access only",
    });
  }
  return next({ ctx });
});

const isEcole = t.middleware(({ ctx, next }) => {
  if (ctx.user?.role !== "ecole") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Ecole access only",
    });
  }
  return next({ ctx });
});

export const createRouter = t.router;
export const publicQuery = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthenticated);
export const adminProcedure = t.procedure.use(isAuthenticated).use(isAdmin);
export const secretaireOrAdminProcedure = t.procedure
  .use(isAuthenticated)
  .use(isSecretaireOrAdmin);
export const ecoleProcedure = t.procedure.use(isAuthenticated).use(isEcole);
