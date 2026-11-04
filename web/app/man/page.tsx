import Link from "next/link";
import { MAN_COMMANDS, COMMAND_LIST } from "../../lib/man-data";
import versionInfo from "../../version.json";

export const metadata = {
  title: `man -k — ${versionInfo.name} Manual Index`,
  description: "Complete Unix Style Request (USR) manual pages index.",
};

export default function ManIndexPage() {
  return (
    <div className="max-w-[80ch] mx-auto px-4 py-8 space-y-8 font-mono text-sm">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">
          $ man -k {versionInfo.name}
        </h1>
        <p className="text-xs text-[var(--theme-dim)]">
          Manual pages for {versionInfo.name} v{versionInfo.version}. Each command mirrors standard Unix terminal utilities over HTTP.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-[var(--theme-dim)] border-b border-[var(--theme-dim)]">
              <th className="py-2 pr-4 font-normal">Command</th>
              <th className="py-2 pr-4 font-normal">HTTP</th>
              <th className="py-2 pr-4 font-normal">Safe?</th>
              <th className="py-2 pr-4 font-normal">Idempotent?</th>
              <th className="py-2 font-normal">Summary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--theme-dim)]/30">
            {COMMAND_LIST.map((cmd) => {
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

      <div className="border border-[var(--theme-dim)] p-4 space-y-2 text-xs">
        <div className="font-bold text-[var(--theme-magenta)]">SECURITY NOTE</div>
        <p className="text-[var(--theme-fg)] leading-relaxed">
          {versionInfo.name} is a client library. It never spawns a subshell, never evaluates arbitrary code, and never touches your local filesystem unless the explicit <code className="text-[var(--theme-cyan)]">-o</code> flag is provided to download a file.
        </p>
      </div>

      <div className="pt-4 border-t border-[var(--theme-dim)] text-xs">
        <Link href="/" className="text-[var(--theme-blue)] underline">
          &lt;-- Back to terminal home
        </Link>
      </div>
    </div>
  );
}
