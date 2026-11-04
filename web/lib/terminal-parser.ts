export interface PipeSegment {
  stage: string;
  args: string[];
}

export interface ParsedCommandLine {
  raw: string;
  command: string;
  args: string[];
  pipes: PipeSegment[];
}

export function tokenizeArgs(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  const n = input.length;

  while (i < n) {
    while (i < n && /\s/.test(input[i])) i++;
    if (i >= n) break;

    let tok = "";
    while (i < n && !/\s/.test(input[i])) {
      const ch = input[i];
      if (ch === "'" || ch === '"') {
        const quote = ch;
        i++;
        while (i < n && input[i] !== quote) {
          if (input[i] === "\\" && i + 1 < n) {
            tok += input[i + 1];
            i += 2;
          } else {
            tok += input[i];
            i++;
          }
        }
        if (i < n) i++; // skip closing quote
      } else if (ch === "\\" && i + 1 < n) {
        tok += input[i + 1];
        i += 2;
      } else {
        tok += ch;
        i++;
      }
    }
    tokens.push(tok);
  }

  return tokens;
}

export function splitPipes(line: string): string[] {
  const segments: string[] = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      current += ch;
    } else if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      current += ch;
    } else if (ch === "|" && !inSingle && !inDouble) {
      segments.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }

  if (current.trim().length > 0) {
    segments.push(current.trim());
  }

  return segments;
}

export function parseTerminalLine(line: string): ParsedCommandLine {
  const segments = splitPipes(line);
  if (segments.length === 0) {
    return { raw: line, command: "", args: [], pipes: [] };
  }

  const [cmdPart, ...pipeParts] = segments;
  const cmdTokens = tokenizeArgs(cmdPart);
  const command = cmdTokens[0] || "";
  const args = cmdTokens.slice(1);

  const pipes: PipeSegment[] = pipeParts.map((p) => {
    const tokens = tokenizeArgs(p);
    return {
      stage: tokens[0] || "",
      args: tokens.slice(1),
    };
  });

  return {
    raw: line,
    command,
    args,
    pipes,
  };
}
