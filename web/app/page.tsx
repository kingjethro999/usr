import Link from "next/link";

export const metadata = {
  title: "USR — Unix Style Request",
  description: "Axios with a Unix vocabulary. HTTP client for JS and Python.",
};

const commands = [
  ["cat", "GET", "read a resource", "no"],
  ["touch", "POST", "create something new", "yes"],
  ["mv", "PUT", "replace or move", "yes"],
  ["sed", "PATCH", "edit in place", "yes"],
  ["rm", "DELETE", "remove", "no"],
  ["stat", "HEAD", "metadata only (headers, no body)", "no"],
  ["man", "OPTIONS", "“what can I do here?”", "no"],
];

const flags = [
  ["-H / --header", "add a header (repeatable)"],
  ["-d / --data", "request body"],
  ["-u / --user", "basic auth, user:password"],
  ["-m / --max-time", "timeout in seconds"],
  ["-L / --location", "follow redirects"],
  ["-o / --output", "write response body to a file"],
  ["-s / --silent", "suppress logging"],
  ["-v / --verbose", "log request and response details"],
  ["-q / --query", "add a query parameter, key=value"],
  ["--ok", "accept every status without throwing"],
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-full bg-[#0b0c10] text-[#c0c0c0] font-mono">
      <nav className="border-b border-[#1f2328] bg-[#0b0c10]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/" className="font-bold text-[#4ade80] tracking-tight">
            usr
          </Link>
          <div className="flex gap-6 text-sm">
            <Link href="#commands" className="hover:text-[#4ade80] transition">
              Commands
            </Link>
            <Link href="#flags" className="hover:text-[#4ade80] transition">
              Flags
            </Link>
            <Link href="#pipes" className="hover:text-[#4ade80] transition">
              Pipes
            </Link>
            <a
              href="https://github.com/kingjethro999/usr"
              className="hover:text-[#4ade80] transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-6 py-12 flex-grow">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
          USR<span className="text-[#4ade80]">.</span>
        </h1>
        <p className="text-lg text-[#c0c0c0] mb-8 max-w-2xl">
          Axios with a Unix vocabulary. Make HTTP requests that read like typing
          in a terminal.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-[#121417] border border-[#1f2328] p-5 rounded-lg">
            <p className="text-xs text-[#6b7280] mb-2 uppercase tracking-wider">before (fetch)</p>
            <pre className="text-sm overflow-x-auto text-[#4ade80]">{`const res = await fetch("https://api.site.com/users");
const users = await res.json();`}</pre>
          </div>
          <div className="bg-[#121417] border border-[#1f2328] p-5 rounded-lg">
            <p className="text-xs text-[#6b7280] mb-2 uppercase tracking-wider">after (usr)</p>
            <pre className="text-sm overflow-x-auto text-[#4ade80]">{`import * as usr from "usr";
const res = await usr.cat("https://api.site.com/users");`}</pre>
          </div>
        </div>

        <div className="mb-10 bg-[#121417] border border-[#1f2328] p-5 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1f2328] text-[#6b7280]">
                <th className="pb-2">Command</th>
                <th className="pb-2">HTTP</th>
                <th className="pb-2">Mnemonic</th>
                <th className="pb-2">Body?</th>
              </tr>
            </thead>
            <tbody className="text-[#c0c0c0] divide-y divide-[#1f2328]">
              {commands.map(([cmd, http, mnemonic, body]) => (
                <tr key={cmd}>
                  <td className="py-2 text-[#4ade80]">{cmd}</td>
                  <td className="py-2">{http}</td>
                  <td className="py-2">{mnemonic}</td>
                  <td className="py-2">{body}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section id="flags" className="mt-12">
          <h2 className="text-xl font-bold text-white mb-4">Flags</h2>
          <p className="text-[#c0c0c0] mb-4">
            Structured object or curl-like command-line string form.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {flags.map(([flag, desc]) => (
              <div key={flag} className="bg-[#121417] border border-[#1f2328] p-3 rounded">
                <div className="flex justify-between">
                  <span className="text-[#4ade80]">{flag}</span>
                  <span className="text-[#c0c0c0]">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="pipes" className="mt-12">
          <h2 className="text-xl font-bold text-white mb-4">Pipes</h2>
          <p className="text-[#c0c0c0] mb-4">
            Stages compose: JS uses <code className="text-[#4ade80]">.pipe()</code>,
            Python uses the real <code className="text-[#4ade80]">|</code> operator.
          </p>
          <div className="bg-[#121417] border border-[#1f2328] p-5 rounded overflow-x-auto">
            <pre className="text-sm text-[#4ade80]">{`// JS
const names = await usr
  .cat("https://api.site.com/users")
  .pipe(usr.grep({ active: true }))
  .pipe(usr.cut("name"))
  .pipe(usr.head(5));

# Python
names = cat("https://api.site.com/users") | grep(active=True) | cut("name") | head(5)`}</pre>
          </div>
        </section>

        <div className="mt-12 p-6 bg-[#121417] border border-[#1f2328] rounded">
          <h3 className="text-white font-bold mb-2">Install</h3>
          <div className="flex gap-4 text-sm">
            <div className="bg-[#121417] border border-[#1f2328] p-3 rounded">
              <p className="text-[#6b7280] text-xs mb-2">npm</p>
              <pre className="text-[#4ade80] text-xs">npm install usr</pre>
            </div>
            <div className="bg-[#121417] border border-[#1f2328] p-3 rounded">
              <p className="text-[#6b7280] text-xs mb-2">pip</p>
              <pre className="text-[#4ade80] text-xs">pip install usr</pre>
            </div>
          </div>
          <p className="text-xs text-[#6b7280] mt-3">
            One shared version across npm, PyPI, and the docs. See{" "}
            <Link href="https://github.com/kingjethro999/usr" className="text-[#4ade80] hover:underline">
              the repo
            </Link>{" "}
            for the full JS and Python packages.
          </p>
        </div>
      </section>
    </div>
  );
}
