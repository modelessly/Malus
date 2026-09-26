# Chrome Web Store Privacy Practices

Use these answers in the Developer Dashboard and verify that the dashboard wording still matches before submission.

## Single purpose

Malus converts the currently displayed webpage into a locally downloaded Markdown file at the user's explicit request.

## Permission justifications

### `activeTab`

Malus needs temporary access to the active tab only after the user selects the extension. It reads the rendered page chosen by the user so that it can create the requested Markdown file. It does not use persistent site access.

### `scripting`

Malus injects its local extraction function into the user-selected active tab. The function identifies the primary readable content, removes recognizable page chrome, and returns sanitized content to the extension popup for local Markdown conversion and download.

## Data handled

Disclose website content and web browsing activity because Malus processes the content and URL of the active page, even though this happens only on-device.

- Website content: handled locally to generate the requested Markdown file.
- Web browsing activity: the current page URL is included as source metadata in the requested Markdown file.

Malus does not collect or transmit either category to the developer or third parties. It does not retain a remote copy.

## Certifications

- Data is used only to provide the extension's single purpose.
- Data is not sold or transferred to third parties.
- Data is not used for advertising, profiling, analytics, lending, or creditworthiness.
- Human reviewers do not read captured content.
- The behavior and disclosures match `PRIVACY.md` and the store description.
