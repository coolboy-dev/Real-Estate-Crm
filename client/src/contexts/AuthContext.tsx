import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { AuthState, User } from "../types";

interface AuthContextValue {
  auth: AuthState | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(() => {
    const raw = localStorage.getItem("auth");
    return raw ? JSON.parse(raw) : null;
  });

  function login(token: string, user: User) {
    const state = { token, user };
    localStorage.setItem("auth", JSON.stringify(state));
    setAuth(state);
  }

  function logout() {
    localStorage.removeItem("auth");
    setAuth(null);
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
