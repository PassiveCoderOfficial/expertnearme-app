import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal,
  Pressable, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth";
import { COLORS, ROLE_LABEL, ROLE_COLOR, SWITCHABLE_ROLES } from "@/constants";

// ── Per-role quick actions ──────────────────────────────────────────
const ROLE_ACTIONS: Record<string, { label: string; icon: string; route: string }[]> = {
  EXPERT: [
    { label: "Edit Profile", icon: "✏️", route: "/profile/expert-edit" },
    { label: "My Bookings", icon: "📅", route: "/(tabs)/bookings" },
    { label: "Messages", icon: "💬", route: "/(tabs)/messages" },
    { label: "Settings", icon: "⚙️", route: "/profile/settings" },
  ],
  BUYER: [
    { label: "Find Experts", icon: "🔍", route: "/(tabs)/search" },
    { label: "My Bookings", icon: "📅", route: "/(tabs)/bookings" },
    { label: "Messages", icon: "💬", route: "/(tabs)/messages" },
    { label: "Settings", icon: "⚙️", route: "/profile/settings" },
  ],
  SALES_AGENT: [
    { label: "My Referrals", icon: "🤝", route: "/profile/referrals" },
    { label: "Add Expert", icon: "➕", route: "/profile/expert-edit" },
    { label: "Messages", icon: "💬", route: "/(tabs)/messages" },
    { label: "Settings", icon: "⚙️", route: "/profile/settings" },
  ],
};

