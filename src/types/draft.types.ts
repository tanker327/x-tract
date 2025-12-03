/**
 * Type definitions for Draft.js content structure
 * Used for parsing article-format posts
 */

/**
 * Draft.js entity definition
 */
export interface DraftEntity {
  type: string;
  mutability: "MUTABLE" | "IMMUTABLE" | "SEGMENTED";
  data: any;
}

/**
 * Single item in entity map array format
 */
export interface DraftEntityMapItem {
  key: string;
  value: DraftEntity;
}

/**
 * Entity map can be either array or object format
 */
export type DraftEntityMap =
  | DraftEntityMapItem[]
  | { [key: string]: DraftEntity };

/**
 * Inline style range within a block
 */
export interface InlineStyleRange {
  offset: number;
  length: number;
  style: string; // 'BOLD', 'ITALIC', etc.
}

/**
 * Entity range within a block (e.g., links)
 */
export interface EntityRange {
  offset: number;
  length: number;
  key: number | string;
}

/**
 * A single content block in Draft.js format
 */
export interface DraftBlock {
  key: string;
  text: string;
  type: string; // 'unstyled', 'header-one', 'atomic', etc.
  depth: number;
  inlineStyleRanges: InlineStyleRange[];
  entityRanges: EntityRange[];
  data?: any;
}

/**
 * Complete Draft.js content state structure
 */
export interface DraftContentState {
  blocks: DraftBlock[];
  entityMap: DraftEntityMap;
}
