import { InvalidPostIdError } from "./errors";

/**
 * Extracts a post ID from various input formats:
 * - Plain ID: "1234567890"
 * - Status URL: "https://twitter.com/user/status/1234567890"
 * - Article URL: "https://twitter.com/i/article/1234567890"
 * - Short path: "status/1234567890"
 *
 * @param idOrUrl - Post ID or URL string
 * @returns Extracted post ID
 * @throws {InvalidPostIdError} If the input is not a valid post ID or URL
 */
export function extractPostId(idOrUrl: string): string {
  // If it's just numbers, assume it's an ID
  if (/^\d+$/.test(idOrUrl)) {
    return idOrUrl;
  }

  // Try to parse as URL
  try {
    const url = new URL(idOrUrl);
    // Path should be like /user/status/123456 or /i/article/123456
    const parts = url.pathname.split("/");
    const statusIndex = parts.indexOf("status");
    if (statusIndex !== -1 && parts[statusIndex + 1]) {
      return parts[statusIndex + 1];
    }
    const articleIndex = parts.indexOf("article");
    if (articleIndex !== -1 && parts[articleIndex + 1]) {
      return parts[articleIndex + 1];
    }
  } catch {
    // Not a valid URL, maybe a partial path?
    const match = idOrUrl.match(/(?:status|article)\/(\d+)/);
    if (match) {
      return match[1];
    }
  }

  throw new InvalidPostIdError(idOrUrl);
}

/**
 * Validates if a string is a valid post ID (numeric string)
 *
 * @param id - String to validate
 * @returns true if valid post ID
 */
export function isValidPostId(id: string): boolean {
  return /^\d+$/.test(id);
}

/**
 * Validates if a string is a valid post URL
 *
 * @param url - String to validate
 * @returns true if valid post URL
 */
export function isValidPostUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      (parsed.hostname === "twitter.com" || parsed.hostname === "x.com") &&
      (parsed.pathname.includes("/status/") ||
        parsed.pathname.includes("/article/"))
    );
  } catch {
    return false;
  }
}
