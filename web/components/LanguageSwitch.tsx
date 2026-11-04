"use client";

import { useState } from "react";

export type CodeLang = "js" | "python";

export function useCodeLang() {
  const [lang, setLang] = useState<CodeLang>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("usr-lang") as CodeLang | null;
      if (saved === "js" || saved === "python") {
        return saved;
      }
    }
    return "js";
  });

  const switchLang = (newLang: CodeLang) => {
    setLang(newLang);
    localStorage.setItem("usr-lang", newLang);
  };

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
