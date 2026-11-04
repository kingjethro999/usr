"use client";

import { useSyncExternalStore, useCallback, useEffect } from "react";

export type Theme = "night" | "paper" | "amber" | "phosphor";

export const THEMES: Theme[] = ["night", "paper", "amber", "phosphor"];

function subscribeTheme(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("usr-theme-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("usr-theme-change", callback);
  };
}

function getThemeSnapshot(): Theme {
  if (typeof window === "undefined") return "night";
  const saved = localStorage.getItem("usr-theme") as Theme | null;
  return saved && THEMES.includes(saved) ? saved : "night";
}

function getThemeServerSnapshot(): Theme {
  return "night";
}

export function useThemeState() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const changeTheme = useCallback((newTheme: Theme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("usr-theme", newTheme);
      window.dispatchEvent(new Event("usr-theme-change"));
    }
  }, []);

  const cycleTheme = useCallback(() => {
    const current = getThemeSnapshot();
    const idx = THEMES.indexOf(current);
    const next = THEMES[(idx + 1) % THEMES.length];
    changeTheme(next);
  }, [changeTheme]);

  return { theme, changeTheme, cycleTheme };
}
