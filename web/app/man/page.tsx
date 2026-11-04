import Link from "next/link";
import { MAN_COMMANDS, COMMAND_LIST, ManCommand } from "../../lib/man-data";
import versionInfo from "../../version.json";

export const metadata = {
  title: `man -k — ${versionInfo.name} Manual Index`,
  description: "Complete Unix Style Request (USR) manual pages index.",
};

const categories: { key: ManCommand["category"]; title: string; subtitle: string }[] = [
  {
    key: "request",
    title: "1. HTTP Request Commands",
    subtitle: "Standard request verbs mapping directly to HTTP operations with Axios ergonomics",
  },
  {
    key: "client",
    title: "2. Scoped Clients & Configuration",
    subtitle: "Independent client instances with custom baseURL, headers, and timeouts",
  },
  {
    key: "trap",
    title: "3. Interceptors (Traps)",
    subtitle: "Pre-request mutations and post-response transforms or logging",
  },
  {
    key: "pipe",
    title: "4. Pipe Stages",
    subtitle: "Composable data transformation pipeline (JS .pipe(), Python | operator)",
  },
];

export default function ManIndexPage() {
  return (
    <div className="max-w-[85ch] mx-auto px-4 py-8 space-y-10 font-mono text-sm">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-[var(--theme-fg)]">
          $ man -k {versionInfo.name}
        </h1>
        <p className="text-xs text-[var(--theme-dim)]">
          Manual pages for {versionInfo.name} v{versionInfo.version}. Each command mirrors standard Unix terminal utilities over HTTP.
        </p>
      </div>

      {/* Import Conventions & Patterns */}
      <section className="border border-[var(--theme-dim)] p-4 space-y-4 bg-[var(--theme-bg)]">
        <div className="flex items-center justify-between border-b border-[var(--theme-dim)] pb-2">
          <span className="font-bold text-xs text-[var(--theme-yellow)] uppercase tracking-wider">
            Import Conventions &amp; Usage Patterns
          </span>
          <span className="text-[10px] text-[var(--theme-dim)]">ESM • CommonJS • Python</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* JavaScript / TypeScript */}
          <div className="space-y-2">
            <span className="text-[var(--theme-green)] font-bold text-[11px] block">
              JavaScript / TypeScript (ESM &amp; CJS)
            </span>
            <div className="space-y-2 text-[11px] bg-[var(--theme-dim)]/5 p-2.5 border border-[var(--theme-dim)]/40">
              <div>
                <span className="text-[var(--theme-dim)] block text-[10px]"># 1. Namespace import (recommended):</span>
                <code className="text-[var(--theme-cyan)]">import * as usr from &quot;{versionInfo.name}&quot;;</code>
                <div className="text-[var(--theme-fg)] pl-2">const users = await usr.cat(&quot;/users&quot;);</div>
              </div>

              <div>
                <span className="text-[var(--theme-dim)] block text-[10px]"># 2. Named individual imports (tree-shakable):</span>
                <code className="text-[var(--theme-cyan)]">import &#123; cat, touch, cd &#125; from &quot;{versionInfo.name}&quot;;</code>
                <div className="text-[var(--theme-fg)] pl-2">const users = await cat(&quot;/users&quot;);</div>
              </div>

              <div>
                <span className="text-[var(--theme-dim)] block text-[10px]"># 3. Default instance import:</span>
                <code className="text-[var(--theme-cyan)]">import usr from &quot;{versionInfo.name}&quot;;</code>
                <div className="text-[var(--theme-fg)] pl-2">const users = await usr.cat(&quot;/users&quot;);</div>
              </div>

              <div>
                <span className="text-[var(--theme-dim)] block text-[10px]"># 4. CommonJS require:</span>
                <code className="text-[var(--theme-cyan)]">const &#123; cat, touch &#125; = require(&quot;{versionInfo.name}&quot;);</code>
                <div className="text-[var(--theme-fg)] pl-2">const users = await cat(&quot;/users&quot;);</div>
              </div>
            </div>
          </div>

          {/* Python */}
          <div className="space-y-2">
            <span className="text-[var(--theme-green)] font-bold text-[11px] block">
              Python 3.10+ (Sync &amp; Async)
            </span>
            <div className="space-y-2 text-[11px] bg-[var(--theme-dim)]/5 p-2.5 border border-[var(--theme-dim)]/40">
              <div>
                <span className="text-[var(--theme-dim)] block text-[10px]"># 1. Safe star import (explicit __all__, no builtins shadowed):</span>
                <code className="text-[var(--theme-cyan)]">from {versionInfo.name} import *</code>
                <div className="text-[var(--theme-fg)] pl-2">users = cat(&quot;https://api.site.com/users&quot;)</div>
              </div>

              <div>
                <span className="text-[var(--theme-dim)] block text-[10px]"># 2. Module namespace import:</span>
                <code className="text-[var(--theme-cyan)]">import {versionInfo.name}</code>
                <div className="text-[var(--theme-fg)] pl-2">users = {versionInfo.name}.cat(&quot;https://api.site.com/users&quot;)</div>
              </div>

              <div>
                <span className="text-[var(--theme-dim)] block text-[10px]"># 3. Explicit named imports:</span>
                <code className="text-[var(--theme-cyan)]">from {versionInfo.name} import cat, touch, cd</code>
                <div className="text-[var(--theme-fg)] pl-2">users = cat(&quot;https://api.site.com/users&quot;)</div>
              </div>

              <div>
                <span className="text-[var(--theme-dim)] block text-[10px]"># 4. Asynchronous companion namespace:</span>
                <code className="text-[var(--theme-cyan)]">from {versionInfo.name} import aio</code>
                <div className="text-[var(--theme-fg)] pl-2">users = await aio.cat(&quot;https://api.site.com/users&quot;)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorized Command Tables */}
      <div className="space-y-8">
        {categories.map((cat) => {
          const list = COMMAND_LIST.filter((cmd) => MAN_COMMANDS[cmd].category === cat.key);
          if (list.length === 0) return null;

          return (
            <section key={cat.key} className="space-y-3">
              <div className="border-b border-[var(--theme-dim)] pb-1">
                <h2 className="text-sm font-bold text-[var(--theme-fg)]">{cat.title}</h2>
                <p className="text-[11px] text-[var(--theme-dim)]">{cat.subtitle}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-[var(--theme-dim)] border-b border-[var(--theme-dim)]">
                      <th className="py-2 pr-4 font-normal">Command</th>
                      <th className="py-2 pr-4 font-normal">Type / Verb</th>
                      <th className="py-2 pr-4 font-normal">Safe?</th>
                      <th className="py-2 pr-4 font-normal">Idempotent?</th>
                      <th className="py-2 font-normal">Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--theme-dim)]/30">
                    {list.map((cmd) => {
                      const item = MAN_COMMANDS[cmd];
                      return (
                        <tr key={cmd} className="hover:bg-[var(--theme-dim)]/10">
                          <td className="py-2 pr-4 font-bold">
                            <Link href={`/man/${cmd}`} className="text-[var(--theme-green)] underline">
                              {cmd}(1)
                            </Link>
                          </td>
                          <td className="py-2 pr-4 text-[var(--theme-yellow)] font-bold">{item.httpMethod}</td>
                          <td className="py-2 pr-4 text-[var(--theme-dim)]">{item.safe ? "yes" : "no"}</td>
                          <td className="py-2 pr-4 text-[var(--theme-dim)]">{item.idempotent ? "yes" : "no"}</td>
                          <td className="py-2 text-[var(--theme-fg)]">{item.summary}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>

      {/* Security Note */}
      <div className="border border-[var(--theme-dim)] p-4 space-y-2 text-xs">
        <div className="font-bold text-[var(--theme-magenta)]">SECURITY NOTE</div>
        <p className="text-[var(--theme-fg)] leading-relaxed">
          {versionInfo.name} is a client library. It never spawns a subshell, never evaluates arbitrary code, and never touches your local filesystem unless the explicit <code className="text-[var(--theme-cyan)]">-o</code> flag is provided to download a file.
        </p>
      </div>

      {/* Navigation */}
      <div className="pt-4 border-t border-[var(--theme-dim)] text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <Link href="/" className="text-[var(--theme-blue)] underline">
          &lt;-- Back to terminal home
        </Link>
        <div className="flex gap-3 text-[var(--theme-dim)]">
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
          <span>USR Manual • Section 1 (User Commands)</span>
        </div>
      </div>
    </div>
  );
}
