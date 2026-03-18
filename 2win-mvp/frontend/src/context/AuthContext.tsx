"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  user_id: string;
  email: string;
  name: string;
  height?: number;
  weight?: number;
  age?: number;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function decodeJwtPayload(token: string): any | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return true;
  // exp is in seconds, Date.now() is in ms
  return Date.now() >= payload.exp * 1000;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const clearAuth = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  const fetchUser = useCallback(
    async (authToken: string) => {
      try {
        const res = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          clearAuth();
        }
      } catch {
        clearAuth();
      }
    },
    [clearAuth]
  );

  // On mount: read token, validate expiry, fetch user
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken && !isTokenExpired(storedToken)) {
      setToken(storedToken);
      fetchUser(storedToken).finally(() => setIsLoading(false));
    } else {
      if (storedToken) localStorage.removeItem("token");
      setIsLoading(false);
    }
  }, [fetchUser]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        const accessToken = data.access_token;
        localStorage.setItem("token", accessToken);
        setToken(accessToken);
        await fetchUser(accessToken);
        return { ok: true };
      } else {
        return {
          ok: false,
          error: data.detail || "Login failed. Please check your credentials.",
        };
      }
    } catch {
      return { ok: false, error: "Failed to connect to the server." };
    }
  };

  const logout = useCallback(() => {
    clearAuth();
    router.push("/login");
  }, [clearAuth, router]);

  const refreshUser = useCallback(async () => {
    if (token) {
      await fetchUser(token);
    }
  }, [token, fetchUser]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
