# ARCHITECTURE.md

## Platform

- Chrome extension using Manifest V3
- Strict TypeScript with Vite
- Vitest, jsdom, and sanitized HTML fixtures
- Local Markdown download; no persistence or networking

## Architectural Goals

Prioritize a one-action workflow, local-only processing, resilient semantic extraction, clear module boundaries, and minimum permissions. Avoid background services, persistent host access, external processors, and site-specific logic outside extractor modules.

## Structure

- `src/extractors/linkedin.ts`: self-contained LinkedIn job extractor
- `src/extractors/generic.ts`: structured and semantic job extractor for other sites
- `src/extractors/page.ts`: general webpage extractor that scores semantic content regions, sanitizes the selected DOM, and falls back to the rendered body
- `src/model.ts`: normalized job and webpage types with discriminated results
- `src/markdown.ts`: HTML-to-Markdown, YAML, and filename generation for both document types
- `src/popup.ts`: active-tab validation, job-first extraction, general fallback, UI state, and Blob download
- `tests/fixtures`: sanitized representative page HTML
- `public/manifest.json`: minimum-permission extension manifest

## Extraction Flow

1. Reject non-HTTP(S) browser surfaces before injection.
2. Try the LinkedIn or generic job extractor.
3. If no job is recognized, run the general page extractor.
4. Score semantic content regions; use the rendered body only when no useful region wins.
5. Remove recognizable scripts, controls, navigation, forms, advertising, consent, recommendation, and related-content elements.
6. Preserve a limited semantic vocabulary and resolve links and images to absolute HTTP(S) URLs.
7. Convert locally to Markdown and trigger a local file download.

## Data Model

`ExtractedJob` holds normalized job metadata and sanitized description HTML; `JobPosting` adds the capture date. `ExtractedPage` holds page metadata, sanitized content HTML, and source; `CapturedPage` adds the capture date. Both extractor families return discriminated success/failure results.

## Permissions and Privacy

`activeTab` grants temporary access only after the user invokes the extension. `scripting` runs a self-contained extractor in that tab. There is no host-wide permission, backend, external API, remote content processor, or retained content store.

## Hard Boundary

The extractor can only inspect accessible DOM content. Browser-internal pages, protected frames, canvas-only applications, embedded documents, unloaded content, and media meaning are outside the reliable conversion boundary.
