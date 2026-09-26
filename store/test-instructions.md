# Chrome Web Store Reviewer Test Instructions

Malus requires no account, credentials, payment, remote service, or special environment.

## General webpage test

1. Install the extension.
2. Open a fully loaded public article or documentation page over HTTPS. For example, open a page under `https://developer.chrome.com/docs/extensions/`.
3. Select the Malus toolbar icon.
4. Confirm the popup says **Ready to save this page.**
5. Select **Save as Markdown**.
6. Confirm Chrome downloads a `.md` file containing YAML source metadata and the page's primary readable content.

## Job-listing test

1. Open an individual, fully loaded public job-detail page rather than a search-results page.
2. Select Malus and then **Save as Markdown**.
3. Confirm the downloaded filename and YAML contain the job company and title when the page exposes recognizable job metadata.

## Privacy verification

- The extension makes no external network request.
- There is no account or background activity.
- `activeTab` access begins only after the user invokes Malus.
- Output is created locally as a browser download.

## Expected unsupported surfaces

Chrome internal pages, the Chrome Web Store itself, protected frames, canvas-only applications, embedded PDFs, and content absent from the DOM may show an unsupported or readable-content error. This is expected and disclosed in the listing.
