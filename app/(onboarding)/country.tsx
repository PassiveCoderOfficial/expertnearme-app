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
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/countries`)
      .then((r) => r.json())
      .then((d) => {
        if (d.countries && d.countries.length > 0) {
          setCountries(d.countries);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = query.trim()
    ? countries.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.code.toLowerCase().includes(query.toLowerCase())
      )
    : countries;

  const handleSelect = async (country: Country) => {
    await setCountry(country);
    router.push("/(onboarding)/role");
  };

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={s.headerText}>
          <Text style={s.step}>Step 1 of 2</Text>
          <Text style={s.title}>Select your country</Text>
          <Text style={s.subtitle}>Experts and categories vary by country</Text>
        </View>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.search}
          placeholder="Search country…"
          placeholderTextColor={COLORS.textDim}
          value={query}
          onChangeText={setQuery}
          autoFocus={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Text style={s.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={COLORS.orange} size="large" />
          <Text style={s.loadingText}>Loading countries…</Text>
        </View>
      ) : error ? (
        <View style={s.center}>
          <Text style={s.errorEmoji}>🌐</Text>
          <Text style={s.errorTitle}>Couldn't load countries</Text>
          <Text style={s.errorSub}>Check your connection and try again</Text>
          <TouchableOpacity
            style={s.retryBtn}
            onPress={() => {
              setError(false);
              setLoading(true);
              fetch(`${API_BASE}/api/countries`)
                .then((r) => r.json())
                .then((d) => { if (d.countries?.length) setCountries(d.countries); else setError(true); })
                .catch(() => setError(true))
                .finally(() => setLoading(false));
            }}
          >
            <Text style={s.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : filtered.length === 0 ? (
        <View style={s.center}>
          <Text style={s.errorEmoji}>🔍</Text>
          <Text style={s.errorTitle}>No results for "{query}"</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.code}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.row} onPress={() => handleSelect(item)} activeOpacity={0.7}>
              <View style={s.flagWrap}>
                <Text style={s.flag}>{item.flagEmoji || "🌐"}</Text>
              </View>
              <Text style={s.name}>{item.name}</Text>
              <Text style={s.code}>{item.code.toUpperCase()}</Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={s.sep} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  backBtn: { marginTop: 4, padding: 4 },
  backText: { fontSize: 22, color: COLORS.textMuted },
  headerText: { flex: 1, gap: 2 },
  step: { fontSize: 11, color: COLORS.orange, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textMuted },
  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: COLORS.slate800, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 14, marginHorizontal: 20, marginBottom: 8,
    paddingHorizontal: 14, paddingVertical: 11,
  },
  searchIcon: { fontSize: 16 },
  search: { flex: 1, color: COLORS.text, fontSize: 15 },
  clearBtn: { color: COLORS.textDim, fontSize: 16, padding: 2 },
  row: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingVertical: 13, paddingHorizontal: 20,
  },
  flagWrap: { width: 38, height: 38, borderRadius: 10, backgroundColor: COLORS.slate800, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.border },
  flag: { fontSize: 22 },
  name: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: "500" },
  code: { fontSize: 11, color: COLORS.textDim, fontWeight: "700", letterSpacing: 0.5 },
  sep: { height: 1, backgroundColor: COLORS.border, marginLeft: 72 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingBottom: 60 },
  loadingText: { fontSize: 13, color: COLORS.textDim, marginTop: 8 },
  errorEmoji: { fontSize: 40 },
  errorTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textMuted },
  errorSub: { fontSize: 13, color: COLORS.textDim },
  retryBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 11, backgroundColor: COLORS.orange, borderRadius: 12 },
  retryText: { color: "#0f172a", fontWeight: "700" },
});
