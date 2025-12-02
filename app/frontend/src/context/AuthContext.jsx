// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();
const API_BASE = "http://localhost:5000/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to restore user from localStorage:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  async function login({ email, senha }) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email, senha })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        return { ok: true };
      }
      return { ok: false, error: data };
    } catch (err) {
      console.error("Login error:", err);
      return { ok: false, error: "Erro de conexão com o servidor" };
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  async function register(payload) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
      });
      return res;
    } catch (err) {
      console.error("Register error:", err);
      return { ok: false };
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, register, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
