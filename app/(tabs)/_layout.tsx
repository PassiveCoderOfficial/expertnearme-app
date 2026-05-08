import { Tabs } from "expo-router";
import { COLORS } from "@/constants";

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <>{/* emoji as tab icon */}</>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.slate900,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: COLORS.orange,
        tabBarInactiveTintColor: COLORS.textDim,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: ({ color }) => <TabBarEmoji emoji="🏠" color={color} /> }}
      />
      <Tabs.Screen
        name="search"
        options={{ title: "Search", tabBarIcon: ({ color }) => <TabBarEmoji emoji="🔍" color={color} /> }}
      />
      <Tabs.Screen
        name="bookings"
        options={{ title: "Bookings", tabBarIcon: ({ color }) => <TabBarEmoji emoji="📅" color={color} /> }}
      />
      <Tabs.Screen
        name="messages"
        options={{ title: "Messages", tabBarIcon: ({ color }) => <TabBarEmoji emoji="💬" color={color} /> }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{ title: "Dashboard", tabBarIcon: ({ color }) => <TabBarEmoji emoji="⚡" color={color} /> }}
      />
    </Tabs>
  );
}

function TabBarEmoji({ emoji, color }: { emoji: string; color: string }) {
  const { Text } = require("react-native");
  return <Text style={{ fontSize: 20, opacity: color === COLORS.orange ? 1 : 0.5 }}>{emoji}</Text>;
}
