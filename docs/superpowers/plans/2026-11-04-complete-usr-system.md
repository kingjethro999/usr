# Complete USR System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build out all remaining components specified in `CLAUDE.md` and `web/AGENTS.md`: the interactive in-memory terminal REPL, ANSI theme system and character grid, man-page documentation system, cross-language parity test suite, and the automated CI/CD pipeline.

**Architecture:** 
- A shared root metadata source (`version.json`) ensures package name and version are synchronized across npm (`js/`), PyPI (`py/`), and Next.js (`web/`).
- A shared JSON scenario suite (`test-parity/scenarios.json`) is executed by both `node:test` in JS and `unittest` in Python to verify cross-language API and pipe parity.
- An in-memory mock adapter in `web/` connects the real USR JS engine to an interactive character-grid terminal REPL with zero network calls, tab completion, ANSI theme switching (`night`, `paper`, `amber`, `phosphor`), and live command execution.
- Documentation manual pages formatted according to Unix man(1) specifications, with dual-language JS/Python code blocks and interactive search.
- A GitHub Actions workflow (`.github/workflows/ci.yml`) enforcing quality gates, cross-language tests, mechanical version rollover, and release automation.

**Tech Stack:**
- TypeScript, Node.js 20+, `node:test`
- Python 3.10+, `httpx`, `mypy`, `unittest`
- Next.js 16 (App Router), React 19, Tailwind CSS 4
- GitHub Actions

**Spec:**
- Root specification: `CLAUDE.md`
- Web app design specification: `web/AGENTS.md`

## Global Constraints

- Monospace font stack with metric fallback (`ui-monospace, "SF Mono", Menlo, Consolas, monospace`), `font-variant-ligatures: none`, max width `80ch`.
- Zero border radius (`border-radius: 0`) and zero box-shadows/gradients/blur across the web app.
- Theme palette restricted to 16 ANSI colors + cursor color (`#FFB000`) for `night`, `paper`, `amber`, and `phosphor`.
- In-memory mock transport for the web terminal: zero network requests, zero shell execution, pure string tokenization.
- Package name and version must be read from one shared source of truth.
- Both JS and Python packages must maintain 100% parity on commands, flags, pipe behaviors, and error codes.
- Strict type-checking in TypeScript and `mypy` in Python; linting clean across all workspaces.

## Review Focus

1. **Terminal Command Tokenizer Quoting**: Escaped quotes and single/double quote boundaries must parse arguments without dropping whitespace or throwing unhandled exceptions.
2. **Pipe Errors on Invalid Data**: Piped stages (`cut`, `wc`, `grep`) must throw standard `ERR_BAD_PIPE` when passed non-array/incompatible structures instead of unhandled runtime exceptions.
3. **ANSI Theme Accessibility**: Dim colors on all 4 themes (`night`, `paper`, `amber`, `phosphor`) must maintain readability with appropriate contrast.
4. **Version Rollover Bounds**: Mechanical counter rollover must reset patch to 0 at 9, and minor to 0 at 99, preserving PEP 440 and SemVer compatibility.
5. **No Shell Invocations**: Web terminal and flag parsing must operate purely as tokenizers and never touch the filesystem or evaluate shell code.

---

### Task 1: Shared Source of Truth & Version Management

**Files:**
- Create: `version.json`
- Create: `scripts/sync-version.js`
- Create: `scripts/bump-version.js`
- Modify: `js/package.json`
- Modify: `py/pyproject.toml`
- Modify: `web/package.json`

**Interfaces:**
- Produces: `version.json` containing `{ "name": "usr", "version": "0.1.0" }`.
- Produces: `bumpVersion(currentVersion: string) -> string` following `CLAUDE.md` rollover rules.
- Produces: `syncVersion()` ensuring all subproject manifests read the exact name and version.

- [ ] **Step 1: Write test for version rollover logic**

Create `test/version.test.js`:
```js
import { describe, it } from "node:test";
import assert from "node:assert";
import { getNextVersion } from "../scripts/bump-version.js";

describe("version rollover rules", () => {
  it("increments patch from 0.0.0 to 0.0.1", () => assert.strictEqual(getNextVersion("0.0.0"), "0.0.1"));
  it("rolls over patch 9 to minor: 0.0.9 -> 0.1.0", () => assert.strictEqual(getNextVersion("0.0.9"), "0.1.0"));
  it("increments patch: 0.1.0 -> 0.1.1", () => assert.strictEqual(getNextVersion("0.1.0"), "0.1.1"));
  it("rolls over patch 9 to minor: 0.1.9 -> 0.2.0", () => assert.strictEqual(getNextVersion("0.1.9"), "0.2.0"));
  it("rolls over minor 99 to major: 0.99.9 -> 1.0.0", () => assert.strictEqual(getNextVersion("0.99.9"), "1.0.0"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/version.test.js`
Expected: FAIL (file not found)

