"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api, loadSession, saveSession, clearSession } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = loadSession();
    setToken(session.token);
    setUser(session.user);
    setReady(true);
  }, []);

  function login(newToken, newUser) {
    saveSession(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    clearSession();
    setToken(null);
    setUser(null);
  }

  async function switchRole(role) {
    const res = await api.switchRole(role);
    const updated = { ...user, activeRole: res.activeRole };
    saveSession(token, updated);
    setUser(updated);
  }

  async function refreshMe() {
    if (!token) return;
    const res = await api.getMe();
    saveSession(token, res.user);
    setUser(res.user);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, ready, login, logout, switchRole, refreshMe }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
