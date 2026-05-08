import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface OnboardingState {
  completed: boolean;
  hydrated: boolean;
  init: () => Promise<void>;
  complete: () => Promise<void>;
  reset: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  completed: false,
  hydrated: false,

  init: async () => {
    const val = await AsyncStorage.getItem("onboardingCompleted");
    set({ completed: val === "true", hydrated: true });
  },

  complete: async () => {
    await AsyncStorage.setItem("onboardingCompleted", "true");
    set({ completed: true });
  },

  reset: async () => {
    await AsyncStorage.removeItem("onboardingCompleted");
    set({ completed: false });
  },
}));
