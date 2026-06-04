import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/providers/trpc";

export interface User {
  id: number;
  role: "admin" | "ecole" | "secretaire";
  username?: string;
  email?: string;
  nom?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!meQuery.isLoading) {
      if (meQuery.data?.user) {
        setUser(meQuery.data.user as User);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    }
  }, [meQuery.data, meQuery.isLoading]);

  const login = useCallback(
    async (
      role: "admin" | "ecole" | "secretaire",
      credentials: Record<string, string>
    ) => {
      let result;
      if (role === "admin") {
        result = await trpc.auth.loginAdmin.mutate({
          username: credentials.username,
          password: credentials.password,
        });
      } else if (role === "ecole") {
        result = await trpc.auth.loginEcole.mutate({
          email: credentials.email,
          password: credentials.password,
        });
      } else {
        result = await trpc.auth.loginSecretaire.mutate({
          email: credentials.email,
          password: credentials.password,
        });
      }

      if (result.success && result.token) {
        localStorage.setItem("token", result.token);
        window.location.reload();
        return { success: true };
      }
      return { success: false, error: result.error };
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  }, []);

  const getToken = useCallback(() => {
    return localStorage.getItem("token");
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isEcole: user?.role === "ecole",
    isSecretaire: user?.role === "secretaire",
    login,
    logout,
    getToken,
  };
}
