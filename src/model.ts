export interface ExtractedJob {
  title: string;
  company: string;
  location: string;
  salary: string | null;
  workplaceType: string | null;
  employmentType: string | null;
  descriptionHtml: string;
  source: string;
}

export interface JobPosting extends ExtractedJob {
  captured: string;
}

export interface ExtractedPage {
  title: string;
  siteName: string | null;
  author: string | null;
  published: string | null;
  language: string | null;
  contentHtml: string;
  source: string;
}

export interface CapturedPage extends ExtractedPage {
  captured: string;
}

export type ExtractionResult =
  | { ok: true; job: ExtractedJob }
  | { ok: false; reason: "unsupported" | "extraction_failed"; message: string };

export type PageExtractionResult =
  | { ok: true; page: ExtractedPage }
  | { ok: false; reason: "unsupported" | "extraction_failed"; message: string };
