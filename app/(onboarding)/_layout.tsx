import { Stack } from "expo-router";
import { COLORS } from "@/constants";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bg } }} />
  );
}