- [ ] **Step 3: Implement `version.json`, `scripts/bump-version.js`, and `scripts/sync-version.js`**

Implement `getNextVersion` and synchronization script to update `js/package.json`, `py/pyproject.toml`, and `web/package.json`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/version.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add version.json scripts/ test/version.test.js js/package.json py/pyproject.toml web/package.json
git commit -m "feat(core): establish single source of truth for package name and version"
```

---

### Task 2: Cross-Language Parity Test Suite

**Files:**
- Create: `test-parity/scenarios.json`
- Create: `js/test/parity.test.js`
- Create: `py/test_parity.py`

**Interfaces:**
- Consumes: `test-parity/scenarios.json`
- Tests:
  - Command mapping (`cat` -> GET, `touch` -> POST, `mv` -> PUT, `sed` -> PATCH, `rm` -> DELETE, `stat` -> HEAD, `man` -> OPTIONS)
  - Flag parsing: `-H`, `-d`, `-u`, `-m`, `-q`, `--ok`, and string command lines
  - Pipes: `grep`, `head`, `tail`, `sort`, `uniq`, `cut`, `wc`, `tee`
  - Error codes: `ERR_BAD_REQUEST`, `ERR_NETWORK`, `ERR_BAD_PIPE`, etc.

- [ ] **Step 1: Define shared test scenarios in `test-parity/scenarios.json`**

JSON containing test definitions with expected inputs, commands, data structures, and expected transformations.

- [ ] **Step 2: Implement JS parity runner in `js/test/parity.test.js`**

Load `scenarios.json` and execute each test against `usr` JS exports.
Run: `cd js && npm test`
Expected: PASS

- [ ] **Step 3: Implement Python parity runner in `py/test_parity.py`**

Load `scenarios.json` and execute each test against `usr` Python exports.
Run: `cd py && python3 -m unittest -v test_parity.py`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add test-parity/ js/test/parity.test.js py/test_parity.py
git commit -m "test(parity): implement cross-language test suite for JS and Python"
```

---

### Task 3: CI/CD Pipeline Automation

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Workflow triggers: `push` on `main`, `pull_request` on `main`.
- Jobs:
  - `check`: Runs matrix for JS, Python, and Web checks (lint, types, unit tests, parity tests).
  - `release`: Runs on `main` when `check` passes; bumps version, commits `chore(release): vX.Y.Z [skip ci]`, tags `vX.Y.Z`, and runs publish steps.

- [ ] **Step 1: Write GitHub Actions workflow configuration in `.github/workflows/ci.yml`**

Include:
- Concurrency group `release-${{ github.ref }}`
- Job `quality-gate`:
  - Node 20 setup, `npm run lint`, `npm run typecheck`, `npm run build`, `npm test` in `js/`
  - Python 3.10 setup, `mypy usr`, `python3 -m unittest -v test_usr.py test_parity.py` in `py/`
  - Pnpm setup, `pnpm lint`, `pnpm build` in `web/`
- Job `release`:
  - Token and permissions `contents: write`, `id-token: write`
  - Version bump execution and git tagging
  - Publication steps for npm and PyPI

- [ ] **Step 2: Verify local quality gate matches CI script**

