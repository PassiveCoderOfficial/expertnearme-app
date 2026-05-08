import { create } from "zustand";
import { storage } from "@/lib/storage";
import { API_BASE } from "@/constants";

interface User {
  id: number;
  email: string;
  name?: string;
  role: string;
  roles: string[];
  activeRole: string;
  defaultRole: string;
  verified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  hydrated: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: true,
  hydrated: false,

  init: async () => {
    const token = await storage.getItem("token");
    if (!token) {
      set({ loading: false, hydrated: true });
      return;
    }
    set({ token });
    await get().refresh();
    set({ hydrated: true });
  },

  refresh: async () => {
    set({ loading: true });
    try {
      const token = await storage.getItem("token");
      if (!token) { set({ user: null, token: null, loading: false }); return; }

      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}`, Cookie: `token=${token}` },
      });
      const data = await res.json();
      if (data.ok) {
        set({ user: data.user, token, loading: false });
      } else {
        await storage.deleteItem("token");
        set({ user: null, token: null, loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.ok && data.token) {
        await storage.setItem("token", data.token);
        set({ token: data.token });
        await get().refresh();
        return { ok: true };
      }
      return { ok: false, error: data.error || "Login failed" };
    } catch {
      return { ok: false, error: "Network error" };
    }
  },

  signup: async (name, email, password, role) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (data.ok) {
        if (!data.emailVerificationRequired) {
          return get().login(email, password);
        }
        return { ok: true };
      }
      return { ok: false, error: data.error || "Signup failed" };
    } catch {
      return { ok: false, error: "Network error" };
    }
  },

  logout: async () => {
    await storage.deleteItem("token");
    set({ user: null, token: null });
  },

  switchRole: async (role) => {
    const token = await storage.getItem("token");
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE}/api/auth/switch-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Cookie: `token=${token}`,
        },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.ok) {
        await get().refresh();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));
