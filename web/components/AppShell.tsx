"use client";

import { useEffect, useState, ReactNode } from "react";
import { useThemeState } from "../app/theme";
import { StatusLine } from "./StatusLine";
import { ShortcutsHelp } from "./ShortcutsHelp";
import { SearchModal } from "./SearchModal";

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, cycleTheme } = useThemeState();
  const [helpOpen, setHelpOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger single-key shortcuts if inside an input or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        if (e.key === "Escape") {
          target.blur();
          setSearchOpen(false);
          setHelpOpen(false);
        }
        return;
      }

      if (e.key === "Escape") {
        setHelpOpen(false);
        setSearchOpen(false);
        return;
      }

      if (!shortcutsEnabled) return;

      if (e.key === "/") {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "?") {
        e.preventDefault();
        setHelpOpen((prev) => !prev);
      } else if (e.key === "t") {
        e.preventDefault();
        cycleTheme();
      } else if (e.key === "j") {
        window.scrollBy({ top: 40, behavior: "instant" });
      } else if (e.key === "k") {
        window.scrollBy({ top: -40, behavior: "instant" });
      } else if (e.key === "G") {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cycleTheme, shortcutsEnabled]);

  return (
    <>
      <StatusLine
        theme={theme}
        onCycleTheme={cycleTheme}
        onOpenHelp={() => setHelpOpen(true)}
      />
      <ShortcutsHelp
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        shortcutsEnabled={shortcutsEnabled}
        onToggleShortcuts={() => setShortcutsEnabled((prev) => !prev)}
      />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <main className="w-full flex-grow">{children}</main>
    </>
  );
}
