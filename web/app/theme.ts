"use client";

import { useEffect, useState, useCallback } from "react";

export type Theme = "night" | "paper" | "amber" | "phosphor";

export const THEMES: Theme[] = ["night", "paper", "amber", "phosphor"];

export function useThemeState() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("usr-theme") as Theme | null;
      if (saved && THEMES.includes(saved)) {
        return saved;
      }
    }
    return "night";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const changeTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("usr-theme", newTheme);
  }, []);

  const cycleTheme = useCallback(() => {
    setTheme((prev) => {
      const idx = THEMES.indexOf(prev);
      const next = THEMES[(idx + 1) % THEMES.length];
      localStorage.setItem("usr-theme", next);
      return next;
    });
  }, []);

  return { theme, changeTheme, cycleTheme };
}
