"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MAN_COMMANDS } from "../lib/man-data";

interface SearchMatch {
  cmd: string;
  line: string;
  matchTerm: string;
}

export function SearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const matches: SearchMatch[] = [];
  if (query.trim().length > 0) {
    const q = query.toLowerCase();
    for (const [cmd, man] of Object.entries(MAN_COMMANDS)) {
      if (cmd.toLowerCase().includes(q)) {
        matches.push({ cmd, line: `${man.cmd}(${man.section}): ${man.summary}`, matchTerm: query });
      } else if (man.description.toLowerCase().includes(q)) {
        matches.push({ cmd, line: `${man.cmd}: ${man.description.slice(0, 80)}...`, matchTerm: query });
      } else {
        for (const opt of man.options) {
          if (opt.flag.toLowerCase().includes(q) || opt.desc.toLowerCase().includes(q)) {
            matches.push({ cmd, line: `${man.cmd}: ${opt.flag} - ${opt.desc}`, matchTerm: query });
            break;
          }
        }
      }
    }
  }

  const handleSelect = (cmd: string) => {
    onClose();
    router.push(`/man/${cmd}`);
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 bg-[var(--theme-bg)] border-t-2 border-[var(--theme-dim)] p-3 font-mono text-xs max-h-[300px] flex flex-col space-y-2 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Results List */}
      {matches.length > 0 && (
        <div className="overflow-y-auto max-h-[180px] space-y-1 mb-2">
          {matches.map((m, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(m.cmd)}
              className="cursor-pointer hover:bg-[var(--theme-fg)] hover:text-[var(--theme-bg)] px-1 py-0.5"
            >
              <span className="text-[var(--theme-dim)]">man/{m.cmd}: </span>
              <span>{m.line}</span>
            </div>
          ))}
        </div>
      )}

      {query.trim().length > 0 && matches.length === 0 && (
        <div className="text-[var(--theme-dim)] px-1">Pattern not found</div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-2">
        <span className="text-[var(--theme-magenta)] font-bold">/</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              onClose();
            } else if (e.key === "Enter" && matches.length > 0) {
              handleSelect(matches[0].cmd);
            }
          }}
          placeholder="search man pages (regex/text)..."
          className="flex-grow bg-transparent text-[var(--theme-fg)] outline-none border-none font-mono text-xs caret-[var(--theme-cursor)]"
        />
        <button
          onClick={onClose}
          className="text-[var(--theme-dim)] hover:text-[var(--theme-fg)] px-1"
        >
          [Esc]
        </button>
      </div>
    </div>
  );
}
