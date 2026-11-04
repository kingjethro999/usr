"use client";

import { useEffect, useState } from "react";
import { Theme } from "../app/theme";
import versionInfo from "../version.json";

interface StatusLineProps {
  theme: Theme;
  onCycleTheme: () => void;
  onOpenHelp: () => void;
}

export function StatusLine({ theme, onCycleTheme, onOpenHelp }: StatusLineProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const doc = document.documentElement;
          const total = doc.scrollHeight - window.innerHeight;
          if (total <= 0) {
            setScrollProgress(0);
          } else {
            const current = (window.scrollY / total) * 100;
            setScrollProgress(Math.min(100, Math.max(0, current)));
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const npmCmd = `npm i ${versionInfo.name}`;
  const pipCmd = `pip install ${versionInfo.name}`;

  return (
    <>
      {/* On-page scroll progress bar at top of viewport */}
      <div
        className="fixed top-0 left-0 right-0 h-[2px] z-[99990] pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="h-full bg-[var(--theme-green)] transition-[width] duration-75 ease-out shadow-[0_0_8px_var(--theme-green)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-[var(--theme-dim)] bg-[var(--theme-fg)] text-[var(--theme-bg)] font-mono text-xs px-2 py-1 select-none relative">
        {/* On-page scroll indicator line at bottom edge of status line */}
        <div
          className="absolute bottom-0 left-0 h-[2px] bg-[var(--theme-green)] transition-[width] duration-75 ease-out pointer-events-none"
          style={{ width: `${scrollProgress}%` }}
          aria-hidden="true"
        />

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
            {scrollProgress > 0 && (
              <span
                className="text-[10px] text-[var(--theme-green)] bg-[var(--theme-bg)] px-1 font-bold"
                title="Page scroll progress"
              >
                {scrollProgress >= 99 ? "[END]" : `[${Math.round(scrollProgress)}%]`}
              </span>
            )}
            <a
              href="https://github.com/sponsors/kingjethro999"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline cursor-pointer text-[var(--theme-yellow)] hidden sm:inline"
              title="Support this project on GitHub Sponsors"
            >
              [sponsor]
            </a>
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
    </>
  );
}
