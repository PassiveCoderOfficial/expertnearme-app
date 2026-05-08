import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth";
import { COLORS, API_BASE } from "@/constants";

export default function ExpertEditScreen() {
  const router = useRouter();
  const { user, token, refresh } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    whatsapp: "",
    bio: "",
    shortDesc: "",
    webAddress: "",
    officeAddress: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/experts/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Cookie: `token=${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        setSuccess(true);
        setTimeout(() => router.back(), 1000);
      } else {
        setError(data.error || "Save failed");
      }
    } catch {
      setError("Network error");
    }
    setSaving(false);
  };

  const fields: { key: keyof typeof form; label: string; placeholder: string; multiline?: boolean }[] = [
    { key: "name", label: "Display Name", placeholder: "Your name or business name" },
    { key: "shortDesc", label: "Short Tagline", placeholder: "e.g. Professional Web Designer" },
    { key: "bio", label: "Bio", placeholder: "Tell clients about yourself…", multiline: true },
    { key: "phone", label: "Phone", placeholder: "+1 234 567 8901" },
    { key: "whatsapp", label: "WhatsApp", placeholder: "+1 234 567 8901" },
    { key: "officeAddress", label: "Office Address", placeholder: "123 Main St, City" },
    { key: "webAddress", label: "Website", placeholder: "https://yoursite.com" },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.container}>
          <Text style={s.title}>Expert Profile</Text>
          <Text style={s.subtitle}>This info appears on your public expert listing</Text>

          {!!error && <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View>}
          {success && <View style={s.successBox}><Text style={s.successText}>Saved!</Text></View>}

          {fields.map((f) => (
            <View key={f.key} style={s.field}>
              <Text style={s.label}>{f.label}</Text>
              <TextInput
                style={[s.input, f.multiline && s.inputMulti]}
                value={form[f.key]}
                onChangeText={set(f.key)}
                placeholder={f.placeholder}
                placeholderTextColor={COLORS.textDim}
                multiline={f.multiline}
                numberOfLines={f.multiline ? 4 : 1}
                textAlignVertical={f.multiline ? "top" : "center"}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[s.btn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#0f172a" /> : <Text style={s.btnText}>Save Expert Profile</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, gap: 14 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginBottom: 4 },
  errorBox: { backgroundColor: "rgba(239,68,68,0.15)", borderWidth: 1, borderColor: "rgba(239,68,68,0.3)", borderRadius: 10, padding: 12 },
  errorText: { color: "#fca5a5", fontSize: 13 },
  successBox: { backgroundColor: "rgba(34,197,94,0.15)", borderWidth: 1, borderColor: "rgba(34,197,94,0.3)", borderRadius: 10, padding: 12 },
  successText: { color: "#86efac", fontSize: 13 },
  field: { gap: 6 },
  label: { fontSize: 11, fontWeight: "600", color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { backgroundColor: COLORS.slate800, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, color: COLORS.text, fontSize: 15 },
  inputMulti: { minHeight: 100, paddingTop: 12 },
  btn: { backgroundColor: COLORS.orange, paddingVertical: 15, borderRadius: 14, alignItems: "center", marginTop: 8 },
  btnText: { color: "#0f172a", fontWeight: "700", fontSize: 16 },
});
