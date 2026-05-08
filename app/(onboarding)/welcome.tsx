import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.container}>
      <View style={s.hero}>
        <View style={s.logoMark}>
          <Text style={s.logoText}>E</Text>
        </View>
        <Text style={s.brand}>
          <Text style={{ color: COLORS.orange }}>Expert</Text>Near.Me
        </Text>
        <Text style={s.tagline}>Find local experts in your country</Text>
      </View>

      <View style={s.features}>
        {[
          { icon: "🔍", text: "Search experts by category" },
          { icon: "📍", text: "Browse by country & location" },
          { icon: "⭐", text: "Book, review & connect" },
        ].map((f) => (
          <View key={f.text} style={s.featureRow}>
            <Text style={s.featureIcon}>{f.icon}</Text>
            <Text style={s.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      <View style={s.actions}>
        <TouchableOpacity style={s.btnPrimary} onPress={() => router.push("/(onboarding)/country")}>
          <Text style={s.btnPrimaryText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnSecondary} onPress={() => router.push("/(auth)/login")}>
          <Text style={s.btnSecondaryText}>I have an account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 24 },
  hero: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  logoMark: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: COLORS.orange, alignItems: "center", justifyContent: "center",
  },
  logoText: { fontSize: 32, fontWeight: "900", color: "#fff" },
  brand: { fontSize: 28, fontWeight: "800", color: COLORS.text },
  tagline: { fontSize: 15, color: COLORS.textMuted, textAlign: "center" },
  features: { gap: 16, marginBottom: 32 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  featureIcon: { fontSize: 22, width: 36, textAlign: "center" },
  featureText: { fontSize: 15, color: COLORS.textMuted },
  actions: { gap: 12, paddingBottom: 16 },
  btnPrimary: {
    backgroundColor: COLORS.orange, paddingVertical: 16,
    borderRadius: 14, alignItems: "center",
  },
  btnPrimaryText: { color: "#0f172a", fontWeight: "700", fontSize: 16 },
  btnSecondary: {
    borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 14, borderRadius: 14, alignItems: "center",
  },
  btnSecondaryText: { color: COLORS.textMuted, fontWeight: "600", fontSize: 15 },
});