Run:
```bash
(cd js && npm run lint && npm run typecheck && npm run build && npm test) && \
(cd py && mypy usr && python3 -m unittest -v test_usr.py test_parity.py) && \
(cd web && pnpm lint && pnpm build)
```
Expected: All exit with code 0.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow for quality gate and automated releases"
```

---

### Task 4: Web ANSI Theme Engine & Character Grid

**Files:**
- Create: `web/app/theme.ts`
- Create: `web/components/StatusLine.tsx`
- Create: `web/components/ShortcutsHelp.tsx`
- Modify: `web/app/globals.css`
- Modify: `web/app/layout.tsx`

**Interfaces:**
- Produces: `Theme` type (`"night" | "paper" | "amber" | "phosphor"`).
- Produces: `useTheme` / theme state controller persisting in `localStorage`.
- Produces: `StatusLine` rendering top bar with version, install commands, active theme, and `?` toggle.
- Produces: `ShortcutsHelp` modal dialog supporting WCAG single-key toggles.

- [ ] **Step 1: Add ANSI color tokens and character grid CSS to `web/app/globals.css`**

Define CSS variables `--theme-bg`, `--theme-fg`, `--theme-dim`, `--theme-red`, `--theme-green`, `--theme-yellow`, `--theme-blue`, `--theme-magenta`, `--theme-cyan`, `--theme-cursor` for all 4 themes. Add inverse-video selection and 0 border radius styles.

- [ ] **Step 2: Implement `StatusLine` and `ShortcutsHelp` components**

Render character-cell aligned bars with package name and version from `version.json`, click-to-copy install snippets, and theme cycling (`t` key).

- [ ] **Step 3: Test build in `web/`**

Run: `cd web && pnpm build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add web/app/theme.ts web/components/StatusLine.tsx web/components/ShortcutsHelp.tsx web/app/globals.css web/app/layout.tsx
git commit -m "feat(web): add ANSI 16-color theme engine, character grid, and status line"
```

---

### Task 5: In-Memory Mock Client & Terminal REPL Engine

**Files:**
- Create: `web/lib/mock-api.ts`
- Create: `web/lib/terminal-parser.ts`
- Create: `web/components/Terminal.tsx`
- Modify: `web/app/page.tsx`

**Interfaces:**
- Produces: `MockHttpAdapter`: in-memory response provider for `/users`, `/users/:id`, `/posts`, with query and pagination support.
- Produces: `parseTerminalInput(line: string)`: shell-quoted tokenizer into command, flags, and pipes.
- Produces: `Terminal` component with:
  - Command execution via real JS USR client using `MockHttpAdapter`
  - REPL history (Up/Down)
  - `Ctrl+L` (clear), `Ctrl+C` (cancel)
  - Tab completion for commands, flags, mock URLs
  - Suggestion chips (`cat /users`, `touch /users`, `cat /users | grep Ada`, `rm /users/2`)
  - Built-in commands: `help`, `clear`, `history`, `theme`, `ls`, `whoami`, `reset`, `man`
  - Easter eggs: `sudo`, `rm -rf /`

- [ ] **Step 1: Write test for terminal parser**

Create `web/lib/terminal-parser.test.ts` verifying argument quoting, flags, and pipe splitting.
Run: `node --test` or test runner in web.

- [ ] **Step 2: Implement `web/lib/mock-api.ts` and `web/lib/terminal-parser.ts`**

In-memory data store with REST simulation for GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS.

- [ ] **Step 3: Implement `web/components/Terminal.tsx`**

Complete interactive shell session component following `web/AGENTS.md` character cell grid specifications.

- [ ] **Step 4: Integrate Terminal into `web/app/page.tsx`**

Render hero section with live working terminal, suggestion chips, and initial pre-run output.

- [ ] **Step 5: Verify web build**

Run: `cd web && pnpm build`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add web/lib/mock-api.ts web/lib/terminal-parser.ts web/components/Terminal.tsx web/app/page.tsx
git commit -m "feat(web): implement in-memory mock client and live terminal REPL"
```

---

### Task 6: Manual Pages Documentation System & Navigation

**Files:**
- Create: `web/lib/man-data.ts`
- Create: `web/app/man/page.tsx`
- Create: `web/app/man/[command]/page.tsx`
- Create: `web/components/ManPage.tsx`
- Create: `web/components/SearchModal.tsx`
- Create: `web/components/LanguageSwitch.tsx`

**Interfaces:**
- Produces: `man-data.ts` single structured definition of all commands, flags, and examples.
- Produces: `ManPage` rendering sections: `NAME`, `SYNOPSIS`, `DESCRIPTION`, `OPTIONS`, `EXAMPLES`, `ERRORS`, `SEE ALSO`.
- Produces: `LanguageSwitch` `--lang=js` / `--lang=python` persistent toggle.
- Produces: `SearchModal` triggered by `/` key for interactive `less`-style grep search.

- [ ] **Step 1: Build `web/lib/man-data.ts` structured definitions**

Export data for `cat(1)`, `touch(1)`, `mv(1)`, `sed(1)`, `rm(1)`, `stat(1)`, `man(1)`, pipes, traps, and client configuration.

- [ ] **Step 2: Implement `ManPage`, `LanguageSwitch`, and `SearchModal`**

Render man-page layouts with two-pane layout on wide screens, `ls man/` navigation, and keyboard navigation (`j`/`k`, `gg`/`G`).

- [ ] **Step 3: Implement routes `/man` and `/man/[command]`**

Static page generation for all commands.

- [ ] **Step 4: Verify web build**

Run: `cd web && pnpm build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/lib/man-data.ts web/app/man/ web/components/ManPage.tsx web/components/SearchModal.tsx web/components/LanguageSwitch.tsx
git commit -m "feat(web): add Unix man-page docs system with search and language toggle"
```

---

### Task 7: Full System Verification, Parity Check, & Git Push

**Files:**
- Review and verify all modified files across repository.

**Interfaces:**
- Runs full test and build matrix across `js/`, `py/`, `web/`, and `test-parity/`.

- [ ] **Step 1: Execute all lint, typecheck, build, and test commands**

```bash
cd /home/japheth/Desktop/usr/js && npm run lint && npm run typecheck && npm run build && npm test
cd /home/japheth/Desktop/usr/py && mypy usr && python3 -m unittest -v test_usr.py test_parity.py
cd /home/japheth/Desktop/usr/web && pnpm lint && pnpm build
```
Expected: All exit 0 with clean output.

- [ ] **Step 2: Commit any remaining touches and push to origin**

```bash
git pull --rebase origin main
git push origin main
```
Expected: Successfully pushed to remote origin.
