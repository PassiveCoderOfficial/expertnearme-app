import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "@/store/auth";
import { useOnboardingStore } from "@/store/onboarding";
import { useCountryStore } from "@/store/country";
import { COLORS } from "@/constants";

function Splash() {
  return (
    <View style={s.splash}>
      <View style={s.logoMark}>
        <Text style={s.logoText}>E</Text>
      </View>
      <Text style={s.brand}>
        <Text style={{ color: COLORS.orange }}>Expert</Text>Near.Me
      </Text>
    </View>
  );
}

function RootNav() {
  const router = useRouter();
  const segments = useSegments();
  const { user, hydrated: authHydrated, init: initAuth } = useAuthStore();
  const { completed: onboardingDone, hydrated: onboardingHydrated, init: initOnboarding } = useOnboardingStore();
  const { init: initCountry } = useCountryStore();

  useEffect(() => {
    initAuth();
    initOnboarding();
    initCountry();
  }, []);

  useEffect(() => {
    if (!authHydrated || !onboardingHydrated) return;

    const inOnboarding = segments[0] === "(onboarding)";
    const inAuth = segments[0] === "(auth)";

    if (!onboardingDone && !inOnboarding) {
      router.replace("/(onboarding)/welcome");
      return;
    }
    if (onboardingDone && !user && !inAuth) {
      router.replace("/(auth)/login");
      return;
    }
    if (onboardingDone && user && (inAuth || inOnboarding)) {
      router.replace("/(tabs)");
      return;
    }
  }, [authHydrated, onboardingHydrated, user, onboardingDone]);

  // Block all rendering until stores are ready — prevents flash of wrong screen
  if (!authHydrated || !onboardingHydrated) {
    return <Splash />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bg } }}>
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="expert/[slug]"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.slate900 },
          headerTintColor: COLORS.text,
          title: "",
        }}
      />
      <Stack.Screen
        name="profile/edit"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.slate900 },
          headerTintColor: COLORS.text,
          title: "Edit Profile",
        }}
      />
      <Stack.Screen
        name="profile/expert-edit"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.slate900 },
          headerTintColor: COLORS.text,
          title: "Expert Profile",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar style="light" />
      <RootNav />
    </GestureHandlerRootView>
  );
}

const s = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: COLORS.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontSize: 34, fontWeight: "900", color: "#fff" },
  brand: { fontSize: 24, fontWeight: "800", color: COLORS.text },
});
