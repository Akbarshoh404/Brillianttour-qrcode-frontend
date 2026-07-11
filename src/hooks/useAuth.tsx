import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { authService } from "@/services/authService";

interface AuthContextValue {
  status: "checking" | "authenticated" | "unauthenticated";
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthContextValue["status"]>("checking");
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      setStatus("unauthenticated");
      return;
    }
    authService
      .me()
      .then((user) => {
        setUsername(user.username);
        setStatus("authenticated");
      })
      .catch(() => {
        setStatus("unauthenticated");
      });
  }, []);

  const login = async (usernameInput: string, password: string) => {
    await authService.login(usernameInput, password);
    const user = await authService.me();
    setUsername(user.username);
    setStatus("authenticated");
  };

  const logout = () => {
    authService.logout();
    setUsername(null);
    setStatus("unauthenticated");
  };

  const value = useMemo(() => ({ status, username, login, logout }), [status, username]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
