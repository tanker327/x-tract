/**
 * Type definitions for xtract library
 */

// Public output types
export type { PostData, PostAuthor, PostStats } from "./output.types";

// API types (for advanced usage)
export type { Post, StandardPost, ArticlePost, LegacyPost } from "./api.types";
export {
  PostSchema,
  StandardPostSchema,
  ArticlePostSchema,
  PostResultSchema,
} from "./api.types";

// Domain types (for article parsing)
export type {
  ParsedArticle,
  ParsedArticleBlock,
  ArticleBlockType,
  TextArticleBlock,
  ImageArticleBlock,
  VideoArticleBlock,
  TweetArticleBlock,
  DividerArticleBlock,
  UnknownArticleBlock,
} from "./domain.types";

// Draft.js types (for article content)
export type {
  DraftContentState,
  DraftBlock,
  DraftEntity,
  DraftEntityMap,
  DraftEntityMapItem,
  InlineStyleRange,
  EntityRange,
} from "./draft.types";
