import {
  DraftEntityMap,
  InlineStyleRange,
  EntityRange,
  DraftEntity,
} from "../types/draft.types";

/**
 * Character with associated styles and entity
 */
interface StyledChar {
  char: string;
  styles: string[];
  entity: DraftEntity | null;
}

/**
 * Applies inline styles (bold, italic) and entity ranges (links) to text,
 * converting to markdown format
 *
 * @param text - Plain text content
 * @param inlineStyles - Array of style ranges
 * @param entityRanges - Array of entity ranges (e.g., links)
 * @param entityMap - Map of entities referenced in entityRanges
 * @returns Markdown-formatted text
 */
export function applyInlineStyles(
  text: string,
  inlineStyles: InlineStyleRange[] = [],
  entityRanges: EntityRange[] = [],
  entityMap?: DraftEntityMap,
): string {
  if (!text) return "";

  // Split text into characters with associated styles/entities
  const chars: StyledChar[] = text.split("").map((c) => ({
    char: c,
    styles: [],
    entity: null,
  }));

  // Apply inline styles (BOLD, ITALIC, etc.)
  if (inlineStyles) {
    inlineStyles.forEach((range) => {
      for (let i = range.offset; i < range.offset + range.length; i++) {
        if (i < chars.length) {
          chars[i].styles.push(range.style);
        }
      }
    });
  }

  // Apply entities (links, etc.)
  if (entityRanges && entityMap) {
    entityRanges.forEach((range) => {
      const entity = getEntity(entityMap, range.key);

      if (entity && entity.type === "LINK") {
        for (let i = range.offset; i < range.offset + range.length; i++) {
          if (i < chars.length) {
            chars[i].entity = entity;
          }
        }
      }
    });
  }

  // Reconstruct string with markdown formatting
  let result = "";
  let currentStyles: string[] = [];
  let currentEntity: DraftEntity | null = null;

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    // Handle entity changes (links)
    if (char.entity !== currentEntity) {
      if (currentEntity) {
        result += `](${currentEntity.data.url})`;
      }
      if (char.entity) {
        result += "[";
      }
      currentEntity = char.entity;
    }

    // Handle style changes (bold, italic)
    const isBold = char.styles.includes("BOLD");
    const isItalic = char.styles.includes("ITALIC");
    const wasBold = currentStyles.includes("BOLD");
    const wasItalic = currentStyles.includes("ITALIC");

    // Close styles that are ending
    if (wasBold && !isBold) result += "**";
    if (wasItalic && !isItalic) result += "*";

    // Open new styles
    if (!wasItalic && isItalic) result += "*";
    if (!wasBold && isBold) result += "**";

    currentStyles = char.styles;
    result += char.char;
  }

  // Close any remaining open tags
  if (currentStyles.includes("BOLD")) result += "**";
  if (currentStyles.includes("ITALIC")) result += "*";
  if (currentEntity) result += `](${currentEntity.data.url})`;

  return result;
}

/**
 * Applies block-level markdown formatting based on Draft.js block style
 *
 * @param text - Text content (with inline styles already applied)
 * @param blockStyle - Draft.js block type
 * @returns Text with block-level markdown formatting
 */
export function applyBlockStyle(text: string, blockStyle?: string): string {
  if (!blockStyle || blockStyle === "unstyled") {
    return text;
  }

  switch (blockStyle) {
    case "header-one":
      return `# ${text}`;
    case "header-two":
      return `## ${text}`;
    case "header-three":
      return `### ${text}`;
    case "blockquote":
      return `> ${text}`;
    case "unordered-list-item":
      return `- ${text}`;
    case "ordered-list-item":
      return `1. ${text}`; // Simplified, doesn't track list position
    case "code-block":
      return `\`\`\`\n${text}\n\`\`\``;
    default:
      return text;
  }
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
