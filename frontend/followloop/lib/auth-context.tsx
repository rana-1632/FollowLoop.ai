"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  api,
  User,
  getStoredToken,
  clearStoredToken,
  setStoredToken,
} from "./api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    password: string,
    company?: string
  ) => Promise<void>;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Hydrate auth session from localStorage & cookies on load
    const initializeAuth = async () => {
      try {
        const savedToken = getStoredToken();
        const savedUserStr = typeof window !== "undefined" ? localStorage.getItem("followloop_user") : null;

        if (savedToken) {
          setToken(savedToken);
          if (savedUserStr) {
            try {
              setUser(JSON.parse(savedUserStr));
            } catch (e) {
              console.error("Failed to parse stored user profile", e);
            }
          } else {
            setUser({
              id: "u1",
              email: "user@followloop.ai",
              name: "FollowLoop User",
            });
          }

          // Quietly update fresh user profile if backend /auth/me is available
          try {
            const res: any = await api.auth.getMe();
            const freshUser = res?.user || res;
            if (freshUser && (freshUser.email || freshUser.id || freshUser.name)) {
              setUser((prev) => {
                const merged = { ...prev, ...freshUser };
                if (typeof window !== "undefined") {
                  localStorage.setItem("followloop_user", JSON.stringify(merged));
                }
                return merged;
              });
            }
          } catch (fetchErr: any) {
            console.warn("Could not fetch user details from /auth/me:", fetchErr?.message || fetchErr);
            if (fetchErr?.message?.includes("401") || fetchErr?.message?.includes("Unauthorized")) {
              clearStoredToken();
              setToken(null);
              setUser(null);
            }
          }
        } else {
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(email, password);
      const authToken =
        res.accessToken ||
        res.token ||
        (res as any).access_token ||
        (res as any).jwt;

      if (!authToken) {
        throw new Error("No authentication token returned by the server.");
      }

      setStoredToken(authToken);
      setToken(authToken);

      const authUser: User = res.user || {
        id: (res as any).id || (res as any).userId || "u1",
        email: email,
        name: (res as any).name || (res as any).fullName || email.split("@")[0],
      };

      setUser(authUser);
      localStorage.setItem("followloop_user", JSON.stringify(authUser));
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    company?: string
  ) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(fullName, email, password, company);
      const authToken =
        res.accessToken ||
        res.token ||
        (res as any).access_token ||
        (res as any).jwt;

      if (!authToken) {
        throw new Error("No authentication token returned by the server.");
      }

      setStoredToken(authToken);
      setToken(authToken);

      const authUser: User = res.user || {
        id: (res as any).id || (res as any).userId || "u1",
        email: email,
        name: fullName,
        company: company,
      };

      setUser(authUser);
      localStorage.setItem("followloop_user", JSON.stringify(authUser));
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updatedData: Partial<User>) => {
    setUser((prev) => {
      const updated = prev ? { ...prev, ...updatedData } : ({ id: "u1", email: "user@followloop.ai", name: "User", ...updatedData } as User);
      if (typeof window !== "undefined") {
        localStorage.setItem("followloop_user", JSON.stringify(updated));
      }
      return updated;
    });

    try {
      const res: any = await api.auth.updateProfile({
        fullName: updatedData.fullName || updatedData.name,
        companyName: updatedData.companyName || updatedData.company,
        avatarUrl: updatedData.avatarUrl,
      });
      if (res) {
        const fresh = res.user || res;
        setUser((prev) => {
          const merged = { ...prev, ...fresh };
          if (typeof window !== "undefined") {
            localStorage.setItem("followloop_user", JSON.stringify(merged));
          }
          return merged;
        });
      }
    } catch (err) {
      console.warn("Could not save profile updates to database:", err);
    }
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token || !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
