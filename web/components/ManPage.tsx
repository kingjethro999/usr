"use client";

import Link from "next/link";
import { ManCommand, COMMAND_LIST } from "../lib/man-data";
import { LanguageSwitch, useCodeLang } from "./LanguageSwitch";
import versionInfo from "../version.json";

interface ManPageProps {
  command: ManCommand;
}

export function ManPage({ command }: ManPageProps) {
  const { lang, switchLang } = useCodeLang();

  const currentIndex = COMMAND_LIST.indexOf(command.cmd);
  const prevCmd = currentIndex > 0 ? COMMAND_LIST[currentIndex - 1] : null;
  const nextCmd =
    currentIndex < COMMAND_LIST.length - 1 ? COMMAND_LIST[currentIndex + 1] : null;

  return (
    <div className="max-w-[100ch] mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8 font-mono text-sm">
      {/* Sidebar: ls man/ */}
      <aside className="md:col-span-1 space-y-4">
        <div className="border-b border-[var(--theme-dim)] pb-1 font-bold text-xs">
          $ ls man/
        </div>
        <nav className="flex flex-col space-y-1 text-xs">
          <Link href="/man" className="hover:underline text-[var(--theme-blue)]">
            [index]
          </Link>
          {COMMAND_LIST.map((cmd) => (
            <Link
              key={cmd}
              href={`/man/${cmd}`}
              className={`px-1 py-0.5 ${
                cmd === command.cmd
                  ? "bg-[var(--theme-fg)] text-[var(--theme-bg)] font-bold no-underline"
                  : "text-[var(--theme-fg)] hover:underline"
              }`}
            >
              {cmd}(1)
            </Link>
          ))}
        </nav>

        <div className="pt-4 border-t border-[var(--theme-dim)]/40">
          <LanguageSwitch lang={lang} onSwitch={switchLang} />
        </div>
      </aside>

      {/* Main Man Page Content */}
      <article className="md:col-span-3 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[var(--theme-dim)] pb-2 text-xs font-bold text-[var(--theme-dim)]">
          <span>
            {command.cmd.toUpperCase()}({command.section})
          </span>
          <span>{versionInfo.name.toUpperCase()} MANUAL</span>
          <span>
            {command.cmd.toUpperCase()}({command.section})
          </span>
        </div>

        {/* NAME */}
        <section className="space-y-1">
          <h2 className="font-bold text-[var(--theme-fg)] text-xs">NAME</h2>
          <p className="pl-4 sm:pl-7 text-[var(--theme-fg)]">
            <span className="font-bold text-[var(--theme-green)]">{command.cmd}</span> —{" "}
            {command.summary}
          </p>
        </section>

        {/* SYNOPSIS */}
        <section className="space-y-1">
          <h2 className="font-bold text-[var(--theme-fg)] text-xs">SYNOPSIS</h2>
          <div className="pl-4 sm:pl-7">
            <pre className="text-xs text-[var(--theme-cyan)] overflow-x-auto bg-[var(--theme-dim)]/10 p-2">
              {lang === "js" ? command.synopsis.js : command.synopsis.python}
            </pre>
          </div>
        </section>

        {/* IMPORTS */}
        {command.imports && (
          <section className="space-y-2">
            <h2 className="font-bold text-[var(--theme-fg)] text-xs">
              IMPORT CONVENTIONS
            </h2>
            <div className="pl-4 sm:pl-7 space-y-2">
              <div className="text-[11px] text-[var(--theme-dim)]">
                {lang === "js"
                  ? "Import either all commands as a namespace or individual named functions:"
                  : "Import everything safely into module scope or use the usr namespace:"}
              </div>
              <div className="space-y-1.5">
                {(lang === "js" ? command.imports.js : command.imports.python).map(
                  (snippet, idx) => (
                    <pre
                      key={idx}
                      className="text-xs bg-[var(--theme-dim)]/5 border-l-2 border-[var(--theme-green)] p-2 text-[var(--theme-fg)] overflow-x-auto"
                    >
                      {snippet}
                    </pre>
                  ),
                )}
              </div>
            </div>
          </section>
        )}

        {/* DESCRIPTION */}
        <section className="space-y-1">
          <h2 className="font-bold text-[var(--theme-fg)] text-xs">DESCRIPTION</h2>
          <p className="pl-4 sm:pl-7 text-[var(--theme-fg)] leading-relaxed">
            {command.description}
          </p>
        </section>

        {/* OPTIONS */}
        <section className="space-y-2">
          <h2 className="font-bold text-[var(--theme-fg)] text-xs">OPTIONS</h2>
          <dl className="pl-4 sm:pl-7 space-y-3">
            {command.options.map((opt) => (
              <div key={opt.flag} className="space-y-1">
                <dt className="text-[var(--theme-magenta)] font-bold text-xs">
                  {opt.flag}
                </dt>
                <dd className="pl-4 text-xs text-[var(--theme-fg)]">{opt.desc}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* EXAMPLES */}
        <section className="space-y-3">
          <h2 className="font-bold text-[var(--theme-fg)] text-xs">EXAMPLES</h2>
          <div className="pl-4 sm:pl-7 space-y-4">
            {command.examples.map((ex, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-xs text-[var(--theme-dim)] font-bold">
                  {ex.title}:
                </div>
                <pre className="text-xs border-l-2 border-[var(--theme-dim)] pl-3 py-1 text-[var(--theme-fg)] overflow-x-auto">
                  {lang === "js" ? ex.js : ex.python}
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* ERRORS */}
        <section className="space-y-2">
          <h2 className="font-bold text-[var(--theme-fg)] text-xs">ERRORS</h2>
          <dl className="pl-4 sm:pl-7 space-y-2 text-xs">
            {command.errors.map((err) => (
              <div key={err.code} className="flex gap-2">
                <dt className="text-[var(--theme-yellow)] font-bold min-w-[120px]">
                  {err.code}
                </dt>
                <dd className="text-[var(--theme-fg)]">{err.desc}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* SEE ALSO */}
        <section className="space-y-1">
          <h2 className="font-bold text-[var(--theme-fg)] text-xs">SEE ALSO</h2>
          <p className="pl-4 sm:pl-7 text-xs text-[var(--theme-blue)]">
            {command.seeAlso.map((cmd, idx) => (
              <span key={cmd}>
                <Link href={`/man/${cmd}`} className="underline">
                  {cmd}(1)
                </Link>
                {idx < command.seeAlso.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        </section>

        {/* Footer Navigation: prev / next */}
        <div className="pt-6 border-t border-[var(--theme-dim)] flex justify-between text-xs text-[var(--theme-blue)]">
          {prevCmd ? (
            <Link href={`/man/${prevCmd}`} className="underline">
              prev: {prevCmd}(1)
            </Link>
          ) : (
            <span className="text-[var(--theme-dim)]">prev: none</span>
          )}

          {nextCmd ? (
            <Link href={`/man/${nextCmd}`} className="underline">
              next: {nextCmd}(1)
            </Link>
          ) : (
            <span className="text-[var(--theme-dim)]">next: none</span>
          )}
        </div>
      </article>
    </div>
  );
}
