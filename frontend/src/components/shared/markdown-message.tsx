"use client";

/**
 * MarkdownMessage — lightweight inline markdown renderer for AI chat bubbles.
 *
 * Handles the subset the AI actually produces:
 *   # H1   ## H2   ### H3
 *   **bold**   *italic*
 *   - unordered lists    1. ordered lists
 *   `inline code`   ```code blocks```
 *   > blockquotes   ---   [link](url)
 *
 * No external markdown library required.
 */

import { cn } from "@/lib/utils";

// ── Inline parser (bold, italic, code, links) ──────────────────────────────────

function parseInline(text: string): React.ReactNode[] {
  // Regex covers: **bold**, *italic*, `code`, [label](url)
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[(.+?)\]\((.+?)\))/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    // Plain text before this match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const [full, , bold, italic, code, linkLabel, linkHref] = match;

    if (bold) {
      nodes.push(
        <strong
          key={match.index}
          className="font-extrabold text-[var(--dashboard-fg)]"
        >
          {bold}
        </strong>,
      );
    } else if (italic) {
      nodes.push(
        <em key={match.index} className="italic opacity-90">
          {italic}
        </em>,
      );
    } else if (code) {
      nodes.push(
        <code
          key={match.index}
          className="mx-0.5 rounded-md bg-black/10 px-1.5 py-0.5 font-mono text-[11px] font-medium"
        >
          {code}
        </code>,
      );
    } else if (linkLabel && linkHref) {
      nodes.push(
        <a
          key={match.index}
          href={linkHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--dashboard-accent)] underline underline-offset-2 transition-opacity hover:opacity-75"
        >
          {linkLabel}
        </a>,
      );
    } else {
      nodes.push(full);
    }

    lastIndex = match.index + full.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

// ── Block-level renderer ───────────────────────────────────────────────────────

type Block =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "hr" }
  | { type: "blockquote"; text: string }
  | { type: "code_block"; text: string; lang: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Fenced code block
    if (/^```/.test(trimmed)) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: "code_block", text: codeLines.join("\n"), lang });
      i++; // skip closing ```
      continue;
    }

    // Headings
    if (/^### /.test(trimmed)) {
      blocks.push({ type: "h3", text: trimmed.slice(4) });
      i++;
      continue;
    }
    if (/^## /.test(trimmed)) {
      blocks.push({ type: "h2", text: trimmed.slice(3) });
      i++;
      continue;
    }
    if (/^# /.test(trimmed)) {
      blocks.push({ type: "h1", text: trimmed.slice(2) });
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Blockquote
    if (/^> /.test(trimmed)) {
      const text = trimmed.slice(2);
      blocks.push({ type: "blockquote", text });
      i++;
      continue;
    }

    // Unordered list — collect consecutive items
    if (/^[*\-] /.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[*\-] /.test(lines[i].trim())) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Ordered list — collect consecutive items
    if (/^\d+\. /.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\. /, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // Empty line — skip
    if (!trimmed) {
      i++;
      continue;
    }

    // Paragraph — join consecutive non-blank, non-special lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,3} |```|[*\-] |\d+\. |> |---|\*\*\*|___)/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    if (paraLines.length) {
      blocks.push({ type: "p", text: paraLines.join(" ") });
    }
  }

  return blocks;
}

// ── Render blocks ──────────────────────────────────────────────────────────────

function renderBlocks(blocks: Block[]): React.ReactNode {
  return blocks.map((block, idx) => {
    switch (block.type) {
      case "h1":
        return (
          <h1
            key={idx}
            className="mb-2 mt-4 text-[15px] font-extrabold leading-snug tracking-tight text-[var(--dashboard-fg)] first:mt-0"
          >
            {parseInline(block.text)}
          </h1>
        );
      case "h2":
        return (
          <h2
            key={idx}
            className="mb-1.5 mt-3 text-[13px] font-extrabold leading-snug text-[var(--dashboard-fg)] first:mt-0"
          >
            {parseInline(block.text)}
          </h2>
        );
      case "h3":
        return (
          <h3
            key={idx}
            className="mb-1 mt-3 text-[11px] font-extrabold uppercase tracking-widest text-[var(--dashboard-muted)] first:mt-0"
          >
            {parseInline(block.text)}
          </h3>
        );
      case "p":
        return (
          <p key={idx} className="mb-2 leading-relaxed last:mb-0">
            {parseInline(block.text)}
          </p>
        );
      case "hr":
        return <hr key={idx} className="my-3 border-black/10" />;
      case "blockquote":
        return (
          <blockquote
            key={idx}
            className="mb-2 border-l-[3px] border-[var(--dashboard-accent)] pl-3.5 italic text-[var(--dashboard-muted)] last:mb-0"
          >
            {parseInline(block.text)}
          </blockquote>
        );
      case "code_block":
        return (
          <pre
            key={idx}
            className="mb-2 overflow-x-auto rounded-xl bg-black/[0.06] p-3.5 last:mb-0"
          >
            <code className="font-mono text-[11px] leading-relaxed">
              {block.text}
            </code>
          </pre>
        );
      case "ul":
        return (
          <ul key={idx} className="mb-2 ml-1 space-y-1 last:mb-0">
            {block.items.map((item, j) => (
              <li key={j} className="flex items-start gap-2 leading-relaxed">
                <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-[var(--dashboard-accent)] opacity-80" />
                <span>{parseInline(item)}</span>
              </li>
            ))}
          </ul>
        );
      case "ol":
        return (
          <ol key={idx} className="mb-2 ml-1 space-y-1 last:mb-0">
            {block.items.map((item, j) => (
              <li key={j} className="flex items-start gap-2.5 leading-relaxed">
                <span className="mt-px min-w-[18px] shrink-0 text-right text-[11px] font-extrabold tabular-nums text-[var(--dashboard-accent)]">
                  {j + 1}.
                </span>
                <span>{parseInline(item)}</span>
              </li>
            ))}
          </ol>
        );
    }
  });
}

// ── Public component ───────────────────────────────────────────────────────────

type MarkdownMessageProps = {
  content: string;
  className?: string;
};

export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  const blocks = parseBlocks(content);

  return (
    <div className={cn("text-sm leading-6", className)}>
      {renderBlocks(blocks)}
    </div>
  );
}
