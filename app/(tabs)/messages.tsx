import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { COLORS, API_BASE } from "@/constants";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: number;
  updatedAt: string;
  otherUser?: { id: number; name?: string; email: string };
  lastMessage?: { content: string; read: boolean; senderId: number };
}

export default function MessagesScreen() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API_BASE}/api/messages`, {
      headers: { Authorization: `Bearer ${token}`, Cookie: `token=${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.conversations) setConvos(d.conversations); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (!user) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.emptyText}>Sign in to view messages</Text>
          <TouchableOpacity style={s.btn} onPress={() => router.push("/(auth)/login")}>
            <Text style={s.btnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.titleRow}><Text style={s.title}>Messages</Text></View>

      {loading ? (
        <ActivityIndicator color={COLORS.orange} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={convos}
          keyExtractor={(c) => String(c.id)}
          contentContainerStyle={s.list}
          renderItem={({ item }) => {
            const isUnread = item.lastMessage && !item.lastMessage.read && item.lastMessage.senderId !== user.id;
            return (
              <TouchableOpacity style={s.row}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{(item.otherUser?.name || item.otherUser?.email || "U")[0].toUpperCase()}</Text>
                </View>
                <View style={s.rowInfo}>
                  <View style={s.rowTop}>
                    <Text style={[s.name, isUnread && s.nameBold]}>{item.otherUser?.name || item.otherUser?.email}</Text>
                    <Text style={s.time}>{formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}</Text>
                  </View>
                  <Text style={[s.preview, isUnread && s.previewBold]} numberOfLines={1}>
                    {item.lastMessage?.content || "No messages yet"}
                  </Text>
                </View>
                {isUnread && <View style={s.dot} />}
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={s.sep} />}
          ListEmptyComponent={
            <View style={s.center}>
              <Text style={s.emptyText}>No conversations yet</Text>
              <Text style={s.emptySubtext}>Message an expert from their profile</Text>
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
  list: { paddingVertical: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.orange + "30", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontWeight: "700", color: COLORS.orange },
  rowInfo: { flex: 1 },
  rowTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  name: { fontSize: 15, color: COLORS.text, fontWeight: "500" },
  nameBold: { fontWeight: "700" },
  time: { fontSize: 11, color: COLORS.textDim },
  preview: { fontSize: 13, color: COLORS.textMuted },
  previewBold: { color: COLORS.text, fontWeight: "600" },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.orange },
  sep: { height: 1, backgroundColor: COLORS.border, marginLeft: 76 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16, fontWeight: "700", color: COLORS.textMuted },
  emptySubtext: { fontSize: 13, color: COLORS.textDim },
  btn: { backgroundColor: COLORS.orange, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: "#0f172a", fontWeight: "700" },
});
