import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { extractWebPage } from "../src/extractors/page";

const fixture = (name: string) =>
  readFileSync(join(process.cwd(), "tests", "fixtures", name), "utf8");

describe("general webpage extraction", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/current/page?tracking=1");
    document.documentElement.lang = "en";
  });

  it("extracts an article with metadata and removes page chrome", () => {
    document.documentElement.innerHTML = fixture("article-page.html");
    const result = extractWebPage();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.page).toMatchObject({
      title: "Designing Calm Tools",
      siteName: "Field Notes",
      author: "Mara Chen",
      published: "2026-09-20",
      language: "en",
      source: "https://www.linkedin.com/stories/designing-calm-tools",
    });
    expect(result.page.contentHtml).toContain("Useful principles");
    expect(result.page.contentHtml).toContain(
      'src="https://www.linkedin.com/images/calm-tool.png"',
    );
    expect(result.page.contentHtml).toContain(
      'href="https://www.linkedin.com/handbook"',
    );
    expect(result.page.contentHtml).not.toMatch(
      /Designing Calm Tools<\/h1>|Accept cookies|Subscribe|Copyright/,
    );
  });

  it("preserves code, tables, and links on documentation pages", () => {
    window.history.replaceState({}, "", "/reference/capture/");
    document.documentElement.innerHTML = fixture("documentation-page.html");
    const result = extractWebPage();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.page.title).toBe("Capture API");
    expect(result.page.contentHtml).toContain("<pre>");
    expect(result.page.contentHtml).toContain("<table>");
    expect(result.page.contentHtml).toContain(
      'href="https://www.linkedin.com/reference/guides/clean-content"',
    );
    expect(result.page.contentHtml).not.toContain("On this page");
  });

  it("falls back to the rendered body for an unstructured page", () => {
    document.documentElement.innerHTML = fixture("general-page.html");
    const result = extractWebPage();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.page.title).toBe("Community Garden Notes");
    expect(result.page.contentHtml).toContain("Saturday's work session");
    expect(result.page.contentHtml).toContain("Finish the west bed");
  });

  it("reports a clear limitation for canvas-only pages", () => {
    document.documentElement.innerHTML = fixture("canvas-page.html");
    const result = extractWebPage();

    expect(result).toMatchObject({
      ok: false,
      reason: "extraction_failed",
    });
    if (result.ok) return;
    expect(result.message).toMatch(/canvas|content that has not loaded/i);
  });
});
