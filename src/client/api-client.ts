import { Post, PostResultSchema } from "../types/api.types";
import { PostNotFoundError, ParseError } from "../utils/errors";
import { extractPostId } from "../utils/id-extractor";
import { activateGuest } from "./guest-auth";
import {
  PUBLIC_BEARER_TOKEN,
  GRAPHQL_URL,
  POST_RESULT_BY_REST_ID,
  USER_AGENT,
} from "./constants";

/**
 * Fetches post data from Twitter API using a guest token
 *
 * @param postId - The post ID to fetch
 * @param guestToken - Guest authentication token
 * @returns Post data or null if not found
 * @throws {PostNotFoundError} If the post cannot be found
 * @throws {ParseError} If the response cannot be parsed
 */
export async function fetchPost(
  postId: string,
  guestToken: string,
): Promise<Post | null> {
  const { queryId, operationName, features, fieldToggles } =
    POST_RESULT_BY_REST_ID;

  const variables = {
    tweetId: postId,
    withCommunity: false,
    includePromotedContent: false,
    withVoice: false,
  };

  const url = new URL(`${GRAPHQL_URL}/${queryId}/${operationName}`);
  url.searchParams.append("variables", JSON.stringify(variables));
  url.searchParams.append("features", JSON.stringify(features));
  url.searchParams.append("fieldToggles", JSON.stringify(fieldToggles));

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${PUBLIC_BEARER_TOKEN}`,
      "Content-Type": "application/json",
      "x-twitter-active-user": "yes",
      "x-twitter-client-language": "en",
      "x-guest-token": guestToken,
      "User-Agent": USER_AGENT,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new PostNotFoundError(
      postId,
      `Failed to fetch post: ${response.status} ${response.statusText} - ${text}`,
    );
  }

  const data = await response.json();
  const parsed = PostResultSchema.safeParse(data);

  if (!parsed.success) {
    console.error("Failed to parse post data:", JSON.stringify(data, null, 2));
    throw new ParseError(
      `Failed to parse post data: ${parsed.error.message}`,
      parsed.error,
    );
  }

  return parsed.data.data.tweetResult.result || null;
}

/**
 * Gets post data by ID or URL
 * Handles authentication and ID extraction automatically
 *
 * @param idOrUrl - Post ID or URL
 * @returns Post data or null if not found
 * @throws {InvalidPostIdError} If the ID/URL format is invalid
 * @throws {AuthenticationError} If authentication fails
 * @throws {PostNotFoundError} If the post cannot be found
 */
export async function getPost(idOrUrl: string): Promise<Post | null> {
  const postId = extractPostId(idOrUrl);
  const guestToken = await activateGuest();
  return fetchPost(postId, guestToken);
}
