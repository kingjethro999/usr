"use client";

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { handleMockRequest, resetMockData } from "../lib/mock-api";
import { parseTerminalLine } from "../lib/terminal-parser";
import versionInfo from "../version.json";

interface HistoryEntry {
  id: string;
  command: string;
  output: string;
  statusLine?: {
    code: number;
    text: string;
  };
  isError?: boolean;
}

const SUGGESTIONS = [
  "cat /users",
  'touch /users -d \'{"name":"Charles Babbage"}\'',
  "cat /users | grep active | head 2",
  "cat /posts | sort views",
  "rm /users/4",
  "man cat",
];

const AUTOCOMPLETE_LIST = [
  "cat",
  "touch",
  "mv",
  "sed",
  "rm",
  "stat",
  "man",
  "help",
  "clear",
  "history",
  "theme",
  "ls",
  "whoami",
  "reset",
  "/users",
  "/users/1",
  "/users/2",
  "/posts",
  "-H",
  "-d",
  "-m",
  "-q",
  "--ok",
  "grep",
  "head",
  "tail",
  "sort",
  "uniq",
  "cut",
  "wc",
];

export function Terminal() {
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [entries, setEntries] = useState<HistoryEntry[]>([
    {
      id: "init",
      command: "cat /users",
      statusLine: { code: 200, text: "200 OK  4 items" },
      output: JSON.stringify(
        [
          { id: 1, name: "Ada Lovelace", username: "ada", role: "admin", active: true },
          { id: 2, name: "Alan Turing", username: "alan", role: "engineer", active: true },
          { id: 3, name: "Grace Hopper", username: "grace", role: "admiral", active: false },
          { id: 4, name: "Dennis Ritchie", username: "dmr", role: "creator", active: false },
        ],
        null,
        2
      ),
    },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll container to bottom on new output
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [entries]);

  const executeLine = (rawLine: string) => {
    const line = rawLine.trim();
    if (!line) return;

    setCommandHistory((prev) => [...prev, line]);
    setHistoryIndex(-1);
    setInput("");

    const parsed = parseTerminalLine(line);
    const cmd = parsed.command.toLowerCase();

    // Built-in shell commands
    if (cmd === "clear") {
      setEntries([]);
      return;
    }

    if (cmd === "reset") {
      resetMockData();
      setEntries((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          command: line,
          output: "Mock database reset to initial state.",
        },
      ]);
      return;
    }

    if (cmd === "history") {
      const histText = commandHistory.map((h, i) => `  ${i + 1}  ${h}`).join("\n");
      setEntries((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          command: line,
          output: histText || "No commands in history.",
        },
      ]);
      return;
    }

    if (cmd === "help") {
      const helpText = [
        "USR Interactive Terminal REPL",
        "",
        "HTTP Commands:",
        "  cat <url> [flags]        GET request (read resource)",
        "  touch <url> [flags]      POST request (create resource)",
        "  mv <url> [flags]         PUT request (replace resource)",
        "  sed <url> [flags]        PATCH request (edit resource)",
        "  rm <url> [flags]         DELETE request (remove resource)",
        "  stat <url> [flags]       HEAD request (headers only)",
        "  man <url|cmd>            OPTIONS request or show manual page",
        "",
        "Pipes (|):",
        "  grep <term>              Filter items containing term or matching object",
        "  head <n> / tail <n>      First or last N items",
        "  sort [key]               Sort array (optionally by field)",
        "  uniq [key]               Deduplicate array (optionally by field)",
        "  cut <field...>           Extract specified fields",
        "  wc                       Count items",
        "",
        "Shell Helpers:",
        "  ls                       List available mock endpoints",
        "  reset                    Reset mock database to initial state",
        "  clear                    Clear terminal screen",
        "  theme <name>             Set active theme (night, paper, amber, phosphor)",
        "  whoami                   Print current shell session identity",
      ].join("\n");

      setEntries((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          command: line,
          output: helpText,
        },
      ]);
      return;
    }

    if (cmd === "whoami") {
      setEntries((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          command: line,
          output: `guest@${versionInfo.name} (POSIX terminal session)`,
        },
      ]);
      return;
    }

    if (cmd === "ls") {
      const lsText = [
        "Endpoints on mock server:",
        "  /users      [GET, POST]",
        "  /users/:id  [GET, PUT, PATCH, DELETE]",
        "  /posts      [GET]",
        "  /error/401  [GET]",
        "  /error/403  [GET]",
        "  /error/500  [GET]",
      ].join("\n");
      setEntries((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          command: line,
          output: lsText,
        },
      ]);
      return;
    }

    if (cmd === "theme") {
      const targetTheme = parsed.args[0];
      if (["night", "paper", "amber", "phosphor"].includes(targetTheme)) {
        localStorage.setItem("usr-theme", targetTheme);
        document.documentElement.setAttribute("data-theme", targetTheme);
        setEntries((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            command: line,
            output: `Theme changed to ${targetTheme}.`,
          },
        ]);
      } else {
        setEntries((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            command: line,
            isError: true,
            output: `usr: theme: invalid theme "${targetTheme}". Use night, paper, amber, or phosphor.`,
          },
        ]);
      }
      return;
    }

    if (line === "npm i usr" || line === "npm install usr") {
      setEntries((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          command: line,
          output: `+ usr@${versionInfo.version}\nadded 1 package in 0.4s. See installation section below for docs.`,
        },
      ]);
      return;
    }

    if (line === "pip install usr" || line === "pip3 install usr") {
      setEntries((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          command: line,
          output: `Successfully installed usr-${versionInfo.version}. See installation section below for docs.`,
        },
      ]);
      return;
    }

    // Easter eggs
    if (cmd === "sudo") {
      setEntries((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          command: line,
          output: "usr: sudo: USR needs no elevated privileges. All operations are standard HTTP.",
        },
      ]);
      return;
    }

    if (line.startsWith("rm -rf") || line.startsWith("rm -r /")) {
      setEntries((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          command: line,
          output: "usr: rm: USR deletes remote HTTP resources only and never touches your local filesystem.",
        },
      ]);
      return;
    }

    // USR Request commands
    const httpMethods: Record<string, string> = {
      cat: "GET",
      touch: "POST",
      mv: "PUT",
      sed: "PATCH",
      rm: "DELETE",
      stat: "HEAD",
      man: "OPTIONS",
    };

    if (!httpMethods[cmd]) {
      setEntries((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          command: line,
          isError: true,
          output: `usr: ${cmd}: command not found. Type "help" for a list of available commands.`,
        },
      ]);
      return;
    }

    // Parse flags and URL from args
    let url = "/users";
    let bodyData: unknown = undefined;
    const queryParams: Record<string, string> = {};
    let okFlag = false;

    for (let i = 0; i < parsed.args.length; i++) {
      const a = parsed.args[i];
      if (a === "-d" || a === "--data") {
        const val = parsed.args[++i];
        try {
          bodyData = JSON.parse(val);
        } catch {
          bodyData = val;
        }
      } else if (a === "-q" || a === "--query") {
        const val = parsed.args[++i] || "";
        const [k, v] = val.split("=");
        queryParams[k] = v || "";
      } else if (a === "--ok") {
        okFlag = true;
      } else if (!a.startsWith("-")) {
        url = a;
      }
    }

    // Execute through mock adapter
    const mockRes = handleMockRequest(httpMethods[cmd], url, bodyData, queryParams);

    // Check error condition
    const isError = mockRes.status >= 400 && !okFlag;

    let outputData: unknown = mockRes.data;

    // Apply pipe stages if any
    if (!isError && parsed.pipes.length > 0) {
      try {
        for (const pipe of parsed.pipes) {
          const stage = pipe.stage.toLowerCase();
          const arg0 = pipe.args[0];

          if (!Array.isArray(outputData) && stage !== "wc") {
            throw new Error(`pipe stage "${stage}" requires an array of items`);
          }

          if (stage === "grep") {
            const arr = outputData as Record<string, unknown>[];
            outputData = arr.filter((item) => {
              const str = JSON.stringify(item);
              return str.toLowerCase().includes((arg0 || "").toLowerCase());
            });
          } else if (stage === "head") {
            const count = parseInt(arg0 || "10", 10);
            outputData = (outputData as unknown[]).slice(0, count);
          } else if (stage === "tail") {
            const count = parseInt(arg0 || "10", 10);
            outputData = (outputData as unknown[]).slice(-count);
          } else if (stage === "wc") {
            outputData = Array.isArray(outputData) ? outputData.length : 1;
          } else if (stage === "cut") {
            const fields = pipe.args;
            const arr = outputData as Record<string, unknown>[];
            outputData = arr.map((item) => {
              const res: Record<string, unknown> = {};
              for (const f of fields) res[f] = item[f];
              return res;
            });
          } else if (stage === "sort") {
            const key = arg0;
            const arr = [...(outputData as Record<string, unknown>[])];
            if (key) {
              arr.sort((a, b) => String(a[key] ?? "").localeCompare(String(b[key] ?? "")));
            } else {
              arr.sort();
            }
            outputData = arr;
          } else if (stage === "uniq") {
            const key = arg0;
            const seen = new Set();
            const arr = outputData as Record<string, unknown>[];
            outputData = arr.filter((item) => {
              const val = key ? item[key] : item;
              if (seen.has(val)) return false;
              seen.add(val);
              return true;
            });
          }
        }
      } catch (err) {
        setEntries((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            command: line,
            isError: true,
            output: `usr: ${cmd}: PipeError: ${(err as Error).message}`,
          },
        ]);
        return;
      }
    }

    let formattedOutput = "";
    if (outputData === null || outputData === undefined) {
      formattedOutput = "";
    } else if (typeof outputData === "object") {
      formattedOutput = JSON.stringify(outputData, null, 2);
    } else {
      formattedOutput = String(outputData);
    }

    if (isError) {
      formattedOutput = `usr: ${cmd}: ${mockRes.status} ${mockRes.statusText}: ${url}\ncode=ERR_BAD_REQUEST  status=${mockRes.status}`;
    }

    const itemCount = Array.isArray(outputData) ? `  ${outputData.length} items` : "";

    setEntries((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        command: line,
        statusLine: {
          code: mockRes.status,
          text: `${mockRes.status} ${mockRes.statusText}${itemCount}`,
        },
        output: formattedOutput,
        isError,
      },
    ]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeLine(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIdx = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInput(commandHistory[nextIdx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= commandHistory.length) {
        setHistoryIndex(-1);
        setInput("");
      } else {
        setHistoryIndex(nextIdx);
        setInput(commandHistory[nextIdx]);
      }
    } else if (e.key === "c" && e.ctrlKey) {
      // Ctrl+C
      e.preventDefault();
      setEntries((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          command: `${input}^C`,
          output: "",
        },
      ]);
      setInput("");
      setHistoryIndex(-1);
    } else if (e.key === "l" && e.ctrlKey) {
      // Ctrl+L
      e.preventDefault();
      setEntries([]);
    } else if (e.key === "Tab") {
      // Tab completion
      const tokens = input.split(" ");
      const lastToken = tokens[tokens.length - 1];
      if (lastToken) {
        const matches = AUTOCOMPLETE_LIST.filter((item) =>
          item.toLowerCase().startsWith(lastToken.toLowerCase())
        );
        if (matches.length > 0) {
          e.preventDefault();
          tokens[tokens.length - 1] = matches[0];
          setInput(tokens.join(" "));
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full border border-[var(--theme-dim)] bg-[var(--theme-bg)] text-[var(--theme-fg)] font-mono text-sm p-4 overflow-y-auto max-h-[500px]"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Output History */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[var(--theme-fg)]">guest</span>
              <span className="text-[var(--theme-fg)]">@</span>
              <span className="text-[var(--theme-green)] font-bold">{versionInfo.name}</span>
              <span className="text-[var(--theme-blue)]">:~</span>
              <span className="text-[var(--theme-fg)]">$</span>
              <span className="font-bold">{entry.command}</span>
            </div>

            {entry.statusLine && (
              <div
                className={`text-xs font-bold ${
                  entry.statusLine.code >= 200 && entry.statusLine.code < 300
                    ? "text-[var(--theme-green)]"
                    : entry.statusLine.code >= 400 && entry.statusLine.code < 500
                    ? "text-[var(--theme-yellow)]"
                    : "text-[var(--theme-red)]"
                }`}
              >
                {entry.statusLine.text}
              </div>
            )}

            {entry.output && (
              <pre
                className={`whitespace-pre-wrap overflow-x-auto text-xs ${
                  entry.isError ? "text-[var(--theme-red)]" : "text-[var(--theme-fg)]"
                }`}
              >
                {entry.output}
              </pre>
            )}
          </div>
        ))}
      </div>

      {/* Active Prompt */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[var(--theme-fg)] select-none">guest</span>
        <span className="text-[var(--theme-fg)] select-none">@</span>
        <span className="text-[var(--theme-green)] font-bold select-none">{versionInfo.name}</span>
        <span className="text-[var(--theme-blue)] select-none">:~</span>
        <span className="text-[var(--theme-fg)] select-none">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow bg-transparent text-[var(--theme-fg)] outline-none border-none font-mono text-sm caret-[var(--theme-cursor)]"
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      {/* Clickable Suggested Commands */}
      <div className="mt-4 pt-3 border-t border-[var(--theme-dim)]/40 flex flex-wrap gap-2 text-xs">
        <span className="text-[var(--theme-dim)] select-none">suggested:</span>
        {SUGGESTIONS.map((sug) => (
          <button
            key={sug}
            onClick={(e) => {
              e.stopPropagation();
              executeLine(sug);
            }}
            className="text-[var(--theme-cyan)] hover:bg-[var(--theme-fg)] hover:text-[var(--theme-bg)] px-1 cursor-pointer"
          >
            {sug}
          </button>
        ))}
      </div>
    </div>
  );
}
