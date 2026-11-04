# AGENTS.md: the USR web app

This file tells any coding agent how the USR website (the landing page and the docs) must look, feel and behave. Read it before touching anything in the web app.

The site has one job: make a visitor believe, within five seconds, that making an HTTP request can feel like typing a Unix command, and then show them exactly how.

## Scope and precedence

- This file governs the web app's design, copy, interaction, accessibility and front-end engineering.
- The root `CLAUDE.md` governs everything else: what USR is, the command vocabulary, versioning, CI/CD, and the git workflow (commit and push after every meaningful change, Conventional Commits, rebase before push, never edit the version by hand). If the two files disagree on a non-design matter, the root file wins.
- The package name (`usr` or `lsr` is still undecided) and the current version come from the single shared source named in `CLAUDE.md`. Never type either one by hand in a component, page, example or metadata string.

---

## The idea

The site is not a website that has a terminal on it. The site is a terminal session. A visitor lands on a shell prompt, runs real commands, reads manual pages, and moves around with a directory listing.

Spend the boldness in two places only:

1. **A live, working terminal in the hero.** The visitor types `cat /users` and gets a response. It runs the real JS implementation of USR against an in-memory mock, never against the network.
2. **A strict character grid.** Every size, gap and width is a whole number of terminal cells. This discipline is what makes the page feel like a terminal rather than a dark theme with a monospace font.

Everything else stays quiet. No decoration, no imagery, no effects. If an element does not carry information, delete it.

---

## Design plan

### Color

The whole site uses the 16 ANSI colors plus a foreground, a background and a cursor, exactly like a real terminal theme. No other colors exist. Colors are tokens named by ANSI slot, with semantic aliases on top.

**Default dark theme (`night`)**

| Token                | Hex       | Contrast on bg | Role                                       |
| -------------------- | --------- | -------------- | ------------------------------------------ |
| `bg`                 | `#14171C` | n/a            | background                                 |
| `fg`                 | `#D5D8DE` | 12.58          | body text                                  |
| `dim` (bright black) | `#8791A0` | 5.64           | comments, secondary text, line numbers     |
| `red`                | `#E5646E` | 5.46           | errors, 5xx, deletions                     |
| `green`              | `#86C46B` | 8.66           | success, 2xx, additions                    |
| `yellow`             | `#E3B341` | 9.23           | warnings, 4xx, numbers                     |
| `blue`               | `#6AA2EE` | 6.86           | links, paths                               |
| `magenta`            | `#C48DE8` | 7.12           | flags and options                          |
| `cyan`               | `#55C4BE` | 8.58           | strings, URLs, 1xx and 3xx                 |
| `cursor`             | `#FFB000` | 9.80           | the block cursor, focus ring, nothing else |

**Light theme (`paper`)**: `bg #FCFCFB`, `fg #1B1F24` (16.13), `dim #5A6270` (5.99), `red #B3261E` (6.37), `green #1F7A3D` (5.23), `yellow #8A5A00` (5.77), `blue #1F5FBF` (5.93), `magenta #8A3FB5` (5.91), `cyan #0B7A75` (5.04), `cursor #B26A00` (4.13, which is fine because the cursor is a non-text element and needs 3:1).

**Opt-in retro themes (`amber`, `phosphor`)**: only reachable through the `theme` command, never the default. `amber`: bg `#1A1100`, fg `#FFB000`, dim `#B07A00`. `phosphor`: bg `#04140A`, fg `#4DFF88`, dim `#2FA85A`. These are single-hue themes, so semantic colors collapse to the one hue and the text labels (see below) carry all meaning. The only visual effect allowed anywhere on the site is a very light glow on these two themes. No scanlines, no screen curvature, no flicker.

Rules:

- The cursor color (`#FFB000`) is the only accent. It appears on the cursor and the focus ring. Do not use it for buttons, links or highlights.
- Color is never the only carrier of meaning. A 404 is yellow _and_ says `404 Not Found`. A success is green _and_ says `200 OK`.
- Dim text must still meet 4.5:1 against its background. If a theme change would break that, change the theme.
- Hierarchy comes from inverse video, weight, underline and color, not from size.