const DRAWER_LINKS: Record<string, { label: string; icon: string; route: string }[]> = {
  EXPERT: [
    { label: "Dashboard", icon: "⚡", route: "/(tabs)/dashboard" },
    { label: "Expert Profile", icon: "👤", route: "/profile/expert-edit" },
    { label: "My Plan", icon: "💳", route: "/profile/subscription" },
    { label: "Bookings", icon: "📅", route: "/(tabs)/bookings" },
    { label: "Messages", icon: "💬", route: "/(tabs)/messages" },
    { label: "My Referrals", icon: "🤝", route: "/profile/referrals" },
    { label: "Settings", icon: "⚙️", route: "/profile/settings" },
  ],
  BUYER: [
    { label: "Dashboard", icon: "⚡", route: "/(tabs)/dashboard" },
    { label: "My Profile", icon: "👤", route: "/profile/edit" },
    { label: "Browse Experts", icon: "🔍", route: "/(tabs)/search" },
    { label: "Bookings", icon: "📅", route: "/(tabs)/bookings" },
    { label: "Messages", icon: "💬", route: "/(tabs)/messages" },
    { label: "My Referrals", icon: "🤝", route: "/profile/referrals" },
    { label: "Settings", icon: "⚙️", route: "/profile/settings" },
  ],
  SALES_AGENT: [
    { label: "Dashboard", icon: "⚡", route: "/(tabs)/dashboard" },
    { label: "My Profile", icon: "👤", route: "/profile/edit" },
    { label: "My Referrals", icon: "🤝", route: "/profile/referrals" },
    { label: "Add Expert", icon: "➕", route: "/profile/expert-edit" },
    { label: "Bookings", icon: "📅", route: "/(tabs)/bookings" },
    { label: "Messages", icon: "💬", route: "/(tabs)/messages" },
    { label: "Settings", icon: "⚙️", route: "/profile/settings" },
  ],
};

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout, switchRole } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  if (!user) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.emptyText}>Sign in to access your dashboard</Text>
          <TouchableOpacity style={s.btn} onPress={() => router.push("/(auth)/login")}>
            <Text style={s.btnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
            <Text style={s.linkText}>Create account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const activeRole = user.activeRole || "USER";
  const roleColor = ROLE_COLOR[activeRole] || COLORS.textDim;
  const roleLabel = ROLE_LABEL[activeRole] || activeRole;
  const actions = ROLE_ACTIONS[activeRole] || ROLE_ACTIONS.BUYER;
  const drawerLinks = DRAWER_LINKS[activeRole] || DRAWER_LINKS.BUYER;

  const handleSwitchRole = async (role: string) => {
    if (role === activeRole || switching) return;
    setSwitching(true);
    await switchRole(role);
    setSwitching(false);
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Dashboard</Text>
          <View style={[s.roleBadge, { backgroundColor: roleColor + "20", borderColor: roleColor + "40" }]}>
            <Text style={[s.roleText, { color: roleColor }]}>{roleLabel}</Text>
          </View>
        </View>
        <TouchableOpacity style={s.menuBtn} onPress={() => setDrawerOpen(true)}>
          <Text style={s.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* User info card */}
        <View style={s.profileCard}>
          <View style={s.profileAvatar}>
            <Text style={s.profileInitial}>{(user.name || user.email)[0].toUpperCase()}</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{user.name || "Your Name"}</Text>
            <Text style={s.profileEmail}>{user.email}</Text>
          </View>
          <TouchableOpacity style={s.editBtn} onPress={() => router.push("/profile/edit")}>
            <Text style={s.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Role switcher */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Switch View</Text>
          <View style={s.roleRow}>
            {SWITCHABLE_ROLES.map((r) => (
              <TouchableOpacity
                key={r}
                style={[s.roleTab, activeRole === r && { borderColor: ROLE_COLOR[r], backgroundColor: ROLE_COLOR[r] + "20" }]}
                onPress={() => handleSwitchRole(r)}
                disabled={switching}
              >
                {switching && activeRole !== r ? null : null}
                <Text style={[s.roleTabText, activeRole === r && { color: ROLE_COLOR[r] }]}>
                  {r === "SALES_AGENT" ? "Agent" : r === "BUYER" ? "Buyer" : "Expert"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {switching && <ActivityIndicator color={COLORS.orange} style={{ marginTop: 8 }} />}
        </View>

        {/* Quick actions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Quick Actions</Text>
          <View style={s.actionsGrid}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={s.actionCard}
                onPress={() => router.push(action.route as any)}
              >
                <Text style={s.actionIcon}>{action.icon}</Text>
                <Text style={s.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={async () => { await logout(); router.replace("/(auth)/login"); }}>
          <Text style={s.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Side Drawer */}
      <Modal visible={drawerOpen} transparent animationType="slide" onRequestClose={() => setDrawerOpen(false)}>
        <Pressable style={s.drawerOverlay} onPress={() => setDrawerOpen(false)}>
          <Pressable style={s.drawer} onPress={() => {}}>
            {/* Drawer header */}
            <View style={s.drawerHeader}>
              <Text style={s.drawerTitle}>
                <Text style={{ color: COLORS.orange }}>Expert</Text>Near.Me
              </Text>
              <TouchableOpacity onPress={() => setDrawerOpen(false)}>
                <Text style={s.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* User info */}
            <View style={s.drawerUser}>
              <View style={[s.roleBadge, { backgroundColor: roleColor + "20", borderColor: roleColor + "40" }]}>
                <Text style={[s.roleText, { color: roleColor }]}>{roleLabel}</Text>
              </View>
              <Text style={s.drawerEmail}>{user.email}</Text>
            </View>

            {/* Links */}
            <ScrollView style={s.drawerLinks}>
              {drawerLinks.map((link) => (
                <TouchableOpacity
                  key={link.label}
                  style={s.drawerLink}
                  onPress={() => { setDrawerOpen(false); router.push(link.route as any); }}
                >
                  <Text style={s.drawerLinkIcon}>{link.icon}</Text>
                  <Text style={s.drawerLinkText}>{link.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Drawer logout */}
            <TouchableOpacity
              style={s.drawerLogout}
              onPress={async () => { setDrawerOpen(false); await logout(); router.replace("/(auth)/login"); }}
            >
              <Text style={s.drawerLogoutText}>🚪 Sign Out</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  greeting: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: 6 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1, alignSelf: "flex-start" },
  roleText: { fontSize: 12, fontWeight: "700" },
  menuBtn: { padding: 8, backgroundColor: COLORS.slate800, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border },
  menuIcon: { fontSize: 20, color: COLORS.textMuted },
  scroll: { flex: 1 },
  profileCard: { flexDirection: "row", alignItems: "center", margin: 16, padding: 16, backgroundColor: COLORS.slate800, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  profileAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.orange + "30", alignItems: "center", justifyContent: "center" },
  profileInitial: { fontSize: 22, fontWeight: "700", color: COLORS.orange },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  profileEmail: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  editBtn: { borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  editBtnText: { fontSize: 12, color: COLORS.textMuted, fontWeight: "600" },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  roleRow: { flexDirection: "row", gap: 10 },
  roleTab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.slate800 },
  roleTabText: { fontSize: 13, fontWeight: "700", color: COLORS.textDim },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionCard: { width: "47%", backgroundColor: COLORS.slate800, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  actionIcon: { fontSize: 24 },
  actionLabel: { fontSize: 13, fontWeight: "600", color: COLORS.textMuted },
  logoutBtn: { marginHorizontal: 16, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "rgba(239,68,68,0.3)", alignItems: "center" },
  logoutText: { color: "#f87171", fontWeight: "600", fontSize: 14 },
  drawerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end", flexDirection: "row" },
  drawer: { width: "75%", backgroundColor: COLORS.slate900, height: "100%", paddingTop: 48 },
  drawerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  drawerTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  closeBtn: { fontSize: 18, color: COLORS.textMuted, padding: 4 },
  drawerUser: { padding: 20, gap: 4, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  drawerEmail: { fontSize: 12, color: COLORS.textDim },
  drawerLinks: { flex: 1, paddingTop: 8 },
  drawerLink: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingVertical: 14 },
  drawerLinkIcon: { fontSize: 18, width: 28, textAlign: "center" },
  drawerLinkText: { fontSize: 15, color: COLORS.text, fontWeight: "500" },
  drawerLogout: { padding: 20, borderTopWidth: 1, borderTopColor: COLORS.border },
  drawerLogoutText: { fontSize: 15, color: "#f87171", fontWeight: "600" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  emptyText: { fontSize: 16, fontWeight: "700", color: COLORS.textMuted },
  btn: { backgroundColor: COLORS.orange, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 12 },
  btnText: { color: "#0f172a", fontWeight: "700", fontSize: 15 },
  linkText: { color: COLORS.orange, fontWeight: "600", fontSize: 14 },
});
