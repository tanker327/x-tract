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
 * ```
 */
export async function getPostData(idOrUrl: string): Promise<PostData | null> {
  const post = await getRawPost(idOrUrl);
  return post ? parsePost(post) : null;
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
