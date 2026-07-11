import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * A simple client-side password gate for the dashboard — NOT real
 * authentication. It doesn't call the backend at all; the backend has no
 * concept of a login. This just stops someone from casually opening the
 * dashboard URL without knowing the password. The password lives in
 * VITE_DASHBOARD_PASSWORD (baked into the build) and is compared in the
 * browser, so anyone who reads the JS bundle can find it — that's an
 * accepted tradeoff for "keep the current visitor out," not a security
 * boundary against a motivated attacker.
 */

const STORAGE_KEY = "pdf-qr-unlocked";
const CONFIGURED_PASSWORD = import.meta.env.VITE_DASHBOARD_PASSWORD;

interface AuthContextValue {
  status: "authenticated" | "unauthenticated";
  login: (password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthContextValue["status"]>(
    sessionStorage.getItem(STORAGE_KEY) === "true" ? "authenticated" : "unauthenticated"
  );

  const login = async (password: string) => {
    if (!CONFIGURED_PASSWORD) {
      throw new Error("VITE_DASHBOARD_PASSWORD is not set. Add it to frontend/.env.");
    }
    if (password !== CONFIGURED_PASSWORD) {
      throw new Error("Incorrect password.");
    }
    sessionStorage.setItem(STORAGE_KEY, "true");
    setStatus("authenticated");
  };

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setStatus("unauthenticated");
  };

  const value = useMemo(() => ({ status, login, logout }), [status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
