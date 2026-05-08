import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Country {
  code: string;
  name: string;
  flagEmoji?: string;
  currency?: string;
}

interface CountryState {
  selected: Country | null;
  countries: Country[];
  hydrated: boolean;
  init: () => Promise<void>;
  setCountry: (country: Country) => Promise<void>;
  setCountries: (countries: Country[]) => void;
}

const DEFAULT_COUNTRY: Country = { code: "us", name: "United States", flagEmoji: "🇺🇸" };

export const useCountryStore = create<CountryState>((set) => ({
  selected: null,
  countries: [],
  hydrated: false,

  init: async () => {
    const raw = await AsyncStorage.getItem("selectedCountry");
    const selected = raw ? JSON.parse(raw) : DEFAULT_COUNTRY;
    set({ selected, hydrated: true });
  },

  setCountry: async (country) => {
    await AsyncStorage.setItem("selectedCountry", JSON.stringify(country));
    set({ selected: country });
  },

  setCountries: (countries) => set({ countries }),
}));
