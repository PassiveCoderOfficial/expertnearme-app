import { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,
  ActivityIndicator, Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCountryStore } from "@/store/country";
import { COLORS, API_BASE } from "@/constants";

interface Expert {
  id: number;
  name: string;
  profileLink?: string;
  countryCode?: string;
  shortDesc?: string;
  profilePicture?: string;
  verified?: boolean;
  featured?: boolean;
  categories?: { category: { name: string; slug: string } }[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; category?: string }>();
  const { selected: country } = useCountryStore();

  const [query, setQuery] = useState(params.q || "");
  const [selectedCategory, setSelectedCategory] = useState(params.category || "");
  const [experts, setExperts] = useState<Expert[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const countryCode = country?.code || "us";

  useEffect(() => {
    fetch(`${API_BASE}/api/categories?countryCode=${countryCode}&limit=20`)
      .then((r) => r.json())
      .then((d) => { if (d.categories) setCategories(d.categories); })
      .catch(() => {});
  }, [countryCode]);

  useEffect(() => { doSearch(1); }, [query, selectedCategory, countryCode]);

  const doSearch = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ countryCode, page: String(p), limit: "20" });
      if (query) params.set("q", query);
      if (selectedCategory) params.set("category", selectedCategory);
      const res = await fetch(`${API_BASE}/api/experts?${params}`);
      const data = await res.json();
      if (data.experts) {
        setExperts(p === 1 ? data.experts : (prev) => [...prev, ...data.experts]);
        setPage(p);
      }
    } catch {}
    setLoading(false);
  };

  const renderExpert = ({ item }: { item: Expert }) => (
    <TouchableOpacity
      style={s.card}
      onPress={() => router.push(`/expert/${item.profileLink || item.id}`)}
    >
      <View style={s.avatar}>
        {item.profilePicture
          ? <Image source={{ uri: item.profilePicture }} style={s.avatarImg} />
          : <Text style={s.avatarInitial}>{item.name[0]}</Text>
        }
      </View>
      <View style={s.cardInfo}>
        <View style={s.cardNameRow}>
          <Text style={s.cardName} numberOfLines={1}>{item.name}</Text>
          {item.verified && <Text style={s.badge}>✓</Text>}
          {item.featured && <Text style={s.featBadge}>⭐</Text>}
        </View>
        <Text style={s.cardDesc} numberOfLines={2}>{item.shortDesc || "Expert"}</Text>
        {item.categories?.length ? (
          <View style={s.tagsRow}>
            {item.categories.slice(0, 2).map((c) => (
              <View key={c.category.slug} style={s.tag}>
                <Text style={s.tagText}>{c.category.name}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <Text style={s.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.safe}>
      {/* Search input */}
      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          placeholder="Search experts…"
          placeholderTextColor={COLORS.textDim}
          value={query}
          onChangeText={(v) => { setQuery(v); }}
          returnKeyType="search"
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery("")} style={s.clearBtn}>
            <Text style={{ color: COLORS.textMuted, fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category filter pills */}
      {categories.length > 0 && (
        <FlatList
          data={[{ id: 0, name: "All", slug: "", icon: "🌐" }, ...categories]}
          keyExtractor={(c) => c.slug || "all"}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[s.filterPill, selectedCategory === item.slug && s.filterPillActive]}
              onPress={() => setSelectedCategory(item.slug)}
            >
              <Text style={s.filterIcon}>{item.icon || "📁"}</Text>
              <Text style={[s.filterText, selectedCategory === item.slug && s.filterTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Results */}
      {loading && experts.length === 0 ? (
        <ActivityIndicator color={COLORS.orange} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={experts}
          keyExtractor={(e) => String(e.id)}
          renderItem={renderExpert}
          contentContainerStyle={s.list}
          ItemSeparatorComponent={() => <View style={s.sep} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyText}>No experts found</Text>
              <Text style={s.emptySubtext}>Try a different search or category</Text>
            </View>
          }
          onEndReached={() => doSearch(page + 1)}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loading ? <ActivityIndicator color={COLORS.orange} style={{ padding: 16 }} /> : null}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  searchRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  searchInput: { flex: 1, backgroundColor: COLORS.slate800, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, color: COLORS.text, fontSize: 14 },
  clearBtn: { padding: 8 },
  filterList: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  filterPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.slate800 },
  filterPillActive: { borderColor: COLORS.orange, backgroundColor: COLORS.orange + "20" },
  filterIcon: { fontSize: 14 },
  filterText: { fontSize: 12, color: COLORS.textMuted, fontWeight: "600" },
  filterTextActive: { color: COLORS.orange },
  list: { padding: 16 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, backgroundColor: COLORS.slate800, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.orange + "25", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 },
  avatarImg: { width: 52, height: 52 },
  avatarInitial: { fontSize: 20, fontWeight: "700", color: COLORS.orange },
  cardInfo: { flex: 1 },
  cardNameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 },
  cardName: { fontSize: 15, fontWeight: "700", color: COLORS.text, flex: 1 },
  badge: { fontSize: 12, color: "#22c55e" },
  featBadge: { fontSize: 12 },
  cardDesc: { fontSize: 12, color: COLORS.textMuted, lineHeight: 16, marginBottom: 6 },
  tagsRow: { flexDirection: "row", gap: 6 },
  tag: { backgroundColor: COLORS.orange + "20", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 10, color: COLORS.orange, fontWeight: "600" },
  arrow: { fontSize: 20, color: COLORS.textDim },
  sep: { height: 10 },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "700", color: COLORS.textMuted },
  emptySubtext: { fontSize: 13, color: COLORS.textDim },
});
