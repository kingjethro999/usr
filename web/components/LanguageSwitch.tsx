"use client";

import { useSyncExternalStore, useCallback } from "react";

export type CodeLang = "js" | "python";

function subscribeLang(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("usr-lang-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("usr-lang-change", callback);
  };
}

function getLangSnapshot(): CodeLang {
  if (typeof window === "undefined") return "js";
  const saved = localStorage.getItem("usr-lang") as CodeLang | null;
  return saved === "js" || saved === "python" ? saved : "js";
}

function getLangServerSnapshot(): CodeLang {
  return "js";
}

export function useCodeLang() {
  const lang = useSyncExternalStore(
    subscribeLang,
    getLangSnapshot,
    getLangServerSnapshot
  );

  const switchLang = useCallback((newLang: CodeLang) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("usr-lang", newLang);
      window.dispatchEvent(new Event("usr-lang-change"));
    }
  }, []);

  return { lang, switchLang };
}

export function LanguageSwitch({
  lang,
  onSwitch,
}: {
  lang: CodeLang;
  onSwitch: (lang: CodeLang) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-mono select-none">
      <button
        onClick={() => onSwitch("js")}
        suppressHydrationWarning
        className={`px-1 cursor-pointer ${
          lang === "js"
            ? "bg-[var(--theme-fg)] text-[var(--theme-bg)] font-bold"
            : "text-[var(--theme-magenta)] hover:underline"
        }`}
      >
        --lang=js
      </button>
      <button
        onClick={() => onSwitch("python")}
        suppressHydrationWarning
        className={`px-1 cursor-pointer ${
          lang === "python"
            ? "bg-[var(--theme-fg)] text-[var(--theme-bg)] font-bold"
            : "text-[var(--theme-magenta)] hover:underline"
        }`}
      >
        --lang=python
      </button>
    </div>
  );
}