### Type

- **One monospace family for everything**, prose included. Man pages are written in monospace at about 80 columns, and the docs should read exactly like that.
- Proposed face: **Commit Mono** (SIL Open Font License), self-hosted and subset. The owner confirms the font, and the agent verifies the license before bundling. Do not default to the font the Next.js starter scaffolds, or to JetBrains Mono, Fira Code, IBM Plex Mono, Space Mono or Courier.
- Fallback stack: `ui-monospace, "SF Mono", Menlo, Consolas, monospace`. Because the whole layout depends on character width, the fallback must be metric-matched (size and ascent adjustments) so the grid does not jump when the real font loads.
- **One font size** per breakpoint, like a real terminal. Do not use a modular type scale. Two weights only: regular and bold.
- Ligatures off everywhere (`font-variant-ligatures: none`). A reader must see exactly the characters that were typed (`--`, `->`, `!=`).
- Maximum line length: `80ch`. Prose containers use `max-width: min(100%, 80ch)`.
- Text is always left-aligned and ragged-right. Never center, never justify.
- All caps appear in one place only: the section headings of a man page (`NAME`, `SYNOPSIS`, and so on), because that is what real man pages do. Nowhere else.
- Typographic polish rules from the root project (typographic quotes, real apostrophes) apply to prose, but inside code, commands and terminal output always use straight ASCII quotes.

### Layout

- Layout is a grid of character cells. Widths are in `ch`, vertical rhythm is in `lh` or a fixed row height equal to one line. Padding and gaps are whole cells.
- Line height is constant. Nothing is sized in `px` except hairline borders.
- Content is a single column up to 80 columns on mobile and tablet. On wide screens, the docs use two panes (a listing on the left, the page on the right), like a terminal multiplexer.
- No cards. No rounded corners anywhere (`border-radius: 0`). No shadows, gradients, blur or glass.
- Separation is done with whitespace rows, one-cell borders (1px solid in `dim`), and inverse-video bars. Real CSS borders do the layout work. Box-drawing characters are decorative only, are `aria-hidden`, and never carry meaning.

Wireframes (not to scale):

```
LANDING
+--------------------------------------------------------------+
| usr v0.4.2   npm i usr   pip install usr         [night] [?] |  status line
+--------------------------------------------------------------+
| (ascii wordmark, aria-hidden; real h1 beside it)             |
| HTTP requests, typed like Unix commands.                     |
|                                                              |
| guest@usr:~$ cat https://api.site.com/users                  |
| 200 OK  3 items                                              |
| [ {...}, {...}, {...} ]                                      |
| guest@usr:~$ _                          suggested: touch rm  |  live terminal
|                                                              |
| $ man usr          (command -> HTTP table)                   |
| $ git diff         (fetch vs usr)                            |
| $ cat ... | grep   (pipes)                                   |
| $ npm i usr   $ pip install usr                              |
+--------------------------------------------------------------+

DOCS (wide)
+----------------+---------------------------------------------+
| ls man/        | CAT(1)                                      |
|  cat           |                                             |
|  touch         | NAME                                        |
|  mv            |        cat - read a resource over HTTP      |
|  sed           | SYNOPSIS                                    |
|  rm            |        cat [-H header] [-m seconds] url     |
|  ...           | OPTIONS ...                                 |
+----------------+---------------------------------------------+
```

### Principles

1. It behaves like a terminal, not like a drawing of one.
2. Everything is real text that can be selected, copied, searched and read aloud.
3. Fast, quiet and legible beat atmospheric every time.
4. The visitor can try the product before they read about it.

---

## Terminal rules (the cell grid)

