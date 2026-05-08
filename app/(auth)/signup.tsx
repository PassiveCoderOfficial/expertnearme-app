import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth";
import { COLORS } from "@/constants";

type Role = "BUYER" | "EXPERT" | "SALES_AGENT";

const ROLES: { value: Role; label: string; icon: string; color: string }[] = [
  { value: "BUYER", label: "Buyer", icon: "🔍", color: "#06b6d4" },
  { value: "EXPERT", label: "Expert", icon: "⭐", color: COLORS.orange },
  { value: "SALES_AGENT", label: "Agent", icon: "🤝", color: "#22c55e" },
];

export default function SignupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const { signup } = useAuthStore();

  const [role, setRole] = useState<Role>((params.role as Role) || "BUYER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) { setError("Fill in all fields"); return; }
    if (password.length < 8) { setError("Password min 8 characters"); return; }
    setLoading(true);
    setError("");
    const result = await signup(name, email, password, role);
    setLoading(false);
    if (result.ok) {
      router.replace("/(tabs)");
    } else {
      setError(result.error || "Signup failed");
    }
  };

  const selectedRole = ROLES.find((r) => r.value === role)!;

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          <View style={s.logo}>
            <View style={s.logoMark}><Text style={s.logoLetter}>E</Text></View>
            <Text style={s.brand}><Text style={{ color: COLORS.orange }}>Expert</Text>Near.Me</Text>
          </View>

          <Text style={s.title}>Create your account</Text>
          <Text style={s.subtitle}>Choose how you'll use the platform</Text>

          <View style={s.roleRow}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.value}
                onPress={() => setRole(r.value)}
                style={[s.roleBtn, role === r.value && { borderColor: r.color, backgroundColor: `${r.color}20` }]}
              >
                <Text style={s.roleIcon}>{r.icon}</Text>
                <Text style={[s.roleLabel, role === r.value && { color: r.color }]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {!!error && <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View>}

          <View style={s.form}>
            <View style={s.field}>
              <Text style={s.label}>Full name</Text>
              <TextInput style={s.input} placeholder="Your name" placeholderTextColor={COLORS.textDim} value={name} onChangeText={setName} autoCapitalize="words" />
            </View>
            <View style={s.field}>
              <Text style={s.label}>Email</Text>
              <TextInput style={s.input} placeholder="you@example.com" placeholderTextColor={COLORS.textDim} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            </View>
            <View style={s.field}>
              <Text style={s.label}>Password</Text>
              <View style={s.passwordRow}>
                <TextInput style={[s.input, { flex: 1 }]} placeholder="Min. 8 characters" placeholderTextColor={COLORS.textDim} value={password} onChangeText={setPassword} secureTextEntry={!showPw} />
                <TouchableOpacity onPress={() => setShowPw((v) => !v)} style={s.eyeBtn}>
                  <Text style={s.eyeText}>{showPw ? "🙈" : "👁"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[s.btnPrimary, loading && { opacity: 0.6 }]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#0f172a" />
                : <Text style={s.btnText}>Create {selectedRole.label} Account</Text>
              }
            </TouchableOpacity>
          </View>

          <Text style={s.footer}>
            Have an account?{" "}
            <Text style={s.link} onPress={() => router.push("/(auth)/login")}>Sign in</Text>
          </Text>
          <Text style={s.footerNote}>You can switch between Buyer, Expert & Agent anytime</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flexGrow: 1, padding: 24, gap: 8 },
  logo: { alignItems: "center", marginBottom: 24, gap: 8, marginTop: 16 },
  logoMark: { width: 48, height: 48, borderRadius: 12, backgroundColor: COLORS.orange, alignItems: "center", justifyContent: "center" },
  logoLetter: { fontSize: 22, fontWeight: "900", color: "#fff" },
  brand: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: 4 },
  roleRow: { flexDirection: "row", gap: 10, marginVertical: 8 },
  roleBtn: {
    flex: 1, alignItems: "center", paddingVertical: 12, gap: 4,
    borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.slate800,
  },
  roleIcon: { fontSize: 20 },
  roleLabel: { fontSize: 12, fontWeight: "700", color: COLORS.textMuted },
  errorBox: { backgroundColor: "rgba(239,68,68,0.15)", borderWidth: 1, borderColor: "rgba(239,68,68,0.3)", borderRadius: 10, padding: 12 },
  errorText: { color: "#fca5a5", fontSize: 13 },
  form: { gap: 14, marginTop: 4 },
  field: { gap: 6 },
  label: { fontSize: 11, fontWeight: "600", color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    backgroundColor: COLORS.slate800, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    color: COLORS.text, fontSize: 15,
  },
  passwordRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  eyeBtn: { padding: 8 },
  eyeText: { fontSize: 18 },
  btnPrimary: { backgroundColor: COLORS.orange, paddingVertical: 15, borderRadius: 14, alignItems: "center", marginTop: 4 },
  btnText: { color: "#0f172a", fontWeight: "700", fontSize: 16 },
  footer: { textAlign: "center", color: COLORS.textMuted, fontSize: 14, marginTop: 16 },
  footerNote: { textAlign: "center", color: COLORS.textDim, fontSize: 12, marginTop: 4 },
  link: { color: COLORS.orange, fontWeight: "600" },
});
