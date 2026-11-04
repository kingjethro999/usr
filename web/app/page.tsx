import Link from "next/link";
import { Terminal } from "../components/Terminal";
import { InstallSection } from "../components/InstallSection";
import versionInfo from "../version.json";

export const metadata = {
  title: `${versionInfo.name} — Unix Style Request`,
  description: "Axios with a Unix vocabulary. HTTP client for JavaScript and Python.",
};

const commands = [
  { cmd: "cat", http: "GET", mnemonic: "read a resource", body: "no" },
  { cmd: "touch", http: "POST", mnemonic: "create something new", body: "yes" },
  { cmd: "mv", http: "PUT", mnemonic: "replace or move", body: "yes" },
  { cmd: "sed", http: "PATCH", mnemonic: "edit in place", body: "yes" },
  { cmd: "rm", http: "DELETE", mnemonic: "remove", body: "no" },
  { cmd: "stat", http: "HEAD", mnemonic: "metadata only (headers, no body)", body: "no" },
  { cmd: "man", http: "OPTIONS", mnemonic: "“what can I do here?”", body: "no" },
];

const flags = [
  { flag: "-H, --header", desc: "add a header (repeatable)" },
  { flag: "-d, --data", desc: "request body" },
  { flag: "-u, --user", desc: "basic auth, user:password" },
  { flag: "-m, --max-time", desc: "timeout in seconds" },
  { flag: "-L, --location", desc: "follow redirects" },
  { flag: "-o, --output", desc: "write response body to a file" },
  { flag: "-s, --silent", desc: "suppress logging" },
  { flag: "-v, --verbose", desc: "log request and response details" },
  { flag: "-q, --query", desc: "add a query parameter, key=value" },
  { flag: "--ok", desc: "accept every status without throwing" },
];