- **No transitions.** Terminals do not ease. State changes (hover, focus, active, theme switch) are instant.
- **Selection, hover and focus use inverse video:** background becomes the foreground color, text becomes the background color. Text selection uses this too, which keeps contrast high on every theme. Focus is also a 2px outline in the cursor color.
- **Links** are `blue` and underlined. External links get no arrow glyph. Visited links stay the same color.
- **Buttons look like commands.** There are very few buttons. A copy control is rendered as `[copy]`, becoming `[copied]` for two seconds. A primary call to action is the install command itself, click-to-copy: `$ npm i usr`.
- **Badges** look like boot-log tags: `[ ok ]`, `[warn]`, `[fail]`, with matching colors and always with the text.
- **Callouts** look like compiler output, not boxes with icons: `note: ...`, `warning: ...`, `error: ...`, where the label is colored and the rest is plain text. No emoji, ever.
- **Tables** are aligned columns of text with a dim header row. No zebra stripes, no cell borders.
- **No fake window chrome.** No three colored dots, no title bar, no drop-shadowed window floating on a gradient. The page edge is the terminal edge.
- **No imagery.** No photos, illustrations, stock art or icon sets. If a symbol is needed, use an ASCII glyph that carries meaning (`>`, `#`, `*`, `[x]`).
- The only generated image is the social preview card, which is a static render of a real request and response in the default theme.

---

## Component vocabulary

Build these once, reuse them everywhere, and keep the names.

**Prompt.** `guest@usr:~$ ` where `guest` and `@` are `fg`, the host (package name from the shared source) is `green`, the path is `blue`, and `$` is `fg`. In copy-able code blocks the prompt is not selectable, so copying a command never includes `$ `.

**Cursor.** A solid block in the cursor color. It blinks at 1s steps only when the terminal is focused and `prefers-reduced-motion` is not set. Otherwise it is solid. An unfocused terminal shows a hollow block outline.

**Output.** Standard output in `fg`. Standard error (failures) in `red`, prefixed with `usr: <command>:`. Status lines are colored by class: 1xx and 3xx `cyan`, 2xx `green`, 4xx `yellow`, 5xx and network errors `red`.

**Status line.** A one-row bar pinned to the top of the viewport (landing) or to the top of the docs, in inverse video, like a multiplexer status bar. It shows the package name and version, the two install commands, the active theme and a `?` help control. It must be keyboard reachable and must not cover content on small screens (it collapses to name and version).

**Panes.** Two-column layout on wide screens with a 1px `dim` divider. On narrow screens, panes stack, and the listing becomes a collapsible `ls` block.

**Listing.** The docs navigation, rendered like `ls` output: one entry per line, the current page in inverse video. It is a real `nav` with a real list of links.

**Code block.** Monospace text, no background fill, a 1px `dim` left border. Language shown as a dim label like `js` or `python`. A `[copy]` control. Highlighting is generated at build time from the palette (commands bold `fg`, flags `magenta`, strings and URLs `cyan`, paths `blue`, numbers `yellow`, comments `dim`). No runtime highlighter.

**Diff block.** Used for the "fetch vs usr" comparison: removed lines in `red` with a `-` prefix, added lines in `green` with a `+` prefix. The prefix characters are part of the text, so meaning survives without color.

**Language switch.** A pair of toggles rendered as flags: `--lang=js` and `--lang=python`. The choice persists across pages. Examples for both languages are always present in the HTML, and the toggle only changes which is visible, so search and no-JS readers still get everything.

**Search.** Styled like `less` search: pressing `/` opens a one-line prompt at the bottom, results listed as `grep` output with the match highlighted in inverse video.

**Footer.** An idle prompt (`guest@usr:~$ _`) followed by license, repository link, and the version. No newsletter forms, no social icon rows.

---

## The landing page

The page reads as a short shell session. Each section begins with the command that "produced" it. Those command lines are real headings (`h2`) styled as prompts, so the document outline stays valid.

1. **Hero.** A one-line pitch above the live terminal, then the terminal itself (see below). The pitch is plain: it says what USR is. Suggested wording, which the owner may change: "HTTP requests, typed like Unix commands." Below it, one sentence: that it is a small Axios-style client for JavaScript and Python.
2. **`man usr`.** The command-to-HTTP table: `cat` GET, `touch` POST, `mv` PUT, `sed` PATCH, `rm` DELETE, `stat` HEAD, `man` OPTIONS. Aligned columns, with each command linking to its manual page. This is generated from the same command definitions as the docs, never typed by hand.
3. **`git diff`.** The same request written with `fetch` (or Axios) and with USR as a diff block. Real code, tested in CI.
4. **Pipes.** One example showing `cat ... | grep ... | head`, with the live terminal pre-filled so the visitor can run it. Note the JS form uses `.pipe()` and the Python form uses `|`.
5. **Install.** Two click-to-copy lines, one for npm and one for pip, with the exact current package name.
6. **Footer** as described above.

