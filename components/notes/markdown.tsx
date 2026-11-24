import Link from "next/link";
import type { ReactNode } from "react";

// A tiny, safe Markdown renderer for note previews. It builds React elements only (never raw HTML), so any
// "<script>" a student types is shown as text. Supported, on purpose nothing more:
//   # Heading  ·  ## Heading  ·  "- " bullets  ·  paragraphs (single newlines become line breaks)
//   **bold**  ·  *italic*  ·  `code`  ·  [[Note title]] (highlighted; a link when the title matches one of the student's notes)

export type ResolveNote = (title: string) => string | null; // note title → href, or null when unknown

type Block =
  | { type: "h1" | "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "p"; lines: string[] };

function toBlocks(md: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flush = () => {
    if (paragraph.length > 0) blocks.push({ type: "p", lines: paragraph });
    if (list.length > 0) blocks.push({ type: "ul", items: list });
    paragraph = [];
    list = [];
  };

  for (const raw of md.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    const heading = /^(#{1,2})\s+(.+)$/.exec(line.trimStart());
    const bullet = /^\s*[-*]\s+(.+)$/.exec(line);

    if (line.trim() === "") {
      flush();
    } else if (heading) {
      flush();
      blocks.push({ type: heading[1] === "#" ? "h1" : "h2", text: heading[2] ?? "" });
    } else if (bullet) {
      if (paragraph.length > 0) flush();
      list.push(bullet[1] ?? "");
    } else {
      if (list.length > 0) flush();
      paragraph.push(line.trim());
    }
  }
  flush();
  return blocks;
}

// `code` comes first so its contents are shown as typed (no bold/italic/links inside code).
const INLINE = /`([^`\n]+)`|\[\[([^[\]\n]+)\]\]|\*\*([^*\n]+)\*\*|\*([^*\s][^*\n]*?)\*/g;

function renderInline(text: string, resolve: ResolveNote | undefined, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const match of text.matchAll(INLINE)) {
    const start = match.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    const key = `${keyPrefix}-${i++}`;
    const [, code, linkTitle, bold, italic] = match;
    if (code !== undefined) {
      out.push(
        <code key={key} className="rounded-xs bg-app px-1 font-mono">
          {code}
        </code>,
      );
    } else if (linkTitle !== undefined) {
      const title = linkTitle.trim();
      const href = resolve?.(title) ?? null;
      out.push(
        href ? (
          <Link key={key} href={href} className="ilink">
            {title}
          </Link>
        ) : (
          <span key={key} className="ilink">
            {title}
          </span>
        ),
      );
    } else if (bold !== undefined) {
      out.push(<b key={key}>{renderInline(bold, resolve, key)}</b>);
    } else if (italic !== undefined) {
      out.push(<em key={key}>{renderInline(italic, resolve, key)}</em>);
    }
    last = start + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function MarkdownPreview({ markdown, resolve }: { markdown: string; resolve?: ResolveNote }) {
  const blocks = toBlocks(markdown);
  if (blocks.length === 0) {
    return <p className="text-muted">Nothing to preview yet.</p>;
  }
  return (
    <>
      {blocks.map((block, b) => {
        const key = `b${b}`;
        switch (block.type) {
          case "h1":
            return (
              <h2 key={key} className="text-note-h1 font-black tracking-title">
                {renderInline(block.text, resolve, key)}
              </h2>
            );
          case "h2":
            return (
              <h3 key={key} className="text-note-h2 font-extrabold tracking-snug">
                {renderInline(block.text, resolve, key)}
              </h3>
            );
          case "ul":
            return (
              <ul key={key} className="m-0 grid list-disc gap-1 pl-4.5">
                {block.items.map((item, n) => (
                  <li key={`${key}-${n}`}>{renderInline(item, resolve, `${key}-${n}`)}</li>
                ))}
              </ul>
            );
          case "p":
            return (
              <p key={key}>
                {block.lines.map((line, n) => (
                  <span key={`${key}-${n}`}>
                    {n > 0 ? <br /> : null}
                    {renderInline(line, resolve, `${key}-${n}`)}
                  </span>
                ))}
              </p>
            );
        }
      })}
    </>
  );
}
