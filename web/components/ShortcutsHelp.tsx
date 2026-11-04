"use client";

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcutsEnabled: boolean;
  onToggleShortcuts: () => void;
}

export function ShortcutsHelp({
  isOpen,
  onClose,
  shortcutsEnabled,
  onToggleShortcuts,
}: ShortcutsHelpProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[var(--theme-bg)]/80 flex items-center justify-center p-4 font-mono text-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[50ch] border-2 border-[var(--theme-dim)] bg-[var(--theme-bg)] text-[var(--theme-fg)] p-4 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-[var(--theme-dim)] pb-2 font-bold">
          <span>KEYBOARD SHORTCUTS</span>
          <button onClick={onClose} className="hover:bg-[var(--theme-fg)] hover:text-[var(--theme-bg)] px-1">
            [Esc]
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-[var(--theme-magenta)] font-bold">/</span>
            <span>Open search</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--theme-magenta)] font-bold">?</span>
            <span>Show this help</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--theme-magenta)] font-bold">t</span>
            <span>Cycle theme</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--theme-magenta)] font-bold">j / k</span>
            <span>Scroll down / up</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--theme-magenta)] font-bold">gg / G</span>
            <span>Jump to top / bottom</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--theme-magenta)] font-bold">Esc</span>
            <span>Close search, help, or blur</span>
          </div>
        </div>

        <div className="border-t border-[var(--theme-dim)] pt-3 flex justify-between items-center text-[10px] text-[var(--theme-dim)]">
          <span>WCAG 2.1.4 single-key shortcuts:</span>
          <button
            onClick={onToggleShortcuts}
            className="text-[var(--theme-fg)] underline hover:bg-[var(--theme-fg)] hover:text-[var(--theme-bg)] px-1"
          >
            {shortcutsEnabled ? "[Disable Shortcuts]" : "[Enable Shortcuts]"}
          </button>
        </div>
      </div>
    </div>
  );
}
