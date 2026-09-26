# TASKS.md

## Malus Generalization

- [x] Rename the extension, popup, manifest, and package to Malus.
- [x] Preserve specialized LinkedIn and cross-site job extraction.
- [x] Add a separate semantic webpage extractor and body fallback.
- [x] Preserve headings, links, images, quotations, lists, code, and tables.
- [x] Add general page metadata, YAML output, and safe filenames.
- [x] Add fixtures for articles, documentation, unstructured pages, and known limitations.
- [x] Document privacy, architecture, scope, and the honest universal-capture boundary.

## Automated Validation

- [x] Formatting check passes.
- [x] Lint passes.
- [x] Type checking passes.
- [x] Job and general-page tests pass.
- [x] Production build passes with minimum permissions.

## Manual Validation

- [ ] Reload `dist/` as an unpacked extension in Chrome.
- [ ] Save a live article and inspect content structure and clutter removal.
- [ ] Save a live documentation page containing code or a table.
- [ ] Save a supported job page and confirm normalized job front matter remains.
- [ ] Confirm a restricted or canvas-only surface fails clearly rather than saving misleading output.

## Chrome Web Store Preparation

- [x] Add extension and store icons.
- [x] Add two listing screenshots and promotional tiles.
- [x] Prepare privacy policy, support page, store copy, permission justifications, and reviewer instructions.
- [x] Add reproducible versioned ZIP packaging.
- [ ] Commit and publish the privacy/support pages at working public URLs.
- [ ] Register and verify the Chrome Web Store publisher account.
- [ ] Upload privately for trusted-tester review.
- [ ] Validate the reviewed store-installed build before public release.
