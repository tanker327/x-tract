import {
  ParsedArticle,
  ParsedArticleBlock,
  ImageArticleBlock,
  VideoArticleBlock,
  TweetArticleBlock,
  DividerArticleBlock,
  UnknownArticleBlock,
  TextArticleBlock,
} from "../types/domain.types";
import {
  DraftContentState,
  DraftEntity,
  DraftBlock,
  DraftEntityMap,
} from "../types/draft.types";

/**
 * Parses article data from Twitter/X API response
 *
 * @param articleResult - Article results object from API
 * @returns Parsed article structure
 */
export function parseArticle(
  articleResult: { result: any } | any,
): ParsedArticle {
  const result = articleResult.result || articleResult;
  const title = result.title || "";
  const coverImage = result.cover_media?.media_info?.original_img_url;

  const contentState = result.content_state as DraftContentState;
  const blocks: ParsedArticleBlock[] = [];

  if (!contentState || !contentState.blocks) {
    return { title, blocks: [], coverImage };
  }

  // Parse each block
  for (const block of contentState.blocks) {
    if (block.type === "atomic") {
      // Atomic blocks contain entities (images, videos, etc.)
      const parsedBlock = parseAtomicBlock(block, contentState.entityMap);
      if (parsedBlock) {
        blocks.push(parsedBlock);
      }
    } else {
      // Text blocks
      blocks.push(parseTextBlock(block));
    }
  }

  return {
    title,
    blocks,
    coverImage,
    entityMap: contentState.entityMap,
  };
}

/**
 * Parses a text block
 */
function parseTextBlock(block: DraftBlock): TextArticleBlock {
  return {
    type: "text",
    key: block.key,
    text: block.text,
    style: block.type !== "unstyled" ? block.type : undefined,
    inlineStyleRanges: block.inlineStyleRanges,
    entityRanges: block.entityRanges,
  };
}

/**
 * Parses an atomic block (media, embeds, etc.)
 */
function parseAtomicBlock(
  block: DraftBlock,
  entityMap?: DraftEntityMap,
): ParsedArticleBlock | null {
  // Find the entity key for this atomic block
  let entityKey: string | number | undefined;
  if (block.entityRanges.length > 0) {
    entityKey = block.entityRanges[0].key;
  }

  if (entityKey === undefined || !entityMap) {
    return null;
  }

  const entity = getEntity(entityMap, entityKey);
  if (!entity) {
    return null;
  }

  return parseAtomicEntity(block.key, entity);
}

/**
 * Parses an entity within an atomic block
 */
function parseAtomicEntity(
  blockKey: string,
  entity: DraftEntity,
): ParsedArticleBlock | null {
  const { type, data } = entity;

  // Handle media entities (images, videos)
  if (type === "MEDIA") {
    if (
      data.mediaItems &&
      Array.isArray(data.mediaItems) &&
      data.mediaItems.length > 0
    ) {
      const mediaItem = data.mediaItems[0];

      if (mediaItem.mediaCategory === "DraftTweetImage") {
        return {
          type: "image",
          key: blockKey,
          mediaId: mediaItem.mediaId,
          url: "", // Will be resolved later
        } as ImageArticleBlock;
      }

      if (
        mediaItem.mediaCategory === "DraftTweetGif" ||
        mediaItem.mediaCategory === "DraftTweetVideo"
      ) {
        return {
          type: "video",
          key: blockKey,
          mediaId: mediaItem.mediaId,
          url: "", // Will be resolved later
        } as VideoArticleBlock;
      }
    }
  }

  // Handle emoji entities
  if (type === "TWEMOJI") {
    if (data.url) {
      return {
        type: "image",
        key: blockKey,
        url: data.url,
      } as ImageArticleBlock;
    }
  }

  // Handle dividers
  if (type === "DIVIDER") {
    return {
      type: "divider",
      key: blockKey,
    } as DividerArticleBlock;
  }

  // Handle embedded tweets
  if (type === "TWEET") {
    return {
      type: "tweet",
      key: blockKey,
      tweetId: data.tweetId || "",
    } as TweetArticleBlock;
  }

  // Unknown entity type
  return {
    type: "unknown",
    key: blockKey,
  } as UnknownArticleBlock;
}

/**
 * Helper to retrieve an entity from the entity map
 */
function getEntity(
  entityMap: DraftEntityMap,
  key: string | number,
): DraftEntity | undefined {
  if (Array.isArray(entityMap)) {
    const item = entityMap.find((e) => e.key === String(key));
    return item?.value;
  }
  return entityMap[String(key)];
}
