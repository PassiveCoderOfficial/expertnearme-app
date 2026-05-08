import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth";
import { COLORS, API_BASE } from "@/constants";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, token, refresh } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { setError("Name required"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Cookie: `token=${token}`,
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.ok) {
        await refresh();
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

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.container}>
          <Text style={s.title}>Edit Profile</Text>

          {!!error && <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View>}
          {success && <View style={s.successBox}><Text style={s.successText}>Saved!</Text></View>}

          <View style={s.field}>
            <Text style={s.label}>Full Name</Text>
            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={COLORS.textDim}
              autoCapitalize="words"
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Email</Text>
            <TextInput
              style={[s.input, s.inputDisabled]}
              value={user?.email || ""}
              editable={false}
              placeholderTextColor={COLORS.textDim}
            />
            <Text style={s.hint}>Email cannot be changed here</Text>
          </View>

          <TouchableOpacity
            style={[s.btn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#0f172a" /> : <Text style={s.btnText}>Save Changes</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, gap: 16 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: 8 },
  errorBox: { backgroundColor: "rgba(239,68,68,0.15)", borderWidth: 1, borderColor: "rgba(239,68,68,0.3)", borderRadius: 10, padding: 12 },
  errorText: { color: "#fca5a5", fontSize: 13 },
  successBox: { backgroundColor: "rgba(34,197,94,0.15)", borderWidth: 1, borderColor: "rgba(34,197,94,0.3)", borderRadius: 10, padding: 12 },
  successText: { color: "#86efac", fontSize: 13 },
  field: { gap: 6 },
  label: { fontSize: 11, fontWeight: "600", color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { backgroundColor: COLORS.slate800, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, color: COLORS.text, fontSize: 15 },
  inputDisabled: { opacity: 0.5 },
  hint: { fontSize: 11, color: COLORS.textDim },
  btn: { backgroundColor: COLORS.orange, paddingVertical: 15, borderRadius: 14, alignItems: "center", marginTop: 8 },
  btnText: { color: "#0f172a", fontWeight: "700", fontSize: 16 },
});
