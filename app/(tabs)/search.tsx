"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,
  ActivityIndicator, Image, ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCountryStore } from "@/store/country";
import { COLORS, API_BASE } from "@/constants";

interface Expert {
  id: number;
  name: string;
  profileLink?: string;
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
  const { selected: country } = useCountryStore();
  const countryCode = country?.code || "us";

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [experts, setExperts] = useState<Expert[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/categories?countryCode=${countryCode}&limit=30`)
      .then((r) => r.json())
      .then((d) => { if (d.categories) setCategories(d.categories); })
      .catch(() => {});
  }, [countryCode]);

  const doSearch = useCallback(async (q: string, cat: string, p: number) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ countryCode, page: String(p), limit: "20" });
      if (q) qs.set("q", q);
      if (cat) qs.set("category", cat);
      const res = await fetch(`${API_BASE}/api/experts?${qs}`);
      const data = await res.json();
      const incoming: Expert[] = data.experts || [];
      setExperts((prev) => p === 1 ? incoming : [...prev, ...incoming]);
      setHasMore(incoming.length === 20);
      setPage(p);
    } catch {}
    setLoading(false);
  }, [countryCode]);

  // Debounced search on query change
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      doSearch(query, selectedCategory, 1);
    }, query ? 400 : 0);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [query, selectedCategory, countryCode]);

  const loadMore = () => {
    if (!loading && hasMore) doSearch(query, selectedCategory, page + 1);
  };

  const renderExpert = ({ item }: { item: Expert }) => (
    <TouchableOpacity
      style={s.card}
      onPress={() => router.push(`/expert/${item.profileLink || item.id}`)}
      activeOpacity={0.75}
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
          {item.verified && <Text style={s.verifiedBadge}>✓</Text>}
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

  const showCategoryGrid = !query && !selectedCategory && experts.length === 0 && categories.length > 0;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Search Experts</Text>
      </View>

      {/* Search input */}
      <View style={s.searchRow}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search by name, skill, or keyword…"
          placeholderTextColor={COLORS.textDim}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery("")} style={s.clearBtn}>
            <Text style={{ color: COLORS.textMuted, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category filter pills (horizontal scroll, always visible) */}
      {categories.length > 0 && (
        <FlatList
          data={[{ id: 0, name: "All", slug: "", icon: "🌐" }, ...categories]}
          keyExtractor={(c) => c.slug || "all"}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.pillList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[s.pill, selectedCategory === item.slug && s.pillActive]}
              onPress={() => setSelectedCategory(selectedCategory === item.slug && item.slug !== "" ? "" : item.slug)}
            >
              <Text style={s.pillIcon}>{item.icon || "📁"}</Text>
              <Text style={[s.pillText, selectedCategory === item.slug && s.pillTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Category icon grid — shown when no search active */}
      {showCategoryGrid ? (
        <FlatList
          data={categories}
          keyExtractor={(c) => c.slug}
          numColumns={4}
          contentContainerStyle={s.gridList}
          columnWrapperStyle={s.gridRow}
          ListHeaderComponent={
            <Text style={s.sectionLabel}>Browse Categories</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.gridItem}
              onPress={() => setSelectedCategory(item.slug)}
              activeOpacity={0.75}
            >
              <View style={s.gridIconBox}>
                <Text style={s.gridIcon}>{item.icon || "📁"}</Text>
              </View>
              <Text style={s.gridLabel} numberOfLines={2}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        /* Expert results list */
        loading && experts.length === 0 ? (
          <ActivityIndicator color={COLORS.orange} style={{ marginTop: 48 }} />
        ) : (
          <FlatList
            data={experts}
            keyExtractor={(e) => String(e.id)}
            renderItem={renderExpert}
            contentContainerStyle={s.resultList}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            ListEmptyComponent={
              !loading ? (
                <View style={s.empty}>
                  <Text style={s.emptyIcon}>🔍</Text>
                  <Text style={s.emptyText}>No experts found</Text>
                  <Text style={s.emptySubtext}>Try different keywords or category</Text>
                </View>
              ) : null
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            ListFooterComponent={loading && experts.length > 0
              ? <ActivityIndicator color={COLORS.orange} style={{ padding: 20 }} />
              : null
            }
          />
        )
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  searchRow: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 16, marginVertical: 10,
    backgroundColor: COLORS.slate800, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 14, paddingHorizontal: 12, gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, paddingVertical: 12, color: COLORS.text, fontSize: 14 },
  clearBtn: { padding: 6 },
  pillList: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  pill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.slate800,
  },
  pillActive: { borderColor: COLORS.orange, backgroundColor: COLORS.orange + "22" },
  pillIcon: { fontSize: 13 },
  pillText: { fontSize: 12, color: COLORS.textMuted, fontWeight: "600" },
  pillTextActive: { color: COLORS.orange },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: COLORS.textMuted, paddingHorizontal: 16, paddingBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  gridList: { paddingBottom: 32 },
  gridRow: { paddingHorizontal: 12, gap: 8, marginBottom: 8 },
  gridItem: { flex: 1, alignItems: "center", gap: 6, padding: 8 },
  gridIconBox: {
    width: 60, height: 60, borderRadius: 16,
    backgroundColor: COLORS.slate800, borderWidth: 1, borderColor: COLORS.border,
    alignItems: "center", justifyContent: "center",
  },
  gridIcon: { fontSize: 26 },
  gridLabel: { fontSize: 11, color: COLORS.textMuted, textAlign: "center", fontWeight: "600", lineHeight: 14 },
  resultList: { paddingHorizontal: 16, paddingBottom: 32 },
  card: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14,
    backgroundColor: COLORS.slate800, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.orange + "25", alignItems: "center", justifyContent: "center",
    overflow: "hidden", flexShrink: 0,
  },
  avatarImg: { width: 52, height: 52 },
  avatarInitial: { fontSize: 20, fontWeight: "700", color: COLORS.orange },
  cardInfo: { flex: 1 },
  cardNameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 },
  cardName: { fontSize: 15, fontWeight: "700", color: COLORS.text, flex: 1 },
  verifiedBadge: { fontSize: 12, color: "#22c55e" },
  featBadge: { fontSize: 12 },
  cardDesc: { fontSize: 12, color: COLORS.textMuted, lineHeight: 16, marginBottom: 6 },
  tagsRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  tag: { backgroundColor: COLORS.orange + "20", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 10, color: COLORS.orange, fontWeight: "600" },
  arrow: { fontSize: 20, color: COLORS.textDim },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 16, fontWeight: "700", color: COLORS.textMuted },
  emptySubtext: { fontSize: 13, color: COLORS.textDim },
});
