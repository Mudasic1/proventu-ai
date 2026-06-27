"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import type { Components } from "react-markdown";

type ChatMarkdownProps = {
  content: string;
};

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-3 overflow-hidden rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-elevated)] backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-[var(--dashboard-border)] px-4 py-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--dashboard-muted)]">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--dashboard-muted)] transition-all hover:bg-[var(--dashboard-hover)] hover:text-[var(--dashboard-fg)]"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-[var(--dashboard-accent)]" />
              <span className="text-[var(--dashboard-accent)]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-4">
        <code className="font-mono text-[13px] leading-relaxed text-[var(--dashboard-fg)]">
          {code}
        </code>
      </div>
    </div>
  );
}

const components: Partial<Components> = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const codeString = String(children).replace(/\n$/, "");
    if (match) {
      return <CodeBlock language={match[1]} code={codeString} />;
    }
    return (
      <code
        className="mx-0.5 rounded-md bg-[var(--dashboard-control)] px-1.5 py-0.5 font-mono text-[12px] font-medium text-[var(--dashboard-fg)]"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre({ children }) {
    return <>{children}</>;
  },
  p({ children }) {
    return <p className="mb-3 leading-relaxed last:mb-0">{children}</p>;
  },
  ul({ children }) {
    return <ul className="mb-3 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="mb-3 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>;
  },
  h1({ children }) {
    return <h1 className="mb-3 mt-5 text-lg font-bold first:mt-0">{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="mb-2 mt-4 text-base font-bold first:mt-0">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="mb-2 mt-3 text-sm font-bold first:mt-0">{children}</h3>;
  },
  blockquote({ children }) {
    return (
      <blockquote className="mb-3 border-l-2 border-[var(--dashboard-border)] pl-4 italic text-[var(--dashboard-muted)] last:mb-0">
        {children}
      </blockquote>
    );
  },
  a({ children, href }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--dashboard-accent)] underline underline-offset-2 transition-colors hover:text-[var(--dashboard-accent-hover)]"
      >
        {children}
      </a>
    );
  },
  hr() {
    return <hr className="my-4 border-[var(--dashboard-border)]" />;
  },
  table({ children }) {
    return (
      <div className="mb-3 overflow-x-auto last:mb-0">
        <table className="min-w-full border-collapse text-sm">{children}</table>
      </div>
    );
  },
  th({ children }) {
    return (
      <th className="border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] px-3 py-2 text-left font-semibold">
        {children}
      </th>
    );
  },
  td({ children }) {
    return <td className="border border-[var(--dashboard-border)] px-3 py-2">{children}</td>;
  },
};

export function ChatMarkdown({ content }: ChatMarkdownProps) {
  return (
    <div className="prose prose-invert max-w-none text-sm leading-relaxed text-[var(--dashboard-fg)]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
