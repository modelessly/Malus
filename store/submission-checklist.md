# Malus Chrome Web Store Submission Checklist

## Repository and product

- [x] Manifest V3 extension.
- [x] Narrow single purpose.
- [x] Minimum `activeTab` and `scripting` permissions.
- [x] No remote code, backend, analytics, advertising, or external processing.
- [x] Automated tests, lint, type checking, and production build pass.
- [x] Public-facing privacy policy and support document prepared.
- [x] Store copy, privacy answers, permission justifications, and reviewer instructions prepared.
- [x] Required extension icons and store imagery prepared at exact dimensions.
- [x] Versioned ZIP packaging command prepared.

## Before uploading

- [ ] Inspect the final store-installed experience on an article, documentation page, and supported job listing.
- [ ] Commit the release changes and merge or push them to the public default branch.
- [ ] Confirm the privacy and support URLs in `store/listing.md` load without authentication.
- [ ] Decide whether the GitHub repository will remain `job-markdown` or be renamed to `malus`; update listing URLs accordingly.
- [ ] Confirm the public listing name **Malus — Webpage to Markdown** is acceptable despite the unrelated existing Malus VPN listing.
- [ ] Run `npm run release:package` and upload the generated ZIP without modifying it afterward.

## Developer Dashboard — account

- [ ] Register the publisher account and pay Google's one-time registration fee.
- [ ] Verify the publisher contact email.
- [ ] Choose the publisher display name.
- [ ] Enable review-status email notifications.

## Developer Dashboard — item

- [ ] Upload `release/malus-0.2.0.zip` as a new item.
- [ ] Paste the copy from `store/listing.md`.
- [ ] Upload the icon, screenshots, small tile, and optional marquee tile from `store-assets/`.
- [ ] Enter the live privacy-policy and support URLs.
- [ ] Complete Privacy Practices using `store/privacy-practices.md`.
- [ ] Add `store/test-instructions.md` under Test Instructions.
- [ ] Select **Private — trusted testers** for the first reviewed release.
- [ ] Add tester Google-account email addresses.
- [ ] Select deferred publishing so approval does not immediately make the release live.
- [ ] Submit for review.

## After approval

- [ ] Install the reviewed store version rather than the unpacked development build.
- [ ] Repeat live article, documentation, job, error-state, and download tests.
- [ ] Resolve any review feedback or confirmed defects with a version increment and new ZIP.
- [ ] Change visibility to public only after the reviewed build passes testing.
