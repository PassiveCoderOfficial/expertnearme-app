import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { COLORS, API_BASE } from "@/constants";
import { format } from "date-fns";

interface Booking {
  id: number;
  status: string;
  scheduledAt: string;
  expert?: { name: string; profileLink?: string };
  service?: { name: string };
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: "#f59e0b",
  APPROVED: "#22c55e",
  DECLINED: "#ef4444",
  DONE: "#64748b",
  RESCHEDULED: "#6366f1",
};

export default function BookingsScreen() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API_BASE}/api/bookings`, {
      headers: { Authorization: `Bearer ${token}`, Cookie: `token=${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.bookings) setBookings(d.bookings); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (!user) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.emptyText}>Sign in to view your bookings</Text>
          <TouchableOpacity style={s.btn} onPress={() => router.push("/(auth)/login")}>
            <Text style={s.btnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.titleRow}>
        <Text style={s.title}>My Bookings</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.orange} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(b) => String(b.id)}
          contentContainerStyle={s.list}
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardTop}>
                <Text style={s.expertName}>{item.expert?.name || "Expert"}</Text>
                <View style={[s.statusBadge, { backgroundColor: (STATUS_COLOR[item.status] || "#64748b") + "25" }]}>
                  <Text style={[s.statusText, { color: STATUS_COLOR[item.status] || "#64748b" }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
              {item.service && <Text style={s.service}>{item.service.name}</Text>}
              <Text style={s.date}>
                📅 {format(new Date(item.scheduledAt), "MMM d, yyyy · h:mm a")}
              </Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <View style={s.center}>
              <Text style={s.emptyText}>No bookings yet</Text>
              <Text style={s.emptySubtext}>Book an expert from their profile</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  titleRow: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  list: { padding: 16 },
  card: { backgroundColor: COLORS.slate800, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  expertName: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "700" },
  service: { fontSize: 13, color: COLORS.textMuted, marginBottom: 6 },
  date: { fontSize: 12, color: COLORS.textDim },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16, fontWeight: "700", color: COLORS.textMuted },
  emptySubtext: { fontSize: 13, color: COLORS.textDim },
  btn: { backgroundColor: COLORS.orange, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: "#0f172a", fontWeight: "700" },
});
