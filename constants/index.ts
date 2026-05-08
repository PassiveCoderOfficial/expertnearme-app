export const API_BASE = "https://expertnear.me";

export const COLORS = {
  bg: "#020617",
  bgCard: "#1e293b",
  bgCardBorder: "rgba(255,255,255,0.08)",
  orange: "#f97316",
  orangeLight: "#fb923c",
  text: "#ffffff",
  textMuted: "#94a3b8",
  textDim: "#64748b",
  border: "rgba(255,255,255,0.08)",
  slate800: "#1e293b",
  slate900: "#0f172a",
  slate950: "#020617",
};

export const SWITCHABLE_ROLES = ["BUYER", "EXPERT", "SALES_AGENT"] as const;

export const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  MANAGER: "Manager",
  MARKETER: "Marketer",
  SEO_EXPERT: "SEO Expert",
  SALES_AGENT: "Agent",
  EXPERT: "Expert",
  BUYER: "Buyer",
  USER: "User",
};

export const ROLE_COLOR: Record<string, string> = {
  EXPERT: "#f97316",
  BUYER: "#06b6d4",
  SALES_AGENT: "#22c55e",
  USER: "#64748b",
};
