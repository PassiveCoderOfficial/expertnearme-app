import { useEffect } from "react";
import { Stack } from "expo-router";
import { useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "@/store/auth";
import { useOnboardingStore } from "@/store/onboarding";
import { useCountryStore } from "@/store/country";
import { COLORS } from "@/constants";

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
    const inTabs = segments[0] === "(tabs)";

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

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bg } }}>
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="expert/[slug]" options={{ headerShown: true, headerStyle: { backgroundColor: COLORS.slate900 }, headerTintColor: COLORS.text, title: "" }} />
      <Stack.Screen name="profile/edit" options={{ headerShown: true, headerStyle: { backgroundColor: COLORS.slate900 }, headerTintColor: COLORS.text, title: "Edit Profile" }} />
      <Stack.Screen name="profile/expert-edit" options={{ headerShown: true, headerStyle: { backgroundColor: COLORS.slate900 }, headerTintColor: COLORS.text, title: "Expert Profile" }} />
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