export default function Home() {
  return (
    <div className="max-w-[80ch] mx-auto px-4 py-8 space-y-12">
      {/* 1. Hero & Live Terminal */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--theme-fg)]">
            {versionInfo.name}
            <span className="text-[var(--theme-green)]">.</span>
          </h1>
          <p className="text-sm text-[var(--theme-fg)]">
            HTTP requests, typed like Unix commands.
          </p>
          <p className="text-xs text-[var(--theme-dim)]">
            A small Axios-style HTTP client for JavaScript and Python. Wraps global{" "}
            <code className="text-[var(--theme-cyan)]">fetch</code> in JS and{" "}
            <code className="text-[var(--theme-cyan)]">httpx</code> in Python.
          </p>
        </div>

        <div className="pt-2">
          <Terminal />
        </div>
      </section>

      {/* 2. man usr: Command Reference */}
      <section id="commands" className="space-y-4">
        <h2 className="text-sm font-bold text-[var(--theme-fg)] border-b border-[var(--theme-dim)] pb-1">
          $ man {versionInfo.name}
        </h2>
        <p className="text-xs text-[var(--theme-dim)]">
          The command-to-HTTP mapping table:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-[var(--theme-dim)] border-b border-[var(--theme-dim)]">
                <th className="py-2 pr-4 font-normal">Command</th>
                <th className="py-2 pr-4 font-normal">HTTP</th>
                <th className="py-2 pr-4 font-normal">Mnemonic</th>
                <th className="py-2 font-normal">Body?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--theme-dim)]/30">
              {commands.map((c) => (
                <tr key={c.cmd} className="hover:bg-[var(--theme-dim)]/10">
                  <td className="py-2 pr-4 font-bold text-[var(--theme-green)]">
                    <Link
                      href={`/man/${c.cmd}`}
                      className="underline text-[var(--theme-blue)]"
                    >
                      {c.cmd}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 font-bold text-[var(--theme-yellow)]">
                    {c.http}
                  </td>
                  <td className="py-2 pr-4 text-[var(--theme-fg)]">{c.mnemonic}</td>
                  <td className="py-2 text-[var(--theme-dim)]">{c.body}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs">
          <Link href="/man" className="text-[var(--theme-blue)] underline">
            Browse all manual pages (man)...
          </Link>
        </p>
      </section>

      {/* 3. git diff: Before and After */}
      <section id="diff" className="space-y-4">
        <h2 className="text-sm font-bold text-[var(--theme-fg)] border-b border-[var(--theme-dim)] pb-1">
          $ git diff fetch {versionInfo.name}
        </h2>
        <div className="border border-[var(--theme-dim)] p-3 text-xs overflow-x-auto space-y-1 bg-[var(--theme-bg)]">
          <div className="text-[var(--theme-dim)]">{"// GET /users and parse json"}</div>
          <div className="text-[var(--theme-red)]">
            - const res = await fetch(&quot;https://api.site.com/users&quot;);
          </div>
          <div className="text-[var(--theme-red)]">- const users = await res.json();</div>
          <div className="text-[var(--theme-green)]">
            + import * as usr from &quot;usr&quot;;
          </div>
          <div className="text-[var(--theme-green)]">
            + const users = await usr.cat(&quot;https://api.site.com/users&quot;);
          </div>
        </div>
      </section>

      {/* 4. Pipes */}
      <section id="pipes" className="space-y-4">
        <h2 className="text-sm font-bold text-[var(--theme-fg)] border-b border-[var(--theme-dim)] pb-1">
          $ cat ... | grep ... | head
        </h2>
        <p className="text-xs text-[var(--theme-dim)]">
          Pipe stages compose without mutating data. JS uses{" "}
          <code className="text-[var(--theme-cyan)]">.pipe()</code>, Python uses the real{" "}
          <code className="text-[var(--theme-cyan)]">|</code> operator:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="border border-[var(--theme-dim)] p-3 space-y-2">
            <span className="text-[var(--theme-dim)] text-[10px] uppercase">
              JavaScript
            </span>
            <pre className="overflow-x-auto text-[var(--theme-fg)] leading-relaxed">{`const names = await usr
  .cat("https://api.site.com/users")
  .pipe(usr.grep({ active: true }))
  .pipe(usr.cut("name"))
  .pipe(usr.head(5));`}</pre>
          </div>
          <div className="border border-[var(--theme-dim)] p-3 space-y-2">
            <span className="text-[var(--theme-dim)] text-[10px] uppercase">Python</span>
            <pre className="overflow-x-auto text-[var(--theme-fg)] leading-relaxed">{`from usr import *

names = (
  cat("https://api.site.com/users")
  | grep(active=True)
  | cut("name")
  | head(5)
)`}</pre>
          </div>
        </div>
      </section>

      {/* 5. Flags Reference */}
      <section id="flags" className="space-y-4">
        <h2 className="text-sm font-bold text-[var(--theme-fg)] border-b border-[var(--theme-dim)] pb-1">
          $ {versionInfo.name} --help (Flags)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {flags.map((f) => (
            <div key={f.flag} className="border border-[var(--theme-dim)] p-2 space-y-1">
              <span className="text-[var(--theme-magenta)] font-bold">{f.flag}</span>
              <p className="text-[var(--theme-dim)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Install */}
      <InstallSection packageName={versionInfo.name} />

      {/* 7. Footer */}
      <footer className="pt-8 border-t border-[var(--theme-dim)] text-xs text-[var(--theme-dim)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <span>guest@{versionInfo.name}:~$</span>
          <span className="w-2 h-4 bg-[var(--theme-cursor)] inline-block animate-pulse"></span>
        </div>
        <div className="flex gap-4">
          <a
            href="https://github.com/kingjethro999/usr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--theme-blue)] underline"
          >
            GitHub
          </a>
          <a
            href={`https://www.npmjs.com/package/${versionInfo.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--theme-yellow)] underline"
          >
            npm
          </a>
          <a
            href={`https://pypi.org/project/${versionInfo.name}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--theme-green)] underline"
          >
            PyPI
          </a>
          <span>MIT License</span>
          <span>v{versionInfo.version}</span>
        </div>
      </footer>
    </div>
  );
}
