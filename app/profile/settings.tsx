import { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth";
import { useCountryStore } from "@/store/country";
import { useOnboardingStore } from "@/store/onboarding";
import { COLORS, ROLE_LABEL, ROLE_COLOR, SWITCHABLE_ROLES } from "@/constants";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout, switchRole } = useAuthStore();
  const { selected: country } = useCountryStore();
  const { reset: resetOnboarding } = useOnboardingStore();
  const [switching, setSwitching] = useState(false);

  const activeRole = user?.activeRole || "USER";

  const handleSwitchRole = async (role: string) => {
    if (role === activeRole || switching) return;
    setSwitching(true);
    await switchRole(role);
    setSwitching(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const handleResetOnboarding = async () => {
    await resetOnboarding();
    router.replace("/(onboarding)/welcome");
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container}>
        <Text style={s.title}>Settings</Text>

        {/* Account */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Account</Text>
          <TouchableOpacity style={s.row} onPress={() => router.push("/profile/edit")}>
            <Text style={s.rowLabel}>Edit Profile</Text>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Country */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Region</Text>
          <TouchableOpacity style={s.row} onPress={() => router.push("/(onboarding)/country" as any)}>
            <View style={s.rowLeft}>
              <Text style={s.flag}>{country?.flagEmoji || "🌐"}</Text>
              <View>
                <Text style={s.rowLabel}>Country</Text>
                <Text style={s.rowSub}>{country?.name || "Not selected"}</Text>
              </View>
            </View>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Role */}
        {user && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Dashboard View</Text>
            <Text style={s.sectionDesc}>Switch between your Buyer, Expert, and Agent dashboards</Text>
            <View style={s.roleRow}>
              {SWITCHABLE_ROLES.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[s.roleBtn, activeRole === r && { borderColor: ROLE_COLOR[r], backgroundColor: ROLE_COLOR[r] + "20" }]}
                  onPress={() => handleSwitchRole(r)}
                  disabled={switching}
                >
                  <Text style={[s.roleBtnText, activeRole === r && { color: ROLE_COLOR[r] }]}>
                    {ROLE_LABEL[r]}
                  </Text>
                  {activeRole === r && <Text style={[s.activeCheck, { color: ROLE_COLOR[r] }]}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Danger zone */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>More</Text>
          <TouchableOpacity style={s.row} onPress={handleResetOnboarding}>
            <Text style={s.rowLabel}>Restart Onboarding</Text>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {user ? (
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
            <Text style={s.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.loginBtn} onPress={() => router.push("/(auth)/login")}>
            <Text style={s.loginText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, gap: 8 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: 12 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 },
  sectionDesc: { fontSize: 13, color: COLORS.textMuted, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: COLORS.slate800, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 6 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  flag: { fontSize: 22 },
  rowLabel: { fontSize: 15, color: COLORS.text, fontWeight: "500" },
  rowSub: { fontSize: 12, color: COLORS.textMuted },
  chevron: { fontSize: 20, color: COLORS.textDim },
  roleRow: { flexDirection: "row", gap: 10 },
  roleBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 11, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.slate800 },
  roleBtnText: { fontSize: 13, fontWeight: "700", color: COLORS.textDim },
  activeCheck: { fontSize: 12 },
  logoutBtn: { marginTop: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "rgba(239,68,68,0.3)", alignItems: "center" },
  logoutText: { color: "#f87171", fontWeight: "600", fontSize: 14 },
  loginBtn: { marginTop: 12, padding: 14, borderRadius: 14, backgroundColor: COLORS.orange, alignItems: "center" },
  loginText: { color: "#0f172a", fontWeight: "700", fontSize: 14 },
});
