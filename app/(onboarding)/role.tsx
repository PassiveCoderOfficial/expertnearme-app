import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOnboardingStore } from "@/store/onboarding";
import { COLORS } from "@/constants";

type Role = "BUYER" | "EXPERT" | "SALES_AGENT";

const ROLES: { value: Role; label: string; desc: string; icon: string; color: string }[] = [
  {
    value: "BUYER",
    label: "Buyer",
    desc: "Find and hire experts near you",
    icon: "🔍",
    color: "#06b6d4",
  },
  {
    value: "EXPERT",
    label: "Expert",
    desc: "List your services and get clients",
    icon: "⭐",
    color: COLORS.orange,
  },
  {
    value: "SALES_AGENT",
    label: "Agent",
    desc: "Refer experts and earn commissions",
    icon: "🤝",
    color: "#22c55e",
  },
];

export default function RoleSelectScreen() {
  const router = useRouter();
  const { complete } = useOnboardingStore();
  const [selected, setSelected] = useState<Role>("BUYER");

  const handleContinue = async () => {
    await complete();
    router.replace({ pathname: "/(auth)/signup", params: { role: selected } });
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.step}>Step 2 of 2</Text>
        <Text style={s.title}>How will you use the app?</Text>
        <Text style={s.subtitle}>You can switch between roles anytime</Text>
      </View>

      <View style={s.roles}>
        {ROLES.map((r) => (
          <TouchableOpacity
            key={r.value}
            style={[s.card, selected === r.value && { borderColor: r.color, backgroundColor: `${r.color}15` }]}
            onPress={() => setSelected(r.value)}
          >
            <Text style={s.icon}>{r.icon}</Text>
            <View style={s.cardText}>
              <Text style={[s.label, selected === r.value && { color: r.color }]}>{r.label}</Text>
              <Text style={s.desc}>{r.desc}</Text>
            </View>
            <View style={[s.radio, selected === r.value && { borderColor: r.color, backgroundColor: r.color }]}>
              {selected === r.value && <View style={s.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.footer}>
        <TouchableOpacity style={s.btnPrimary} onPress={handleContinue}>
          <Text style={s.btnText}>Continue as {ROLES.find((r) => r.value === selected)?.label}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { complete(); router.replace("/(auth)/login"); }}>
          <Text style={s.loginLink}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 20 },
  header: { paddingTop: 12, paddingBottom: 28, gap: 4 },
  step: { fontSize: 12, color: COLORS.orange, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textMuted },
  roles: { flex: 1, gap: 12 },
  card: {
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 18, borderRadius: 16, borderWidth: 1.5,
    borderColor: COLORS.border, backgroundColor: COLORS.slate800,
  },
  icon: { fontSize: 28, width: 40, textAlign: "center" },
  cardText: { flex: 1 },
  label: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  desc: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: COLORS.textDim, alignItems: "center", justifyContent: "center",
  },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  footer: { gap: 12, paddingBottom: 16 },
  btnPrimary: {
    backgroundColor: COLORS.orange, paddingVertical: 16,
    borderRadius: 14, alignItems: "center",
  },
  btnText: { color: "#0f172a", fontWeight: "700", fontSize: 16 },
  loginLink: { color: COLORS.textMuted, textAlign: "center", fontSize: 14, paddingVertical: 8 },
});
