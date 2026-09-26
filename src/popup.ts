import { extractGenericJob } from "./extractors/generic";
import { extractLinkedInJob } from "./extractors/linkedin";
import { extractWebPage } from "./extractors/page";
import {
  generateMarkdown,
  generatePageMarkdown,
  sanitizeFilename,
  sanitizePageFilename,
} from "./markdown";
import type { ExtractionResult, PageExtractionResult } from "./model";

const button = document.querySelector<HTMLButtonElement>("#save-button");
const status = document.querySelector<HTMLElement>("#status");
const statusMessage = document.querySelector<HTMLElement>("#status-message");

if (!button || !status || !statusMessage)
  throw new Error("Popup UI is incomplete.");

const setState = (
  state: "ready" | "loading" | "success" | "error" | "unsupported",
  message: string,
) => {
  status.dataset.state = state;
  statusMessage.textContent = message;
  button.disabled = state !== "ready";
  button.setAttribute("aria-busy", String(state === "loading"));
};

const getActiveTab = async (): Promise<chrome.tabs.Tab | null> => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab ?? null;
};

const isLinkedInJobUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return (
      (parsed.hostname === "linkedin.com" ||
        parsed.hostname.endsWith(".linkedin.com")) &&
      /\/jobs\/view\/(?:\d+|[^/?#]+)/.test(parsed.pathname)
    );
  } catch {
    return false;
  }
};

const isWebPageUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    return /^https?:$/.test(new URL(url).protocol);
  } catch {
    return false;
  }
};

const downloadMarkdown = (markdown: string, filename: string) => {
  const url = URL.createObjectURL(
    new Blob([markdown], { type: "text/markdown;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
};

const extractJob = async (
  tabId: number,
  linkedIn: boolean,
): Promise<ExtractionResult | undefined> => {
  const [injection] = await chrome.scripting.executeScript({
    target: { tabId },
    func: linkedIn ? extractLinkedInJob : extractGenericJob,
  });
  return injection?.result;
};

const extractPage = async (
  tabId: number,
): Promise<PageExtractionResult | undefined> => {
  const [injection] = await chrome.scripting.executeScript({
    target: { tabId },
    func: extractWebPage,
  });
  return injection?.result;
};

const initialize = async () => {
  const tab = await getActiveTab();
  if (!tab?.id || !isWebPageUrl(tab.url)) {
    setState("unsupported", "Open a normal web page to save it.");
    return;
  }
  setState("ready", "Ready to save this page.");
};

button.addEventListener("click", async () => {
  setState("loading", "Cleaning this page…");
  try {
    const tab = await getActiveTab();
    if (!tab?.id || !isWebPageUrl(tab.url)) {
      setState("unsupported", "This is not a normal web page.");
      return;
    }

    const jobResult = await extractJob(tab.id, isLinkedInJobUrl(tab.url));
    if (jobResult?.ok) {
      const job = {
        ...jobResult.job,
        captured: new Date().toISOString().slice(0, 10),
      };
      const filename = sanitizeFilename(job.company, job.title);
      downloadMarkdown(generateMarkdown(job), filename);
      setState("success", `Saved ${filename}`);
      return;
    }

    const pageResult = await extractPage(tab.id);
    if (!pageResult?.ok) {
      setState(
        pageResult?.reason === "unsupported" ? "unsupported" : "error",
        pageResult?.message ?? "Could not read this page.",
      );
      return;
    }

    const page = {
      ...pageResult.page,
      captured: new Date().toISOString().slice(0, 10),
    };
    const filename = sanitizePageFilename(page.title);
    downloadMarkdown(generatePageMarkdown(page), filename);
    setState("success", `Saved ${filename}`);
  } catch (error) {
    const message =
      error instanceof Error && /Cannot access|permission/i.test(error.message)
        ? "Chrome could not access this page. Refresh it and try again."
        : "Something went wrong while saving this page.";
    setState("error", message);
  }
});

initialize().catch(() =>
  setState("error", "Could not inspect the current tab."),
);
