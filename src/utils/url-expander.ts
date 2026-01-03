/**
 * URL expansion utilities for replacing Twitter's t.co shortened URLs with original URLs
 */

export interface UrlEntity {
  url: string; // The t.co shortened URL
  expanded_url: string; // The original URL
  display_url?: string;
  indices: [number, number];
}

/**
 * Expands all t.co URLs in text using URL entities from the API response
 *
 * @param text - The text containing t.co URLs
 * @param urlEntities - Array of URL entities from legacy.entities.urls
 * @param mediaEntities - Array of media entities from legacy.entities.media
 * @returns Text with t.co URLs replaced by expanded URLs
 */
export function expandUrls(
  text: string,
  urlEntities: UrlEntity[] = [],
  mediaEntities: Array<{ url?: string }> = [],
): string {
  // Build a map of t.co URLs to expanded URLs
  const urlMap = new Map<string, string>();

  // Add regular URL entities
  urlEntities.forEach((entity) => {
    if (entity.url && entity.expanded_url) {
      urlMap.set(entity.url, entity.expanded_url);
    }
  });

  // Add media entities (these also have t.co URLs in the text)
  // For media, we keep the t.co URL as it represents an image/video attachment
  // rather than a clickable link, so we remove it from the text instead
  const mediaUrls = new Set<string>();
  mediaEntities.forEach((entity) => {
    if (entity.url) {
      mediaUrls.add(entity.url);
    }
  });

  // Replace t.co URLs with expanded URLs
  let expandedText = text;

  // Replace regular URLs
  urlMap.forEach((expandedUrl, tcoUrl) => {
    expandedText = expandedText.replace(tcoUrl, expandedUrl);
  });

  // Remove media URLs from text (they're displayed separately as images/videos)
  mediaUrls.forEach((tcoUrl) => {
    expandedText = expandedText.replace(
      new RegExp(`\\s*${escapeRegex(tcoUrl)}\\s*`, "g"),
      "",
    );
  });

  return expandedText.trim();
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