Do not add testimonials, logos, feature grids, pricing, stat counters, gradient banners, or a "scroll down" hint. Do not number sections unless the content is genuinely a sequence.

---

## The live terminal (REPL)

It is the signature element. Treat it as a product, not a decoration.

**What it runs.** The real USR JS implementation, with its transport replaced by an in-memory mock adapter that serves a small fake API (`/users`, `/users/:id`, `/posts`, and a couple of intentional error cases). It never makes a network request.

**Supported input.**

- The seven request commands (`cat`, `touch`, `mv`, `sed`, `rm`, `stat`, `man`) with the flags from the root spec (`-H`, `-d`, `-u`, `-m`, `-L`, `-s`, `-v`, `-q`, `--ok`).
- The pipe stages (`grep`, `head`, `tail`, `sort`, `uniq`, `cut`, `wc`, `tee`) joined with `|`.
- Shell-flavoured helpers: `help`, `clear`, `history`, `theme <name>`, `ls`, `whoami`, `man <command>` (shows the docs page text inline), and install lines (`npm i usr`, `pip install usr`) which print a short confirmation plus a link to the install section.
- Anything else prints `usr: <word>: command not found` and a one-line hint pointing at `help`.

**Parser rules (security).** The input line is run through a small tokenizer with shell-like quoting. It is parsing only. It never calls `eval`, never constructs functions from strings, never executes anything outside a fixed whitelist of commands, and never touches the real filesystem or real network. All output is rendered as text nodes, never as raw HTML.

**Behaviour.**

- History with Up and Down arrows. `Ctrl+L` clears. `Ctrl+C` cancels the current line.
- Tab completion for command names, flags and mock paths. Tab only completes when there is something to complete. Otherwise it moves focus on, so the terminal is never a keyboard trap (see Accessibility).
- Suggested commands appear as clickable chips under the prompt (`cat /users`, `touch /users`, `rm /users/2`, pipe example). Clicking one types and runs it. This is how touch and mobile visitors use it without fighting a virtual keyboard.
- The first load shows one pre-run example so the terminal is never empty.
- State resets on reload. The mock data resets with `reset` or on reload.

**Output format.**

```
guest@usr:~$ cat /users/99
usr: cat: 404 Not Found: /users/99
code=ERR_BAD_REQUEST  status=404
```

Errors say what happened and what to try, in the library's own vocabulary and codes. They never apologise and never use fake system messages that mean something else. Do not print "Permission denied" for a missing page, for example.

**Easter eggs (keep few, keep honest).** `sudo` prints that USR needs no elevated privileges. `rm -rf /` prints that USR deletes remote resources only and never touches your filesystem. These doubles as the safety message from the root spec. Any additional egg must be documented in this file.

---

## The docs

Docs are manual pages. Each command has its own page in man-page format.

**Page layout.** A header like `CAT(1)`, then sections in this order, flush-left in caps: `NAME`, `SYNOPSIS`, `DESCRIPTION`, `OPTIONS`, `EXAMPLES`, `ERRORS`, `SEE ALSO`. Body text is indented about 7 columns on wide screens and 2 on mobile. Options are a definition list: the flag in `magenta`, then its description indented below. Use `ERRORS` (not `EXIT STATUS`) because USR reports error codes, not exit codes.

**Other pages in the same style:** a command index (like `man -k`, an aligned table with command, HTTP method, whether it is safe, whether it is idempotent, one-line summary), installation, quick start, flags, pipes, scoped clients (`cd`), defaults, traps, response shape, errors and codes, a JS versus Python parity table, and a security note stating that USR never runs a shell.

**Changelog.** Styled like `git log --oneline`: version, then message, newest first. Because versions are bumped automatically and mechanically, the changelog is where breaking changes are called out in plain words.

