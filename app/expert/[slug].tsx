import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
  Image, Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCountryStore } from "@/store/country";
import { useAuthStore } from "@/store/auth";
import { COLORS, API_BASE } from "@/constants";

interface Expert {
  id: number;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  bio?: string;
  shortDesc?: string;
  profilePicture?: string;
  coverPhoto?: string;
  countryCode?: string;
  verified?: boolean;
  featured?: boolean;
  foundingExpert?: boolean;
  webAddress?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  categories?: { category: { name: string; slug: string } }[];
  services?: { id: number; name: string; price?: number; rateUnit?: string; description?: string }[];
  portfolio?: { id: number; title?: string; imageUrl?: string; description?: string }[];
  reviews?: { id: number; rating: number; comment?: string; client?: { name?: string } }[];
}

export default function ExpertProfileScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { selected: country } = useCountryStore();
  const { user, token } = useAuthStore();
  const [expert, setExpert] = useState<Expert | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const countryCode = country?.code || "us";

  useEffect(() => {
    fetch(`${API_BASE}/api/experts/${slug}?countryCode=${countryCode}`)
      .then((r) => r.json())
      .then((d) => { if (d.expert) setExpert(d.expert); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const avgRating = expert?.reviews?.length
    ? (expert.reviews.reduce((s, r) => s + r.rating, 0) / expert.reviews.length).toFixed(1)
    : null;

  const handleSave = async () => {
    if (!token) { router.push("/(auth)/login"); return; }
    setSaved((v) => !v);
  };

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <ActivityIndicator color={COLORS.orange} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!expert) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.notFound}>Expert not found</Text>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Text style={s.backText}>← Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover */}
        <View style={s.coverWrap}>
          {expert.coverPhoto
            ? <Image source={{ uri: expert.coverPhoto }} style={s.cover} />
            : <View style={[s.cover, { backgroundColor: COLORS.orange + "20" }]} />
          }
          <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
            <Text style={s.saveIcon}>{saved ? "❤️" : "🤍"}</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar + name */}
        <View style={s.profileSection}>
          <View style={s.avatarWrap}>
            {expert.profilePicture
              ? <Image source={{ uri: expert.profilePicture }} style={s.avatar} />
              : <View style={s.avatarPlaceholder}><Text style={s.avatarInitial}>{expert.name[0]}</Text></View>
            }
          </View>
          <View style={s.nameBlock}>
            <View style={s.nameRow}>
              <Text style={s.name}>{expert.name}</Text>
              {expert.verified && <Text style={s.verifiedBadge}>✓</Text>}
              {expert.foundingExpert && <Text style={s.goldBadge}>⭐</Text>}
            </View>
            {expert.shortDesc && <Text style={s.shortDesc}>{expert.shortDesc}</Text>}
            <View style={s.metaRow}>
              {avgRating && (
                <Text style={s.rating}>⭐ {avgRating} ({expert.reviews?.length})</Text>
              )}
              {expert.categories?.slice(0, 2).map((c) => (
                <View key={c.category.slug} style={s.tag}>
                  <Text style={s.tagText}>{c.category.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Contact buttons */}
        <View style={s.contactRow}>
          {expert.whatsapp && (
            <TouchableOpacity style={[s.contactBtn, { backgroundColor: "#22c55e" }]} onPress={() => Linking.openURL(`https://wa.me/${expert.whatsapp}`)}>
              <Text style={s.contactBtnText}>WhatsApp</Text>
            </TouchableOpacity>
          )}
          {expert.phone && (
            <TouchableOpacity style={s.contactBtnOutline} onPress={() => Linking.openURL(`tel:${expert.phone}`)}>
              <Text style={s.contactBtnOutlineText}>Call</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[s.contactBtn, { backgroundColor: COLORS.orange }]}>
            <Text style={s.contactBtnText}>Book Now</Text>
          </TouchableOpacity>
        </View>

        {/* Bio */}
        {expert.bio && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>About</Text>
            <Text style={s.bioText}>{expert.bio}</Text>
          </View>
        )}

        {/* Services */}
        {expert.services && expert.services.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Services</Text>
            {expert.services.map((svc) => (
              <View key={svc.id} style={s.serviceCard}>
                <View style={s.serviceInfo}>
                  <Text style={s.serviceName}>{svc.name}</Text>
                  {svc.description && <Text style={s.serviceDesc}>{svc.description}</Text>}
                </View>
                {svc.price != null && (
                  <Text style={s.servicePrice}>${svc.price}{svc.rateUnit ? `/${svc.rateUnit}` : ""}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Portfolio */}
        {expert.portfolio && expert.portfolio.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Portfolio</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {expert.portfolio.map((p) => (
                <View key={p.id} style={s.portfolioCard}>
                  {p.imageUrl && <Image source={{ uri: p.imageUrl }} style={s.portfolioImg} />}
                  {p.title && <Text style={s.portfolioTitle}>{p.title}</Text>}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Reviews */}
        {expert.reviews && expert.reviews.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Reviews</Text>
            {expert.reviews.slice(0, 5).map((rev) => (
              <View key={rev.id} style={s.reviewCard}>
                <View style={s.reviewHeader}>
                  <Text style={s.reviewAuthor}>{rev.client?.name || "Client"}</Text>
                  <Text style={s.reviewRating}>{"⭐".repeat(rev.rating)}</Text>
                </View>
                {rev.comment && <Text style={s.reviewComment}>{rev.comment}</Text>}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  coverWrap: { position: "relative" },
  cover: { width: "100%", height: 180 },
  saveBtn: { position: "absolute", top: 12, right: 12, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, padding: 8 },
  saveIcon: { fontSize: 20 },
  profileSection: { flexDirection: "row", gap: 14, padding: 16, paddingTop: 0, marginTop: -28 },
  avatarWrap: { marginTop: -20 },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: COLORS.bg },
  avatarPlaceholder: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.orange + "30", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: COLORS.bg },
  avatarInitial: { fontSize: 28, fontWeight: "700", color: COLORS.orange },
  nameBlock: { flex: 1, paddingTop: 12 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  name: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  verifiedBadge: { color: "#22c55e", fontSize: 14 },
  goldBadge: { fontSize: 14 },
  shortDesc: { fontSize: 13, color: COLORS.textMuted, marginTop: 3 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" },
  rating: { fontSize: 13, color: COLORS.textMuted },
  tag: { backgroundColor: COLORS.orange + "20", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 11, color: COLORS.orange, fontWeight: "600" },
  contactRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingBottom: 8 },
  contactBtn: { flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: "center" },
  contactBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  contactBtnOutline: { flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  contactBtnOutlineText: { color: COLORS.text, fontWeight: "700", fontSize: 13 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  bioText: { fontSize: 14, color: COLORS.textMuted, lineHeight: 21 },
  serviceCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", padding: 14, backgroundColor: COLORS.slate800, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  serviceDesc: { fontSize: 12, color: COLORS.textMuted, marginTop: 3 },
  servicePrice: { fontSize: 14, fontWeight: "700", color: COLORS.orange },
  portfolioCard: { width: 140, marginRight: 12, borderRadius: 12, overflow: "hidden", backgroundColor: COLORS.slate800 },
  portfolioImg: { width: 140, height: 100 },
  portfolioTitle: { fontSize: 12, color: COLORS.textMuted, padding: 8 },
  reviewCard: { padding: 14, backgroundColor: COLORS.slate800, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  reviewAuthor: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  reviewRating: { fontSize: 12 },
  reviewComment: { fontSize: 13, color: COLORS.textMuted },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFound: { fontSize: 18, fontWeight: "700", color: COLORS.textMuted },
  backBtn: { padding: 12 },
  backText: { color: COLORS.orange, fontWeight: "600" },
});
