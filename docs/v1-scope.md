# V1 Scope

## Included

- Chrome Manifest V3 toolbar extension named Malus.
- One-action local capture of ordinary fully loaded HTTP(S) pages.
- Job-first extraction with a semantic general-page fallback.
- Page and job metadata, sanitized Markdown, safe filenames, and local download.
- Headings, paragraphs, emphasis, links, images, quotations, lists, code, and tables.
- Clear ready, loading, success, failure, and unsupported-page states.
- Fixture-based automated tests and unpacked-extension build.

## Explicitly Excluded

- Browser-internal pages, protected/inaccessible frames, canvas-only applications, embedded PDFs, media transcription, paywall bypass, and content absent from the DOM.
- Accounts, cloud storage, sync, backend services, analytics, tracking, external APIs, or AI features.
- Pixel-identical visual reproduction, application tracking, or a website/dashboard.

## Success Criteria

Malus should export readable primary content, retain useful semantic structure, omit obvious interface clutter, tolerate missing optional metadata, preserve specialized job behavior, keep content local, and declare only permissions required for user-initiated active-page extraction.
