import { useEffect } from "react";
import useLocalStorage from "./useLocalStorage";

type ThemeMode = "sync" | "manual";

interface ThemeState {
  currentTheme: string;
  setTheme: (value: string) => void;
  systemTheme: string;
  themeMode: string;
  setThemeMode: (value: string) => void;
}

interface UseThemeStateProps {
  themeMode?: ThemeMode;
  currentTheme?: string;
}

function useThemeState({
  themeMode = "sync",
  currentTheme,
}: UseThemeStateProps = {}): ThemeState {
  const [storedTheme, setStoredTheme] = useLocalStorage({ key: "data-theme", initialValue: currentTheme ?? "light" });
  const [systemTheme, setSystemTheme] = useLocalStorage({ key: "data-theme-system" });
  const [storedThemeMode, setStoredThemeMode] = useLocalStorage({ key: "data-theme-mode", initialValue: themeMode });
  useEffect(() => {
    const colorSchemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemTheme(colorSchemeMediaQuery.matches ? "dark" : "light");

    const updateSystemPreferredTheme = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    colorSchemeMediaQuery.addEventListener("change", updateSystemPreferredTheme);
    return () => colorSchemeMediaQuery.removeEventListener("change", updateSystemPreferredTheme);
  }, []);

  return {
    currentTheme: storedThemeMode === "manual" ? storedTheme : systemTheme,
    setTheme: setStoredTheme,
    systemTheme: systemTheme || "light",
    themeMode: storedThemeMode || themeMode,
    setThemeMode: setStoredThemeMode,
  };
}

export default useThemeState;