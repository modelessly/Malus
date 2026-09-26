import type { PageExtractionResult } from "../model";

// This function is deliberately self-contained: Chrome serializes it into the active tab.
export function extractWebPage(): PageExtractionResult {
  if (!/^https?:$/.test(window.location.protocol)) {
    return {
      ok: false,
      reason: "unsupported",
      message: "Open a normal web page to save it.",
    };
  }

  const normalize = (value: string | null | undefined): string =>
    (value ?? "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const metaContent = (selectors: string[]): string => {
    for (const selector of selectors) {
      const value = normalize(
        document.querySelector<HTMLMetaElement>(selector)?.content,
      );
      if (value) return value;
    }
    return "";
  };

  const textFrom = (selectors: string[]): string => {
    for (const selector of selectors) {
      for (const element of document.querySelectorAll(selector)) {
        const value = normalize(element.textContent);
        if (value) return value;
      }
    }
    return "";
  };

  const canonicalHref =
    document.querySelector<HTMLLinkElement>("link[rel='canonical']")?.href ||
    metaContent(["meta[property='og:url']"]);
  let source = `${window.location.origin}${window.location.pathname}${window.location.search}`;
  try {
    const canonical = new URL(canonicalHref, window.location.href);
    if (/^https?:$/.test(canonical.protocol)) source = canonical.href;
  } catch {
    // Keep the visible page URL when no valid canonical URL exists.
  }

  const title =
    metaContent(["meta[property='og:title']", "meta[name='twitter:title']"]) ||
    textFrom(["article h1", "main h1", "[role='main'] h1", "h1"]) ||
    normalize(document.title);

  if (!title) {
    return {
      ok: false,
      reason: "extraction_failed",
      message: "Malus could not find a title for this page.",
    };
  }

  const noiseSelector = [
    "script",
    "style",
    "noscript",
    "template",
    "iframe",
    "canvas",
    "svg",
    "nav",
    "footer",
    "aside",
    "form",
    "button",
    "input",
    "select",
    "textarea",
    "dialog",
    "[hidden]",
    "[aria-hidden='true']",
    "[role='navigation']",
    "[role='dialog']",
    "[role='banner']",
    "[role='contentinfo']",
    "[class*='cookie' i]",
    "[class*='consent' i]",
    "[class*='advert' i]",
    "[class*='recommend' i]",
    "[class*='related' i]",
    "[class*='social-share' i]",
    "[class*='newsletter' i]",
  ].join(",");

  const candidateSelectors = [
    "[itemprop='articleBody']",
    "article",
    "main",
    "[role='main']",
    ".markdown-body",
    ".post-content",
    ".entry-content",
    ".article-content",
    "#content",
  ];

  const candidates = Array.from(
    new Set(
      candidateSelectors.flatMap((selector) =>
        Array.from(document.querySelectorAll(selector)),
      ),
    ),
  ).filter((element) => !element.closest("nav, footer, aside"));

  const score = (element: Element): number => {
    const clone = element.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(noiseSelector).forEach((node) => node.remove());
    const textLength = normalize(clone.textContent).length;
    const linkLength = Array.from(clone.querySelectorAll("a")).reduce(
      (total, link) => total + normalize(link.textContent).length,
      0,
    );
    const structuralBonus =
      clone.querySelectorAll("p, li, pre, table, blockquote").length * 35;
    return textLength - linkLength * 0.8 + structuralBonus;
  };

  let contentRoot = candidates.sort(
    (left, right) => score(right) - score(left),
  )[0];
  if (!contentRoot || score(contentRoot) < 120) contentRoot = document.body;

  const clone = contentRoot.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(noiseSelector).forEach((element) => element.remove());

  const allowed = new Set([
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "P",
    "DIV",
    "SECTION",
    "ARTICLE",
    "UL",
    "OL",
    "LI",
    "STRONG",
    "B",
    "EM",
    "I",
    "A",
    "BR",
    "BLOCKQUOTE",
    "PRE",
    "CODE",
    "TABLE",
    "THEAD",
    "TBODY",
    "TFOOT",
    "TR",
    "TH",
    "TD",
    "IMG",
    "FIGURE",
    "FIGCAPTION",
    "HR",
    "DETAILS",
    "SUMMARY",
    "DL",
    "DT",
    "DD",
    "SUP",
    "SUB",
  ]);

  Array.from(clone.querySelectorAll("*")).forEach((element) => {
    if (!allowed.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }

    const keptAttributes = new Set<string>();
    if (element.tagName === "A") keptAttributes.add("href");
    if (element.tagName === "IMG") {
      keptAttributes.add("src");
      keptAttributes.add("alt");
      keptAttributes.add("title");
    }
    if (element.tagName === "TH" || element.tagName === "TD") {
      keptAttributes.add("colspan");
      keptAttributes.add("rowspan");
    }
    Array.from(element.attributes).forEach((attribute) => {
      if (!keptAttributes.has(attribute.name))
        element.removeAttribute(attribute.name);
    });

    if (element.tagName === "A" || element.tagName === "IMG") {
      const attribute = element.tagName === "A" ? "href" : "src";
      try {
        const url = new URL(
          element.getAttribute(attribute) ?? "",
          window.location.href,
        );
        if (["http:", "https:"].includes(url.protocol))
          element.setAttribute(attribute, url.href);
        else element.removeAttribute(attribute);
      } catch {
        element.removeAttribute(attribute);
      }
    }
  });

  const firstHeading = clone.querySelector("h1");
  if (firstHeading && normalize(firstHeading.textContent) === title)
    firstHeading.remove();

  const contentText = normalize(clone.textContent);
  if (contentText.length < 80) {
    return {
      ok: false,
      reason: "extraction_failed",
      message:
        "Malus could not find enough readable content on this page. It may use a canvas, embedded document, or content that has not loaded yet.",
    };
  }

  let hostname = window.location.hostname.replace(/^www\./, "");
  try {
    hostname = new URL(source).hostname.replace(/^www\./, "");
  } catch {
    // The current hostname is already a safe fallback.
  }

  return {
    ok: true,
    page: {
      title,
      siteName:
        metaContent(["meta[property='og:site_name']"]) || hostname || null,
      author:
        metaContent([
          "meta[name='author']",
          "meta[property='article:author']",
        ]) ||
        textFrom(["[rel='author']", "[itemprop='author']"]) ||
        null,
      published:
        metaContent([
          "meta[property='article:published_time']",
          "meta[name='date']",
          "meta[itemprop='datePublished']",
        ]) || null,
      language: normalize(document.documentElement.lang) || null,
      contentHtml: clone.innerHTML,
      source,
    },
  };
}
