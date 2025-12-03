import { ParsedArticle, ParsedArticleBlock } from "../types/domain.types";

/**
 * Media entity interface from API responses
 */
interface MediaEntity {
  type: "photo" | "video" | "animated_gif";
  media_url_https: string;
  video_info?: {
    variants: Array<{
      content_type: string;
      url: string;
      bitrate?: number;
    }>;
  };
}

/**
 * Article media entity interface
 */
interface ArticleMediaEntity {
  media_id: string;
  media_info?: {
    original_img_url: string;
  };
}

/**
 * Extracts image and video URLs from legacy post entities
 *
 * @param entities - Media entities array from post data
 * @returns Object with separate images and videos arrays
 */
export function extractMediaUrls(entities: MediaEntity[]): {
  images: string[];
  videos: string[];
} {
  const images: string[] = [];
  const videos: string[] = [];

  for (const entity of entities) {
    if (entity.type === "photo") {
      images.push(entity.media_url_https);
    } else if (entity.type === "video" || entity.type === "animated_gif") {
      // Find best quality video variant
      const variants = entity.video_info?.variants || [];
      const bestVariant = findBestVideoVariant(variants);

      if (bestVariant) {
        videos.push(bestVariant.url);
      }
    }
  }

  return { images, videos };
}

/**
 * Finds the best quality video variant from available options
 * Prefers highest bitrate MP4 format, falls back to first available
 *
 * @param variants - Array of video variants
 * @returns Best video variant or null
 */
function findBestVideoVariant(
  variants: Array<{
    content_type: string;
    url: string;
    bitrate?: number;
  }>,
): { url: string } | null {
  let bestVariant: { url: string } | null = null;
  let maxBitrate = -1;

  for (const variant of variants) {
    // Skip m3u8 playlists
    if (variant.content_type === "application/x-mpegURL") {
      continue;
    }

    if (variant.bitrate && variant.bitrate > maxBitrate) {
      maxBitrate = variant.bitrate;
      bestVariant = { url: variant.url };
    }
  }

  // Fallback if no bitrate (e.g., animated GIFs)
  if (!bestVariant && variants.length > 0) {
    bestVariant = { url: variants[0].url };
  }

  return bestVariant;
}

/**
 * Resolves media URLs in parsed article blocks using media entities map
 *
 * @param parsedArticle - Parsed article structure
 * @param mediaEntities - Array of media entities with IDs and URLs
 * @returns Updated parsed article with resolved media URLs
 */
export function resolveArticleMediaUrls(
  parsedArticle: ParsedArticle,
  mediaEntities: ArticleMediaEntity[],
): ParsedArticle {
  if (!mediaEntities || !Array.isArray(mediaEntities)) {
    return parsedArticle;
  }

  // Build media ID to URL map
  const mediaMap = new Map<string, string>();
  for (const media of mediaEntities) {
    if (media.media_id && media.media_info?.original_img_url) {
      mediaMap.set(media.media_id, media.media_info.original_img_url);
    }
  }

  // Resolve URLs in blocks
  const resolvedBlocks: ParsedArticleBlock[] = parsedArticle.blocks.map(
    (block) => {
      if (block.type === "image" && block.mediaId) {
        const url = mediaMap.get(block.mediaId);
        if (url) {
          return { ...block, url };
        }
      }
      // TODO: Handle video resolution when needed
      return block;
    },
  );

  return {
    ...parsedArticle,
    blocks: resolvedBlocks,
  };
}