**Single source of truth.** The command reference (names, HTTP methods, signatures, flags, error codes, examples) is generated from one structured definition shared with the library. A page can never describe a flag the library does not have. Every example is type-checked or executed in CI.

**Navigation.** The `ls`-style listing on the left, `/` to search, the language switch, and previous and next links at the bottom styled as `prev: cat` and `next: touch`.

**Titles and metadata.** Page titles follow man style: `cat(1) - usr`. Descriptions are one plain sentence. Social previews use the static terminal card.

---

## Keyboard

The site should be fully usable without a mouse. Single-character shortcuts are active only when no text input has focus. A visible `?` opens a help panel listing every shortcut, and the help panel includes a control to turn single-key shortcuts off (needed for accessibility compliance with WCAG 2.1.4 Character Key Shortcuts).

| Key          | Action                                            |
| ------------ | ------------------------------------------------- |
| `/`          | open search                                       |
| `?`          | show shortcuts                                    |
| `Esc`        | close search or help, or leave the terminal input |
| `j` / `k`    | scroll down and up on docs pages                  |
| `g` then `g` | jump to top                                       |
| `G`          | jump to bottom                                    |
| `t`          | cycle theme                                       |

Inside the terminal input, shortcuts do not apply, and normal typing, Up, Down, Tab, `Ctrl+L` and `Ctrl+C` work as described above.

---

## Motion

- Non-user-triggered motion is limited to **one moment**: on first visit in a session, the hero command is typed out once and its response appears. It is cosmetic only. The content is already in the HTML, the typing is skippable with any key or click, and it is never repeated on later pages.
- The cursor blink is the only other automatic motion, and it stops under `prefers-reduced-motion`.
- No scroll reveals, no fade-and-slide entrances, no hover lifts, no parallax, no animated gradients, no boot-sequence screens that delay content, no typewriter effect on prose.
- Motion that answers an action is fine and should be instant: the text of a command appearing as it is typed, output appearing after Enter, `[copy]` becoming `[copied]`.

---

## Voice and copy

Words are design material. Each line does one job.

- Plain, specific, active voice, sentence case. Say what a thing is or does. Do not sell it.
- Command names, flags and code appear exactly as typed, in lowercase.
- A call to action says what happens: `copy install command`, not `Get started`. Do not append arrow glyphs to links or buttons.
- Errors state what happened and how to fix it, in the library's voice. They do not apologise.
- Empty states invite an action: `no history yet. try: cat /users`.
- Humor lives in the command names and the few documented easter eggs. Product copy, docs and error text stay straight.
- Do not write meta strings joined with middle dots, labels shaped like `WORD - fragment`, or tracked-out all-caps eyebrows above headings.
- The same action keeps the same name everywhere. If the button says `copy`, the confirmation says `copied`.

---

## Accessibility (non-negotiable)

A terminal look must not become a terminal-only audience.

- **Semantics first.** Real `h1` to `h6`, `nav`, `main`, lists, tables and `button` elements. The prompt-styled headings are real headings. The ASCII wordmark is `aria-hidden` and the real `h1` carries the name.
- **The live terminal** is an accessible widget: the input has a visible or programmatic label, and the output region is `role="log"` with polite announcements. The typed-out intro animation is hidden from assistive technology, and the final text is what is exposed. Output is not announced character by character.
- **No keyboard trap.** `Esc` blurs the terminal input. Tab completes only when it has something to complete and otherwise moves focus to the next control. State this in the help panel.
- **Focus is always visible** (2px outline in the cursor color plus inverse video where applicable).
- **Contrast:** text 4.5:1 or better, non-text UI 3:1 or better, in every theme including the retro ones.
- **Color is never the sole signal**, as above.
- **Reduced motion** respected everywhere, with no blink and no typing animation.
- **Zoom and reflow:** usable at 200 percent text zoom and at 320 CSS pixels wide with no horizontal scrolling of the page. Wide content (code, tables) scrolls inside its own container.
- **Selection and copy** always work. Never disable text selection. Prompts and line numbers are excluded from copy.
- **No-JS and crawlers:** all landing and docs content is server-rendered. With JavaScript off, the terminal shows a static transcript of the example session and everything else reads normally.
- **Theme:** respects `prefers-color-scheme` on first load, then the explicit `theme` choice (persisted) wins.
- Decorative characters (box-drawing, ASCII banner) are `aria-hidden`.

