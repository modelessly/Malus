import { describe, expect, it } from "vitest";
import {
  generateFrontMatter,
  generateMarkdown,
  generatePageMarkdown,
  sanitizeFilename,
  sanitizePageFilename,
} from "../src/markdown";
import type { CapturedPage, JobPosting } from "../src/model";

const job: JobPosting = {
  title: 'Senior "Product" Designer',
  company: "Exämple Co",
  location: "Stockholm, Sweden",
  salary: null,
  workplaceType: "Hybrid",
  employmentType: "Full-time",
  source: "https://www.linkedin.com/jobs/view/123456789",
  captured: "2026-08-21",
  descriptionHtml:
    "<h2>About the role</h2><p>Build <strong>useful</strong> things.</p><ul><li>Lead discovery</li></ul>",
};

const page: CapturedPage = {
  title: "A Useful Reference",
  siteName: "Example Docs",
  author: "Alex Rivera",
  published: "2026-09-20",
  language: "en",
  source: "https://example.com/reference",
  captured: "2026-09-26",
  contentHtml: `
    <h2>Usage</h2>
    <p>Run <code>capture()</code> and review the result.</p>
    <blockquote>Keep the useful content.</blockquote>
    <pre><code class="language-ts">const page = capture();</code></pre>
    <table><tr><th>Field</th><th>Value</th></tr><tr><td>format</td><td>Markdown</td></tr></table>
    <img src="https://example.com/diagram.png" alt="Capture flow">
  `,
};

describe("sanitizeFilename", () => {
  it("creates a safe company-title filename", () => {
    expect(
      sanitizeFilename("Exämple / Co.", "Senior: Product Designer?!"),
    ).toBe("example-co-senior-product-designer.md");
  });

  it("includes the Lenovo role title after the company name", () => {
    expect(
      sanitizeFilename(
        "Lenovo",
        "Executive Design Director, Innovation Experience Design",
      ),
    ).toBe("lenovo-executive-design-director-innovation-experience-design.md");
  });

  it("falls back when the input has no usable characters", () => {
    expect(sanitizeFilename("公司", "設計師")).toBe("job.md");
  });

  it("creates a safe filename for a general page", () => {
    expect(sanitizePageFilename("A Useful Reference | Docs")).toBe(
      "a-useful-reference-docs.md",
    );
    expect(sanitizePageFilename("資料")).toBe("page.md");
  });
});

describe("front matter", () => {
  it("quotes YAML values and emits null for missing optional fields", () => {
    const frontMatter = generateFrontMatter(job);
    expect(frontMatter).toContain('title: "Senior \\"Product\\" Designer"');
    expect(frontMatter).toContain("salary: null");
    expect(frontMatter).toContain('captured: "2026-08-21"');
  });
});

describe("generateMarkdown", () => {
  it("renders headings, emphasis, and lists", () => {
    const markdown = generateMarkdown(job);
    expect(markdown).toContain('# Senior "Product" Designer');
    expect(markdown).toContain("#### About the role");
    expect(markdown).toContain("Build **useful** things.");
    expect(markdown).toContain("- Lead discovery");
  });

  it("handles every optional field being missing", () => {
    const markdown = generateMarkdown({
      ...job,
      salary: null,
      workplaceType: null,
      employmentType: null,
    });
    expect(markdown.match(/: null/g)).toHaveLength(3);
  });
});

describe("generatePageMarkdown", () => {
  it("renders page metadata and rich semantic content", () => {
    const markdown = generatePageMarkdown(page);
    expect(markdown).toContain('site_name: "Example Docs"');
    expect(markdown).toContain('author: "Alex Rivera"');
    expect(markdown).toContain("# A Useful Reference");
    expect(markdown).toContain("## Usage");
    expect(markdown).toContain("`capture()`");
    expect(markdown).toContain("> Keep the useful content.");
    expect(markdown).toContain("```ts\nconst page = capture();\n```");
    expect(markdown).toContain("| Field | Value |");
    expect(markdown).toContain("| format | Markdown |");
    expect(markdown).toContain(
      "![Capture flow](https://example.com/diagram.png)",
    );
  });
});
