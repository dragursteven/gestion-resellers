import React, { createContext, useContext, useState, useCallback } from "react";
import { api } from "../lib/api.js";

const AuthContext = createContext(null);

function loadUser() {
  try {
    return JSON.parse(localStorage.getItem("gr_user") || "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  const login = useCallback(async (email, password) => {
    const res = await api.login(email, password);
    localStorage.setItem("gr_user", JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("gr_user");
    setUser(null);
  }, []);

  const isAdmin = String(user?.rol || "").toLowerCase() === "admin";

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth fuera de AuthProvider");
  return ctx;
}
