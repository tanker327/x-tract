/**
 * xtract - TypeScript library for extracting Twitter/X post data
 */

import { getPost as getRawPost } from "./client/api-client";
import { parsePost } from "./parsers/post-parser";
import { PostData, Post } from "./types";

// Export types
export type { PostData, PostAuthor, PostStats } from "./types";
export type { Post, StandardPost, ArticlePost } from "./types";

// Export utility functions
export {
  extractPostId,
  isValidPostId,
  isValidPostUrl,
} from "./utils/id-extractor";

// Export errors
export {
  XtractError,
  PostNotFoundError,
  AuthenticationError,
  ParseError,
  InvalidPostIdError,
} from "./utils/errors";

/**
 * Fetches raw post data from Twitter/X API
 *
 * @param idOrUrl - Post ID or URL (e.g., "1234567890" or "https://twitter.com/user/status/1234567890")
 * @returns Raw post data from API, or null if not found
 * @throws {InvalidPostIdError} If the ID/URL format is invalid
 * @throws {AuthenticationError} If authentication with the API fails
 * @throws {PostNotFoundError} If the post cannot be found
 * @throws {ParseError} If the API response cannot be parsed
 *
 * @example
 * ```ts
 * const post = await getPost('1234567890');
 * console.log(post.rest_id, post.core.user_results.result.core.screen_name);
 * ```
 */
export async function getPost(idOrUrl: string): Promise<Post | null> {
  return getRawPost(idOrUrl);
}

/**
 * Fetches and parses post data into simplified format
 *
 * @param idOrUrl - Post ID or URL (e.g., "1234567890" or "https://twitter.com/user/status/1234567890")
 * @param options - Optional configuration
 * @param options.maxQuoteDepth - Maximum depth for recursively fetching quoted posts (default: 5, set to 1 to disable recursive fetching)
 * @returns Simplified post data, or null if not found
 * @throws {InvalidPostIdError} If the ID/URL format is invalid
 * @throws {AuthenticationError} If authentication with the API fails
 * @throws {PostNotFoundError} If the post cannot be found
 * @throws {ParseError} If the API response cannot be parsed
 *
 * @example
 * ```ts
 * const post = await getPostData('1234567890');
 * console.log(post.text, post.author.name, post.stats.likes);
 *
 * // Fetch with nested quotes up to 3 levels deep
 * const postWithQuotes = await getPostData('1234567890', { maxQuoteDepth: 3 });
 * ```
 */
export async function getPostData(
  idOrUrl: string,
  options: { maxQuoteDepth?: number } = {},
): Promise<PostData | null> {
  const { maxQuoteDepth = 5 } = options;
  const post = await getRawPost(idOrUrl);
  if (!post) return null;

  const parsed = parsePost(post);

  // Recursively fetch nested quoted posts if enabled
  if (maxQuoteDepth > 1 && parsed.quotedPost) {
    await fetchNestedQuotes(parsed.quotedPost, maxQuoteDepth - 1, 1);
  }

  return parsed;
}

/**
 * Recursively fetches nested quoted posts
 * @internal
 */
async function fetchNestedQuotes(
  postData: PostData,
  remainingDepth: number,
  currentLevel: number,
): Promise<void> {
  if (remainingDepth === 0) {
    return;
  }

  // Fetch this post again to see if it has a quoted_status_result
  // (The initial fetch only includes one level of quotes)
  try {
    const fetchedPost = await getRawPost(postData.id);
    if (fetchedPost && fetchedPost.quoted_status_result?.result) {
      // Parse the nested quote and attach it
      const nestedQuoteParsed = parsePost(
        fetchedPost.quoted_status_result.result,
      );
      postData.quotedPost = nestedQuoteParsed;

      // Continue recursively
      await fetchNestedQuotes(
        nestedQuoteParsed,
        remainingDepth - 1,
        currentLevel + 1,
      );
    }
  } catch (error) {
    console.error(
      `[ERROR] Failed to fetch nested quote at level ${currentLevel + 1}:`,
      error,
    );
  }
}

/**
 * Parses raw post data into simplified format
 *
 * @param post - Raw post data from API
 * @returns Simplified post data
 *
 * @example
 * ```ts
 * const rawPost = await getPost('1234567890');
 * if (rawPost) {
 *   const parsed = transformPost(rawPost);
 *   console.log(parsed.text);
 * }
 * ```
 */
export function transformPost(post: Post): PostData {
  return parsePost(post);
}
