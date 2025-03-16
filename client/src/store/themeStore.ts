import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ThemeMode } from "../types";

interface ThemeState extends ThemeMode {
  toggleColorMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      colorMode: "light",
      toggleColorMode: () =>
        set((state) => ({
          colorMode: state.colorMode === "light" ? "dark" : "light",
        })),
    }),
    {
      name: "theme-storage",
    }
  )
);
