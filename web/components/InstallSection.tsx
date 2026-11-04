"use client";

import { useState } from "react";

interface InstallSectionProps {
  packageName: string;
}

export function InstallSection({ packageName }: InstallSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pythonMode, setPythonMode] = useState<"venv" | "direct">("venv");

  const copy = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 2000);
    }
  };

  const npmCmd = `npm i ${packageName}`;
  const pnpmCmd = `pnpm add ${packageName}`;
  const bunCmd = `bun add ${packageName}`;

  const venvCmdUnix = `python3 -m venv .venv && source .venv/bin/activate && pip install ${packageName}`;
  const venvCmdWin = `python -m venv .venv && .venv\\Scripts\\activate && pip install ${packageName}`;
  const pipDirectCmd = `pip install ${packageName}`;

  return (
    <section id="install" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--theme-dim)] pb-1 gap-2">
        <h2 className="text-sm font-bold text-[var(--theme-fg)]">
          $ npm i {packageName} &amp;&amp; pip install {packageName}
        </h2>
        <div className="flex items-center gap-3 text-[10px]">
          <a
            href={`https://www.npmjs.com/package/${packageName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--theme-yellow)] hover:underline border border-[var(--theme-yellow)]/40 px-1 py-0.5"
          >
            [npm: {packageName}]
          </a>
          <a
            href={`https://pypi.org/project/${packageName}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--theme-blue)] hover:underline border border-[var(--theme-blue)]/40 px-1 py-0.5"
          >
            [PyPI: {packageName}]
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {/* Node.js / npm */}
        <div className="border border-[var(--theme-dim)] p-3 space-y-3 bg-[var(--theme-bg)]">
          <div className="flex items-center justify-between">
            <span className="text-[var(--theme-dim)] text-[10px] uppercase font-bold tracking-wider">
              npm / JavaScript (Node 20+, Deno, Bun, Browser)
            </span>
            <button
              onClick={() => copy(npmCmd, "npm-main")}
              className="text-[11px] text-[var(--theme-cyan)] hover:underline cursor-pointer font-bold px-1"
              title="Copy npm install command"
            >
              {copiedId === "npm-main" ? "[copied]" : "[copy]"}
            </button>
          </div>

          <div
            onClick={() => copy(npmCmd, "npm-main")}
            className="p-2 border border-[var(--theme-dim)] bg-[var(--theme-dim)]/5 cursor-pointer hover:border-[var(--theme-green)] transition-colors select-all"
          >
            <code className="text-[var(--theme-green)] block">$ {npmCmd}</code>
          </div>

          <div className="space-y-1 pt-1 text-[11px]">
            <span className="text-[var(--theme-dim)] text-[10px]">
              Alternative package managers:
            </span>
            <div className="flex items-center justify-between text-[var(--theme-fg)]">
              <code>pnpm add {packageName}</code>
              <button
                onClick={() => copy(pnpmCmd, "pnpm")}
                className="text-[var(--theme-dim)] hover:text-[var(--theme-fg)] hover:underline cursor-pointer text-[10px]"
              >
                {copiedId === "pnpm" ? "[copied]" : "[copy]"}
              </button>
            </div>
            <div className="flex items-center justify-between text-[var(--theme-fg)]">
              <code>bun add {packageName}</code>
              <button
                onClick={() => copy(bunCmd, "bun")}
                className="text-[var(--theme-dim)] hover:text-[var(--theme-fg)] hover:underline cursor-pointer text-[10px]"
              >
                {copiedId === "bun" ? "[copied]" : "[copy]"}
              </button>
            </div>
          </div>
        </div>

        {/* Python / PyPI */}
        <div className="border border-[var(--theme-dim)] p-3 space-y-3 bg-[var(--theme-bg)]">
          <div className="flex items-center justify-between">
            <span className="text-[var(--theme-dim)] text-[10px] uppercase font-bold tracking-wider">
              PyPI / Python 3.10+ (httpx)
            </span>
            <div className="flex items-center gap-2 text-[10px]">
              <button
                onClick={() => setPythonMode("venv")}
                className={`px-1 cursor-pointer ${
                  pythonMode === "venv"
                    ? "bg-[var(--theme-fg)] text-[var(--theme-bg)] font-bold"
                    : "text-[var(--theme-dim)] hover:underline"
                }`}
              >
                venv (recommended)
              </button>
              <button
                onClick={() => setPythonMode("direct")}
                className={`px-1 cursor-pointer ${
                  pythonMode === "direct"
                    ? "bg-[var(--theme-fg)] text-[var(--theme-bg)] font-bold"
                    : "text-[var(--theme-dim)] hover:underline"
                }`}
              >
                direct
              </button>
            </div>
          </div>

          {pythonMode === "venv" ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[var(--theme-dim)] text-[10px]">
                  Linux / macOS (virtual environment):
                </span>
                <button
                  onClick={() => copy(venvCmdUnix, "venv-unix")}
                  className="text-[11px] text-[var(--theme-cyan)] hover:underline cursor-pointer font-bold px-1"
                >
                  {copiedId === "venv-unix" ? "[copied]" : "[copy]"}
                </button>
              </div>
              <div
                onClick={() => copy(venvCmdUnix, "venv-unix")}
                className="p-2 border border-[var(--theme-dim)] bg-[var(--theme-dim)]/5 cursor-pointer hover:border-[var(--theme-green)] transition-colors select-all leading-relaxed"
              >
                <div className="text-[var(--theme-dim)]">
                  # Create and activate virtual environment
                </div>
                <div className="text-[var(--theme-fg)]">python3 -m venv .venv</div>
                <div className="text-[var(--theme-fg)]">source .venv/bin/activate</div>
                <div className="text-[var(--theme-green)]">pip install {packageName}</div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[var(--theme-dim)] text-[10px]">
                  Windows PowerShell / CMD:
                </span>
                <button
                  onClick={() => copy(venvCmdWin, "venv-win")}
                  className="text-[10px] text-[var(--theme-dim)] hover:text-[var(--theme-fg)] hover:underline cursor-pointer"
                >
                  {copiedId === "venv-win" ? "[copied]" : "[copy]"}
                </button>
              </div>
              <div
                onClick={() => copy(venvCmdWin, "venv-win")}
                className="p-1.5 border border-[var(--theme-dim)] bg-[var(--theme-dim)]/5 cursor-pointer hover:border-[var(--theme-green)] transition-colors text-[11px] select-all"
              >
                <code>
                  python -m venv .venv &amp;&amp; .venv\Scripts\activate &amp;&amp; pip
                  install {packageName}
                </code>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[var(--theme-dim)] text-[10px]">
                  Global / active environment:
                </span>
                <button
                  onClick={() => copy(pipDirectCmd, "pip-direct")}
                  className="text-[11px] text-[var(--theme-cyan)] hover:underline cursor-pointer font-bold px-1"
                >
                  {copiedId === "pip-direct" ? "[copied]" : "[copy]"}
                </button>
              </div>
              <div
                onClick={() => copy(pipDirectCmd, "pip-direct")}
                className="p-2 border border-[var(--theme-dim)] bg-[var(--theme-dim)]/5 cursor-pointer hover:border-[var(--theme-green)] transition-colors select-all"
              >
                <code className="text-[var(--theme-green)] block">$ {pipDirectCmd}</code>
              </div>
              <p className="text-[10px] text-[var(--theme-dim)]">
                Tip: PEP 668 environments (Debian/Ubuntu/macOS Homebrew) require a
                virtualenv to avoid modifying system packages.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
