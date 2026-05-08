import { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCountryStore } from "@/store/country";
import { COLORS, API_BASE } from "@/constants";

interface Country { code: string; name: string; flagEmoji?: string; currency?: string }

export default function CountrySelectScreen() {
  const router = useRouter();
  const { setCountry } = useCountryStore();
  const [countries, setCountries] = useState<Country[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/countries`)
      .then((r) => r.json())
      .then((d) => { if (d.countries) setCountries(d.countries); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.code.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = async (country: Country) => {
    await setCountry(country);
    router.push("/(onboarding)/role");
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.step}>Step 1 of 2</Text>
        <Text style={s.title}>Select your country</Text>
        <Text style={s.subtitle}>We'll show you experts in your region</Text>
      </View>

      <TextInput
        style={s.search}
        placeholder="Search country…"
        placeholderTextColor={COLORS.textDim}
        value={query}
        onChangeText={setQuery}
      />

      {loading ? (
        <ActivityIndicator color={COLORS.orange} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.code}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.row} onPress={() => handleSelect(item)}>
              <Text style={s.flag}>{item.flagEmoji || "🌐"}</Text>
              <Text style={s.name}>{item.name}</Text>
              <Text style={s.code}>{item.code.toUpperCase()}</Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={s.sep} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 20 },
  header: { paddingTop: 12, paddingBottom: 20, gap: 4 },
  step: { fontSize: 12, color: COLORS.orange, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textMuted },
  search: {
    backgroundColor: COLORS.slate800, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    color: COLORS.text, fontSize: 15, marginBottom: 12,
  },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 14, paddingHorizontal: 4,
  },
  flag: { fontSize: 24, width: 36 },
  name: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: "500" },
  code: { fontSize: 12, color: COLORS.textDim, fontWeight: "600" },
  sep: { height: 1, backgroundColor: COLORS.border },
});
