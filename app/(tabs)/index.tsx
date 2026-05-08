import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
  TextInput, Image, Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth";
import { useCountryStore } from "@/store/country";
import { COLORS, API_BASE } from "@/constants";

const { width } = Dimensions.get("window");

interface Expert {
  id: number;
  name: string;
  slug?: string;
  profileLink?: string;
  countryCode?: string;
  shortDesc?: string;
  profilePicture?: string;
  categories?: { category: { name: string } }[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { selected: country } = useCountryStore();
  const [featuredExperts, setFeaturedExperts] = useState<Expert[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const countryCode = country?.code || "us";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [expRes, catRes] = await Promise.all([
          fetch(`${API_BASE}/api/experts?countryCode=${countryCode}&featured=true&limit=6`),
          fetch(`${API_BASE}/api/categories?countryCode=${countryCode}&homepage=true&limit=8`),
        ]);
        const expData = await expRes.json();
        const catData = await catRes.json();
        if (expData.experts) setFeaturedExperts(expData.experts);
        if (catData.categories) setCategories(catData.categories);
      } catch {}
      setLoading(false);
    };
    load();
  }, [countryCode]);

  const handleSearch = () => {
    if (query.trim()) router.push({ pathname: "/(tabs)/search", params: { q: query } });
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>
              {user ? `Hey, ${user.name?.split(" ")[0] || "there"} 👋` : "Find Experts"}
            </Text>
            <TouchableOpacity
              style={s.countryChip}
              onPress={() => router.push("/(tabs)/search")}
            >
              <Text style={s.countryEmoji}>{country?.flagEmoji || "🌐"}</Text>
              <Text style={s.countryName}>{country?.name || "Select country"}</Text>
              <Text style={s.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        <View style={s.searchRow}>
          <TextInput
            style={s.searchInput}
            placeholder="Search experts, skills…"
            placeholderTextColor={COLORS.textDim}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={s.searchBtn} onPress={handleSearch}>
            <Text style={{ fontSize: 18 }}>🔍</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.orange} style={{ marginTop: 48 }} />
        ) : (
          <>
            {/* Categories */}
            {categories.length > 0 && (
              <View style={s.section}>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionTitle}>Browse Categories</Text>
                  <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
                    <Text style={s.seeAll}>See all</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.categoryScroll}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={s.categoryChip}
                      onPress={() => router.push({ pathname: "/(tabs)/search", params: { category: cat.slug } })}
                    >
                      <Text style={s.categoryIcon}>{cat.icon || "📁"}</Text>
                      <Text style={s.categoryName}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Featured Experts */}
            {featuredExperts.length > 0 && (
              <View style={s.section}>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionTitle}>Featured Experts</Text>
                  <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
                    <Text style={s.seeAll}>See all</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {featuredExperts.map((expert) => (
                    <TouchableOpacity
                      key={expert.id}
                      style={s.expertCard}
                      onPress={() => router.push(`/expert/${expert.profileLink || expert.slug || expert.id}`)}
                    >
                      <View style={s.expertAvatar}>
                        {expert.profilePicture ? (
                          <Image source={{ uri: expert.profilePicture }} style={s.expertImg} />
                        ) : (
                          <Text style={s.expertInitial}>{expert.name[0]}</Text>
                        )}
                      </View>
                      <Text style={s.expertName} numberOfLines={1}>{expert.name}</Text>
                      <Text style={s.expertDesc} numberOfLines={2}>{expert.shortDesc || "Expert"}</Text>
                      {expert.categories?.[0] && (
                        <View style={s.expertTag}>
                          <Text style={s.expertTagText}>{expert.categories[0].category.name}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* CTA for non-experts */}
            {(!user || user.activeRole === "BUYER") && (
              <View style={s.cta}>
                <Text style={s.ctaTitle}>Are you an expert?</Text>
                <Text style={s.ctaDesc}>List your services and reach clients in your country</Text>
                <TouchableOpacity
                  style={s.ctaBtn}
                  onPress={() => router.push("/(tabs)/dashboard")}
                >
                  <Text style={s.ctaBtnText}>Create Expert Profile →</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ height: 32 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_W = 160;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  greeting: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: 4 },
  countryChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: COLORS.slate800, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, alignSelf: "flex-start" },
  countryEmoji: { fontSize: 16 },
  countryName: { fontSize: 13, color: COLORS.textMuted, fontWeight: "500" },
  chevron: { fontSize: 16, color: COLORS.textDim },
  searchRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20, paddingVertical: 12 },
  searchInput: { flex: 1, backgroundColor: COLORS.slate800, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, color: COLORS.text, fontSize: 14 },
  searchBtn: { backgroundColor: COLORS.orange, width: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: COLORS.text },
  seeAll: { fontSize: 13, color: COLORS.orange, fontWeight: "600" },
  categoryScroll: { paddingLeft: 20 },
  categoryChip: { backgroundColor: COLORS.slate800, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginRight: 10, alignItems: "center", gap: 4, minWidth: 80 },
  categoryIcon: { fontSize: 22 },
  categoryName: { fontSize: 11, color: COLORS.textMuted, fontWeight: "600", textAlign: "center" },
  expertCard: { width: CARD_W, backgroundColor: COLORS.slate800, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 14, marginLeft: 16, marginBottom: 4 },
  expertAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.orange + "30", alignItems: "center", justifyContent: "center", marginBottom: 10, overflow: "hidden" },
  expertImg: { width: 52, height: 52, borderRadius: 26 },
  expertInitial: { fontSize: 22, fontWeight: "700", color: COLORS.orange },
  expertName: { fontSize: 14, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  expertDesc: { fontSize: 12, color: COLORS.textMuted, lineHeight: 16, marginBottom: 8 },
  expertTag: { backgroundColor: COLORS.orange + "20", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: "flex-start" },
  expertTagText: { fontSize: 10, color: COLORS.orange, fontWeight: "600" },
  cta: { margin: 20, padding: 20, backgroundColor: COLORS.slate800, borderRadius: 20, borderWidth: 1, borderColor: COLORS.orange + "30", gap: 8 },
  ctaTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  ctaDesc: { fontSize: 13, color: COLORS.textMuted },
  ctaBtn: { backgroundColor: COLORS.orange, paddingVertical: 12, borderRadius: 12, alignItems: "center", marginTop: 4 },
  ctaBtnText: { color: "#0f172a", fontWeight: "700", fontSize: 14 },
});