---

## Responsive behaviour

- The grid reflows by changing the number of columns available, not by shrinking the font.
- On phones: single column, status line collapses to name and version, docs listing becomes a collapsible block, indentation shrinks, the terminal's suggestion chips become the primary way to interact, and the input sets sensible mobile attributes (no autocorrect or auto-capitalisation, `inputmode` appropriate for commands).
- Test at 320, 390, 768, 1024 and 1440 CSS pixels wide, in light and dark.

---

## Performance and SEO

- Server-render everything. Client JavaScript exists only for the terminal, search, theme and language switch, and shortcuts. Keep the client bundle small and track it in CI.
- Do not bring in a full terminal emulator library for the hero. The terminal is a purpose-built component over the real USR library.
- Self-host and subset the font, preload it, and metric-match the fallback so the character grid never shifts. Include any box-drawing glyphs actually used in the subset.
- No third-party scripts, trackers or embeds.
- Target good Core Web Vitals on a mid-range phone. Treat regressions as bugs.
- Every page has a unique title, a one-sentence description, a canonical URL, and valid headings. Provide a sitemap and a readable `robots` file.

---

## Engineering conventions

- Next.js App Router, TypeScript in strict mode. Docs pages are server components. Only the interactive pieces are client components.
- Design tokens are CSS custom properties named by ANSI slot (for example `--ansi-red`, `--ansi-dim`) with semantic aliases on top (`--status-ok`, `--status-error`, `--flag`, `--path`). Components consume the aliases, never raw hex values.
- Themes are a set of token overrides. Adding a theme never requires touching a component.
- Keep CSS selector specificity flat and predictable (class-based, one level). Do not let element selectors and component classes fight each other, especially for spacing between sections. If a utility framework is used, configure it with only the tokens above so off-palette values are impossible.
- No new dependency without a reason written in the commit message. Prefer the platform.
- No `dangerouslySetInnerHTML` for anything derived from user input. Terminal output is escaped text.
- Content that mirrors the library (commands, flags, error codes, version, package name) is imported from the shared source, never retyped.

---

## Testing and definition of done

A web change is done when all of these hold:

- It looks right in `night` and `paper`, at the five breakpoints, and the retro themes still work.
- Automated accessibility checks pass, and the keyboard flow was tested by hand: search, shortcuts, terminal in and out, listing navigation.
- Visual regression screenshots are updated deliberately, not by accident.
- The REPL's command parsing has unit tests: quoting, flags, pipes, unknown commands, and hostile input (HTML, script tags, very long lines, control characters).
- Every code example on the site is type-checked or run in CI.
- No off-palette color, no border radius, no shadow, no transition, no image, no emoji slipped in.
- It was committed and pushed in a small, well-named commit, following the root git workflow, with a quick local run of lint, types and tests first, since pushes to the main branch can trigger a release.

---

## Anti-patterns (do not do these)

- A dark page with green text on black and a scanline overlay as the default. Phosphor is an opt-in theme, not the identity.
- Fake macOS window chrome with traffic-light dots.
- Centered hero text over a gradient, followed by a three-card feature row.
- Identical rounded cards, soft grey shadows, gradient washes.
- A tracked-out all-caps label above every heading, or numbered `01 / 02 / 03` markers for content that is not a sequence.
- Typewriter animation on body text, boot screens that delay the content, scroll-triggered reveals.
- Emoji, stock images, icon libraries.
- A heavy terminal-emulator dependency for a demo.
- Decoration that cannot be selected, copied or read aloud.
- Using a color without the matching text label.
- Retyping the package name, version, a command table or an example by hand.

---

## Decisions that belong to the owner

Ask before deciding these, or follow what the owner has already chosen.

- The final typeface (Commit Mono is proposed).
- The final package name (`usr` or `lsr`), which changes the prompt hostname, the install lines and every example.
- The exact hero wording.
- Whether the retro themes ship at launch.
- Where the site is hosted.
- Whether single-key shortcuts ship enabled by default.
