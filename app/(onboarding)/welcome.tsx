import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOnboardingStore } from "@/store/onboarding";
import { COLORS } from "@/constants";

export default function WelcomeScreen() {
  const router = useRouter();
  const { complete } = useOnboardingStore();

  const handleHaveAccount = async () => {
    await complete();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={s.container}>
      {/* Hero */}
      <View style={s.hero}>
        <View style={s.logoWrap}>
          <View style={s.logoMark}>
            <Text style={s.logoText}>E</Text>
          </View>
          <View style={s.logoDot} />
        </View>
        <Text style={s.brand}>
          <Text style={{ color: COLORS.orange }}>Expert</Text>
          <Text style={s.brandDot}>Near</Text>
          <Text style={{ color: COLORS.textMuted }}>.Me</Text>
        </Text>
        <Text style={s.tagline}>Find trusted local experts{"\n"}in your country</Text>
      </View>

      {/* Feature pills */}
      <View style={s.pillsRow}>
        {["🔍 Search", "📍 Browse", "⭐ Book", "💬 Connect"].map((p) => (
          <View key={p} style={s.pill}>
            <Text style={s.pillText}>{p}</Text>
          </View>
        ))}
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {[
          { val: "500+", label: "Experts" },
          { val: "20+", label: "Countries" },
          { val: "100+", label: "Categories" },
        ].map((s2) => (
          <View key={s2.label} style={s.statBox}>
            <Text style={s.statVal}>{s2.val}</Text>
            <Text style={s.statLabel}>{s2.label}</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={s.actions}>
        <TouchableOpacity
          style={s.btnPrimary}
          onPress={() => router.push("/(onboarding)/country")}
        >
          <Text style={s.btnPrimaryText}>Get Started →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.btnSecondary} onPress={handleHaveAccount}>
          <Text style={s.btnSecondaryText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 28,
  },
  hero: {
    flex: 1, alignItems: "center", justifyContent: "center", gap: 14,
  },
  logoWrap: { position: "relative", alignItems: "center", justifyContent: "center" },
  logoMark: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: COLORS.orange,
    alignItems: "center", justifyContent: "center",
    shadowColor: COLORS.orange, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
  },
  logoText: { fontSize: 38, fontWeight: "900", color: "#fff" },
  logoDot: {
    position: "absolute", bottom: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: "#22c55e", borderWidth: 2, borderColor: COLORS.bg,
  },
  brand: { fontSize: 30, fontWeight: "900", letterSpacing: -0.5 },
  brandDot: { color: COLORS.text },
  tagline: {
    fontSize: 16, color: COLORS.textMuted, textAlign: "center",
    lineHeight: 24, marginTop: 4,
  },
  pillsRow: {
    flexDirection: "row", flexWrap: "wrap", gap: 8,
    justifyContent: "center", marginBottom: 28,
  },
  pill: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: COLORS.slate800, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border,
  },
  pillText: { fontSize: 13, color: COLORS.textMuted, fontWeight: "500" },
  statsRow: {
    flexDirection: "row", gap: 12, marginBottom: 32,
  },
  statBox: {
    flex: 1, alignItems: "center", paddingVertical: 14,
    backgroundColor: COLORS.slate800, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  statVal: { fontSize: 20, fontWeight: "800", color: COLORS.orange },
  statLabel: { fontSize: 11, color: COLORS.textDim, marginTop: 2, fontWeight: "500" },
  actions: { gap: 12, paddingBottom: 24 },
  btnPrimary: {
    backgroundColor: COLORS.orange, paddingVertical: 17,
    borderRadius: 16, alignItems: "center",
    shadowColor: COLORS.orange, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  btnPrimaryText: { color: "#0f172a", fontWeight: "800", fontSize: 16, letterSpacing: 0.2 },
  btnSecondary: {
    paddingVertical: 15, borderRadius: 16, alignItems: "center",
    borderWidth: 1, borderColor: COLORS.border,
  },
  btnSecondaryText: { color: COLORS.textMuted, fontWeight: "600", fontSize: 15 },
});
