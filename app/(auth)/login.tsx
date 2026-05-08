import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth";
import { COLORS } from "@/constants";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError("Fill in all fields"); return; }
    setLoading(true);
    setError("");
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      router.replace("/(tabs)");
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          <View style={s.logo}>
            <View style={s.logoMark}><Text style={s.logoLetter}>E</Text></View>
            <Text style={s.brand}><Text style={{ color: COLORS.orange }}>Expert</Text>Near.Me</Text>
          </View>

          <Text style={s.title}>Welcome back</Text>
          <Text style={s.subtitle}>Sign in to your account</Text>

          {!!error && <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View>}

          <View style={s.form}>
            <View style={s.field}>
              <Text style={s.label}>Email</Text>
              <TextInput
                style={s.input}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textDim}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={s.field}>
              <Text style={s.label}>Password</Text>
              <View style={s.passwordRow}>
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  placeholder="Your password"
                  placeholderTextColor={COLORS.textDim}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPw}
                />
                <TouchableOpacity onPress={() => setShowPw((v) => !v)} style={s.eyeBtn}>
                  <Text style={s.eyeText}>{showPw ? "🙈" : "👁"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[s.btnPrimary, loading && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#0f172a" /> : <Text style={s.btnText}>Sign In</Text>}
            </TouchableOpacity>
          </View>

          <Text style={s.footer}>
            No account?{" "}
            <Text style={s.link} onPress={() => router.push("/(auth)/signup")}>Create one</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flexGrow: 1, padding: 24, justifyContent: "center", gap: 8 },
  logo: { alignItems: "center", marginBottom: 32, gap: 8 },
  logoMark: { width: 56, height: 56, borderRadius: 14, backgroundColor: COLORS.orange, alignItems: "center", justifyContent: "center" },
  logoLetter: { fontSize: 28, fontWeight: "900", color: "#fff" },
  brand: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  title: { fontSize: 26, fontWeight: "800", color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: 8 },
  errorBox: { backgroundColor: "rgba(239,68,68,0.15)", borderWidth: 1, borderColor: "rgba(239,68,68,0.3)", borderRadius: 10, padding: 12 },
  errorText: { color: "#fca5a5", fontSize: 13 },
  form: { gap: 16, marginTop: 8 },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: "600", color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    backgroundColor: COLORS.slate800, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    color: COLORS.text, fontSize: 15,
  },
  passwordRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  eyeBtn: { padding: 8 },
  eyeText: { fontSize: 18 },
  btnPrimary: { backgroundColor: COLORS.orange, paddingVertical: 15, borderRadius: 14, alignItems: "center", marginTop: 4 },
  btnText: { color: "#0f172a", fontWeight: "700", fontSize: 16 },
  footer: { textAlign: "center", color: COLORS.textMuted, fontSize: 14, marginTop: 24 },
  link: { color: COLORS.orange, fontWeight: "600" },
});
