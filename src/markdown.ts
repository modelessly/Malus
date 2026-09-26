import type { CapturedPage, JobPosting } from "./model";

function cleanText(value: string): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function yamlValue(value: string | null): string {
  if (value === null || cleanText(value) === "") return "null";
  const withoutControlCharacters = Array.from(cleanText(value), (character) =>
    character.charCodeAt(0) < 32 ? " " : character,
  ).join("");
  return JSON.stringify(withoutControlCharacters);
}

function inlineText(value: string): string {
  return cleanText(value).replace(/([\\`*_[\]<>])/g, "\\$1");
}

function safeUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function escapeTableCell(value: string): string {
  return cleanText(value).replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}

export function htmlToMarkdown(html: string, headingOffset = 0): string {
  const document = new DOMParser().parseFromString(html, "text/html");

  const renderChildren = (node: Node, listDepth = 0): string =>
    Array.from(node.childNodes)
      .map((child) => render(child, listDepth))
      .join("");

  const renderTable = (table: Element): string => {
    const rows = Array.from(table.querySelectorAll("tr"))
      .map((row) =>
        Array.from(row.querySelectorAll(":scope > th, :scope > td")).map(
          (cell) => escapeTableCell(renderChildren(cell)),
        ),
      )
      .filter((row) => row.length > 0);
    if (rows.length === 0) return "";

    const width = Math.max(...rows.map((row) => row.length));
    const normalized = rows.map((row) => [
      ...row,
      ...Array.from({ length: width - row.length }, () => ""),
    ]);
    const header = normalized[0] ?? [];
    const body = normalized.slice(1);
    return `\n| ${header.join(" | ")} |\n| ${header.map(() => "---").join(" | ")} |\n${body
      .map((row) => `| ${row.join(" | ")} |`)
      .join("\n")}\n\n`;
  };

  const renderListItem = (
    element: Element,
    depth: number,
    ordered: boolean,
    index: number,
  ): string => {
    const inline = Array.from(element.childNodes)
      .filter(
        (child) =>
          !(
            child instanceof Element &&
            ["ul", "ol"].includes(child.tagName.toLowerCase())
          ),
      )
      .map((child) => render(child, depth))
      .join("");
    const nested = Array.from(element.children)
      .filter((child) => ["ul", "ol"].includes(child.tagName.toLowerCase()))
      .map((child) => render(child, depth + 1))
      .join("");
    const marker = ordered ? `${index + 1}.` : "-";
    return `${"  ".repeat(depth)}${marker} ${cleanText(inline)}\n${nested}`;
  };

  const render = (node: Node, listDepth = 0): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent ?? "")
        .replace(/\u00a0/g, " ")
        .replace(/([\\`*_[\]<>])/g, "\\$1");
    }
    if (!(node instanceof Element)) return "";

    const tag = node.tagName.toLowerCase();
    if (["script", "style", "template", "noscript"].includes(tag)) return "";
    if (tag === "table") return renderTable(node);
    if (tag === "img") {
      const source = safeUrl(node.getAttribute("src") ?? "");
      if (!source) return "";
      const alt = cleanText(node.getAttribute("alt") ?? "").replace(
        /\[|\]/g,
        "",
      );
      return `![${alt}](${source})`;
    }
    if (tag === "pre") {
      const code = (node.textContent ?? "").replace(/^\n|\n$/g, "");
      const language =
        node.querySelector("code")?.className.match(/language-([\w-]+)/)?.[1] ??
        "";
      return `\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
    }

    const content = renderChildren(node, listDepth);
    if (/^h[1-6]$/.test(tag)) {
      const level = Math.min(Number(tag[1]) + headingOffset, 6);
      return `\n${"#".repeat(level)} ${cleanText(content)}\n\n`;
    }
    if (
      ["p", "div", "section", "article", "figure", "figcaption"].includes(tag)
    )
      return `\n${cleanText(content)}\n\n`;
    if (tag === "br") return "\n";
    if (tag === "hr") return "\n---\n\n";
    if (tag === "strong" || tag === "b") return `**${cleanText(content)}**`;
    if (tag === "em" || tag === "i") return `*${cleanText(content)}*`;
    if (tag === "code") return `\`${cleanText(node.textContent ?? "")}\``;
    if (tag === "a") {
      const href = safeUrl(node.getAttribute("href") ?? "");
      const label = cleanText(content) || href || "";
      return href ? `[${label}](${href})` : label;
    }
    if (tag === "blockquote") {
      return `\n${cleanText(content)
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n")}\n\n`;
    }
    if (tag === "ul" || tag === "ol") {
      const ordered = tag === "ol";
      const items = Array.from(node.children)
        .filter((child) => child.tagName.toLowerCase() === "li")
        .map((child, index) => renderListItem(child, listDepth, ordered, index))
        .join("");
      return `\n${items}\n`;
    }
    if (tag === "li") return content;
    if (tag === "dt") return `\n**${cleanText(content)}**\n`;
    if (tag === "dd") return `${cleanText(content)}\n\n`;
    return content;
  };

  return render(document.body)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function generateFrontMatter(job: JobPosting): string {
  return [
    "---",
    `title: ${yamlValue(job.title)}`,
    `company: ${yamlValue(job.company)}`,
    `location: ${yamlValue(job.location)}`,
    `salary: ${yamlValue(job.salary)}`,
    `workplace_type: ${yamlValue(job.workplaceType)}`,
    `employment_type: ${yamlValue(job.employmentType)}`,
    `source: ${yamlValue(job.source)}`,
    `captured: ${yamlValue(job.captured)}`,
    "---",
  ].join("\n");
}

export function generateMarkdown(job: JobPosting): string {
  const description = htmlToMarkdown(job.descriptionHtml, 2);
  return `${generateFrontMatter(job)}\n\n# ${inlineText(job.title)}\n\n## ${inlineText(job.company)}\n\n${description}\n`;
}

export function generatePageFrontMatter(page: CapturedPage): string {
  return [
    "---",
    `title: ${yamlValue(page.title)}`,
    `site_name: ${yamlValue(page.siteName)}`,
    `author: ${yamlValue(page.author)}`,
    `published: ${yamlValue(page.published)}`,
    `language: ${yamlValue(page.language)}`,
    `source: ${yamlValue(page.source)}`,
    `captured: ${yamlValue(page.captured)}`,
    "---",
  ].join("\n");
}

export function generatePageMarkdown(page: CapturedPage): string {
  const content = htmlToMarkdown(page.contentHtml);
  return `${generatePageFrontMatter(page)}\n\n# ${inlineText(page.title)}\n\n${content}\n`;
}

function slugFilename(value: string, fallback: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "");
  return `${slug || fallback}.md`;
}

export function sanitizeFilename(company: string, title: string): string {
  return slugFilename(`${company}-${title}`, "job");
}

export function sanitizePageFilename(title: string): string {
  return slugFilename(title, "page");
}
