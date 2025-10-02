import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import type React from "react";
import CompositionStatusControl from "@/components/common/stage/composition-status-control";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Convert a limited subset of Markdown to sanitized HTML.
 * Supports headings, paragraphs, bold, italics, inline code, code blocks, links, lists, and blockquotes.
 */
function renderMarkdownToHtml(markdown: string): string {
  const escapeHtml = (input: string): string =>
    input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const lines: string[] = markdown.replace(/\r\n?/g, "\n").split("\n");
  const htmlParts: string[] = [];
  let inCodeBlock = false;
  let codeBlockBuffer: string[] = [];
  let listBuffer: string[] = [];
  let inList = false;

  const flushList = (): void => {
    if (inList && listBuffer.length > 0) {
      htmlParts.push(`<ul>${listBuffer.join("")}</ul>`);
      listBuffer = [];
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine;

    // Fenced code blocks ```
    if (line.trim().startsWith("```") && !inCodeBlock) {
      flushList();
      inCodeBlock = true;
      codeBlockBuffer = [];
      continue;
    }
    if (line.trim().startsWith("```") && inCodeBlock) {
      const code = escapeHtml(codeBlockBuffer.join("\n"));
      htmlParts.push(`<pre><code>${code}</code></pre>`);
      inCodeBlock = false;
      codeBlockBuffer = [];
      continue;
    }
    if (inCodeBlock) {
      codeBlockBuffer.push(line);
      continue;
    }

    // Lists (-, *, +)
    if (/^\s*[-*+]\s+/.test(line)) {
      const item = line.replace(/^\s*[-*+]\s+/, "");
      inList = true;
      listBuffer.push(`<li>${inlineMarkdown(item, escapeHtml)}</li>`);
      continue;
    } else if (inList && line.trim() === "") {
      flushList();
      continue;
    } else if (inList && !/^\s*[-*+]\s+/.test(line)) {
      flushList();
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      htmlParts.push(`<h${level}>${inlineMarkdown(content, escapeHtml)}</h${level}>`);
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const content = line.replace(/^>\s?/, "");
      htmlParts.push(`<blockquote>${inlineMarkdown(content, escapeHtml)}</blockquote>`);
      continue;
    }

    // Paragraph or blank
    if (line.trim() === "") {
      htmlParts.push("");
    } else {
      htmlParts.push(`<p>${inlineMarkdown(line, escapeHtml)}</p>`);
    }
  }

  flushList();
  return htmlParts.filter(Boolean).join("\n");
}

function inlineMarkdown(text: string, escapeHtml: (s: string) => string): string {
  let out = escapeHtml(text);
  // Bold **text** or __text__
  out = out.replace(/(\*\*|__)(.*?)\1/g, "<strong>$2</strong>");
  // Italic *text* or _text_
  out = out.replace(/(\*|_)([^*_]+?)\1/g, "<em>$2</em>");
  // Inline code `code`
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Links [text](url)
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+\"([^\"]*)\")?\)/g, (_m: string, t: string, href: string, title?: string) => {
    const safeHref = href.startsWith("/") || href.startsWith("#") || /^https?:\/\//.test(href) ? href : "#";
    const safeTitle = title ? ` title=\"${title.replace(/\"/g, "&quot;")}\"` : "";
    return `<a href=\"${safeHref}\" rel=\"noopener noreferrer\" target=\"_blank\"${safeTitle}>${t}</a>`;
  });
  return out;
}

export default async function Page(props: PageProps): Promise<React.ReactElement> {
  const params = await props.params;
  const id: string = params.id;

  const composition = await prisma.composition.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      // When `content` is added to the schema, include it here and prefer it over description.
    },
  });

  if (!composition) {
    notFound();
  }

  const markdownSource: string = composition.description ?? "";
  const html: string = renderMarkdownToHtml(markdownSource);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">{composition.title}</h1>
        <CompositionStatusControl compositionId={composition.id} compositionTitle={composition.title} />
      </div>
      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </div>
  );
}


