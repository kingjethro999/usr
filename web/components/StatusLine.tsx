"use client";

import { useState } from "react";
import { Theme } from "../app/theme";
import versionInfo from "../version.json";

interface StatusLineProps {
  theme: Theme;
  onCycleTheme: () => void;
  onOpenHelp: () => void;
}

export function StatusLine({ theme, onCycleTheme, onOpenHelp }: StatusLineProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const npmCmd = `npm i ${versionInfo.name}`;
  const pipCmd = `pip install ${versionInfo.name}`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--theme-dim)] bg-[var(--theme-fg)] text-[var(--theme-bg)] font-mono text-xs px-2 py-1 select-none">
      <div className="max-w-[80ch] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold">
            {versionInfo.name} v{versionInfo.version}
          </span>
          <button
            onClick={() => copy(npmCmd)}
            className="hidden sm:inline hover:underline cursor-pointer"
            title="Click to copy npm install command"
          >
            {copiedText === npmCmd ? "[copied]" : `$ ${npmCmd}`}
          </button>
          <button
            onClick={() => copy(pipCmd)}
            className="hidden md:inline hover:underline cursor-pointer"
            title="Click to copy pip install command"
          >
            {copiedText === pipCmd ? "[copied]" : `$ ${pipCmd}`}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCycleTheme}
            className="hover:underline cursor-pointer"
            title="Cycle theme (Shortcut: t)"
            suppressHydrationWarning
          >
            [{theme}]
          </button>
          <button
            onClick={onOpenHelp}
            className="font-bold hover:underline cursor-pointer"
            title="Shortcuts help (Shortcut: ?)"
          >
            [?]
          </button>
        </div>
      </div>
    </header>
  );
}
