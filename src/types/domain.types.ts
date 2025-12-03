import { DraftEntityMap, InlineStyleRange, EntityRange } from "./draft.types";

/**
 * Internal domain types for parsed articles
 */

/**
 * Types of blocks that can appear in an article
 */
export type ArticleBlockType =
  | "text"
  | "image"
  | "video"
  | "tweet"
  | "divider"
  | "unknown";

/**
 * Base interface for all article blocks
 */
export interface BaseArticleBlock {
  type: ArticleBlockType;
  key: string;
}

/**
 * Text block with optional styling
 */
export interface TextArticleBlock extends BaseArticleBlock {
  type: "text";
  text: string;
  style?: string; // 'header-one', 'blockquote', etc.
  inlineStyleRanges?: InlineStyleRange[];
  entityRanges?: EntityRange[];
}

/**
 * Image block
 */
export interface ImageArticleBlock extends BaseArticleBlock {
  type: "image";
  url: string;
  width?: number;
  height?: number;
  mediaId?: string;
}

/**
 * Video block
 */
export interface VideoArticleBlock extends BaseArticleBlock {
  type: "video";
  url: string;
  poster?: string;
  mediaId?: string;
}

/**
 * Embedded tweet block
 */
export interface TweetArticleBlock extends BaseArticleBlock {
  type: "tweet";
  tweetId: string;
}

/**
 * Divider block
 */
export interface DividerArticleBlock extends BaseArticleBlock {
  type: "divider";
}

/**
 * Unknown/unsupported block type
 */
export interface UnknownArticleBlock extends BaseArticleBlock {
  type: "unknown";
}

/**
 * Union of all possible article block types
 */
export type ParsedArticleBlock =
  | TextArticleBlock
  | ImageArticleBlock
  | VideoArticleBlock
  | TweetArticleBlock
  | DividerArticleBlock
  | UnknownArticleBlock;

/**
 * Parsed article structure
 */
export interface ParsedArticle {
  title: string;
  blocks: ParsedArticleBlock[];
  coverImage?: string;
  entityMap?: DraftEntityMap;
}
