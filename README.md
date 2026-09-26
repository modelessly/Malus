# Malus

Malus is a small, local-first Chrome extension that saves the useful content of the page you are viewing as a clean Markdown file. Open a normal webpage, click the toolbar icon, and choose **Save as Markdown**. Everything is processed inside the browser and downloaded as a plain `.md` file.

Job pages retain an extra advantage: Malus first tries its specialized job extractors, preserving title, company, location, job metadata, and description. If a page is not recognized as a job, the general page extractor takes over.

## What it preserves

- Page title, canonical source, site, author, publication date, language, and capture date when available.
- Headings, paragraphs, emphasis, links, images, quotations, lists, code blocks, and tables.
- Job-specific metadata on supported LinkedIn, schema.org, Greenhouse, DocuSign, Adzuna, and semantically marked-up job pages.

Navigation, forms, cookie prompts, advertising, recommendations, and similar page chrome are removed where recognizable.

## Architecture

- `src/extractors/linkedin.ts` handles LinkedIn jobs.
- `src/extractors/generic.ts` handles structured and semantically marked-up jobs on other sites.
- `src/extractors/page.ts` scores semantic content regions and provides a general rendered-page fallback.
- `src/model.ts` defines separate normalized job and webpage boundaries.
- `src/markdown.ts` converts sanitized HTML to Markdown, generates YAML front matter, and creates safe filenames.
- `src/popup.ts` tries job extraction first, falls back to general capture, and starts a local Blob download.
- `tests/fixtures` contains sanitized representative pages without account or session data.

The extension uses Manifest V3 and requests only `activeTab` and `scripting`. It does not request persistent access to every site.

## Local setup

Requires Node.js 20.19+ or 22.12+ and npm.

```sh
npm install
npm run test
npm run build
```

Full checks:

```sh
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

The production extension is written to `dist/`.

## Load in Chrome

1. Run `npm run build`.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select this repository's `dist` directory. If it is already loaded, use **Reload** after rebuilding.
5. Pin **Malus** to the toolbar if desired.

## Manual test

1. Open a fully loaded article, documentation page, or individual job listing.
2. Click the Malus toolbar icon and then **Save as Markdown**.
3. Inspect the downloaded file for complete core content, working absolute links, useful structure, and absence of obvious navigation or prompts.
4. Repeat with a job page and confirm that the filename and YAML retain job-specific fields.

## Privacy

All extraction, conversion, and file creation happens locally in Chrome. There is no backend, analytics, account system, external API, AI service, or network transmission of captured content. Malus reads only the active page after the user invokes it and does not retain content after download.

The complete public disclosure is in [PRIVACY.md](PRIVACY.md), and usage help is in [SUPPORT.md](SUPPORT.md).

## Chrome Web Store release

Store copy, privacy declarations, reviewer instructions, artwork, and the submission checklist are under `store/` and `store-assets/`.

Create a verified upload package with:

```sh
npm run release:package
```

This rebuilds the extension and creates `release/malus-<version>.zip` with `manifest.json` at the archive root. Follow `store/submission-checklist.md` before uploading it.

## Honest limitations

“Any page” means ordinary rendered HTML that Chrome lets an extension inspect. Malus cannot reliably convert browser-internal pages, extension-store pages, protected or inaccessible frames, paywalled content that is not present in the DOM, canvas-only applications, embedded PDFs, video/audio meaning, or content that has not loaded. Highly interactive applications may yield only their currently rendered text. Sites can also change markup, so specialized job selectors may require maintenance.

Automated fixtures cover representative articles, documentation, unstructured pages, code, tables, images, and several job renderers. They demonstrate breadth; they do not prove compatibility with every webpage on the internet.

## License

Malus is available under the [MIT License](LICENSE).
