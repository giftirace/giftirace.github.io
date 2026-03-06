export interface TocItem {
  id: string;
  level: number;
  text: string;
}

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const stripInlineMarkdown = (text: string): string =>
  text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .trim();

const slugifyHeading = (text: string): string => {
  const clean = stripInlineMarkdown(text)
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\- ]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return clean || "heading";
};

const renderInline = (text: string): string => {
  const escaped = escapeHtml(text);
  return escaped
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer">$1</a>'
    )
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
};

const splitTableRow = (line: string): string[] => {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
};

const isTableDividerCell = (cell: string): boolean => /^:?-{3,}:?$/.test(cell.trim());
const isLikelyTableRow = (line: string): boolean => line.includes("|");

const getCellAlign = (cell: string): "left" | "right" | "center" | null => {
  const value = cell.trim();
  if (!isTableDividerCell(value)) return null;
  if (value.startsWith(":") && value.endsWith(":")) return "center";
  if (value.endsWith(":")) return "right";
  if (value.startsWith(":")) return "left";
  return null;
};

export const extractMarkdownToc = (markdown: string): TocItem[] => {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const idCount = new Map<string, number>();
  const toc: TocItem[] = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (!heading) return;
    const level = heading[1].length;
    const text = stripInlineMarkdown(heading[2]);
    const base = slugifyHeading(text);
    const count = idCount.get(base) ?? 0;
    idCount.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count + 1}`;
    toc.push({ id, level, text });
  });

  return toc;
};

export const renderMarkdown = (markdown: string): string => {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[] = [];
  const toc = extractMarkdownToc(markdown);
  let headingIndex = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    const codeStart = trimmed.match(/^```([a-zA-Z0-9_-]+)?$/);
    if (codeStart) {
      i += 1;
      const codeLines: string[] = [];
      while (i < lines.length && !(lines[i] ?? "").trim().startsWith("```")) {
        codeLines.push(lines[i] ?? "");
        i += 1;
      }
      i += 1;
      const lang = codeStart[1] ? ` class="language-${escapeHtml(codeStart[1])}"` : "";
      blocks.push(`<pre><code${lang}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const tocItem = toc[headingIndex];
      headingIndex += 1;
      const idAttr = tocItem ? ` id="${tocItem.id}"` : "";
      blocks.push(`<h${level}${idAttr}>${renderInline(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }

    if (
      i + 1 < lines.length &&
      isLikelyTableRow(trimmed) &&
      isLikelyTableRow((lines[i + 1] ?? "").trim())
    ) {
      const headerCells = splitTableRow(trimmed);
      const dividerCells = splitTableRow((lines[i + 1] ?? "").trim());

      if (
        headerCells.length > 0 &&
        headerCells.length === dividerCells.length &&
        dividerCells.every((cell) => isTableDividerCell(cell))
      ) {
        const aligns = dividerCells.map((cell) => getCellAlign(cell));
        const head = `<thead><tr>${headerCells
          .map((cell, index) => {
            const align = aligns[index];
            const style = align ? ` style="text-align:${align}"` : "";
            return `<th${style}>${renderInline(cell)}</th>`;
          })
          .join("")}</tr></thead>`;

        i += 2;
        const bodyRows: string[] = [];
        while (i < lines.length && isLikelyTableRow((lines[i] ?? "").trim())) {
          const rowCells = splitTableRow((lines[i] ?? "").trim());
          if (rowCells.length !== headerCells.length) break;

          bodyRows.push(
            `<tr>${rowCells
              .map((cell, index) => {
                const align = aligns[index];
                const style = align ? ` style="text-align:${align}"` : "";
                return `<td${style}>${renderInline(cell)}</td>`;
              })
              .join("")}</tr>`
          );
          i += 1;
        }

        const body = bodyRows.length > 0 ? `<tbody>${bodyRows.join("")}</tbody>` : "";
        blocks.push(`<table>${head}${body}</table>`);
        continue;
      }
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      const list: string[] = [];
      while (i < lines.length && /^[-*+]\s+/.test((lines[i] ?? "").trim())) {
        const item = (lines[i] ?? "").trim().replace(/^[-*+]\s+/, "");
        list.push(`<li>${renderInline(item)}</li>`);
        i += 1;
      }
      blocks.push(`<ul>${list.join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const list: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test((lines[i] ?? "").trim())) {
        const item = (lines[i] ?? "").trim().replace(/^\d+\.\s+/, "");
        list.push(`<li>${renderInline(item)}</li>`);
        i += 1;
      }
      blocks.push(`<ol>${list.join("")}</ol>`);
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s?/.test((lines[i] ?? "").trim())) {
        quoteLines.push((lines[i] ?? "").trim().replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push(`<blockquote>${renderInline(quoteLines.join(" "))}</blockquote>`);
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      (lines[i] ?? "").trim() &&
      !/^(#{1,6})\s+/.test((lines[i] ?? "").trim()) &&
      !/^```/.test((lines[i] ?? "").trim()) &&
      !/^[-*+]\s+/.test((lines[i] ?? "").trim()) &&
      !/^\d+\.\s+/.test((lines[i] ?? "").trim()) &&
      !/^>\s?/.test((lines[i] ?? "").trim())
    ) {
      paragraphLines.push((lines[i] ?? "").trim());
      i += 1;
    }
    blocks.push(`<p>${renderInline(paragraphLines.join(" "))}</p>`);
  }

  return blocks.join("");
};

