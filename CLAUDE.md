# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**xtract** is a TypeScript library for extracting Twitter/X post data. It fetches posts using Twitter's GraphQL API with guest authentication and transforms them into simplified, typed structures. The library handles both standard posts and long-form articles with rich content.

## Common Commands

### Build & Development
- `npm run build` - Build library using tsup (outputs CJS + ESM to `dist/`)
- `npm run dev` - Build in watch mode
- `npm run format` - Format code with Prettier

### Testing
- `npm test` - Run tests in watch mode with vitest
- `npm run test:run` - Run tests once (non-interactive)

### Running Examples
```bash
npx tsx examples/example.ts <post_id_or_url>
```

Example outputs are saved to `examples/results/{postId}/`:
- `{postId}.md` - Text content of the post
- `{postId}.json` - Full post data structure

The `examples/results/` directory is gitignored.

## Architecture

The codebase has been restructured into clear, single-responsibility modules:

```
src/
├── client/              # API client layer
│   ├── api-client.ts    # Main API functions (getPost, fetchPost)
│   ├── guest-auth.ts    # Guest authentication
│   └── constants.ts     # API constants and configuration
├── parsers/             # Data parsing layer
│   ├── post-parser.ts   # Main post transformation logic
│   ├── article-parser.ts # Article-specific parsing (Draft.js)
│   └── media-resolver.ts # Media URL extraction and resolution
├── formatters/          # Output formatting
│   └── markdown-formatter.ts # Markdown conversion for articles
├── types/               # Type definitions
│   ├── index.ts         # Central type exports
│   ├── api.types.ts     # Zod schemas for API responses
│   ├── domain.types.ts  # Internal domain types
│   ├── output.types.ts  # Public output types (PostData)
│   └── draft.types.ts   # Draft.js type definitions
├── utils/               # Utility functions
│   ├── id-extractor.ts  # Post ID/URL parsing
│   └── errors.ts        # Custom error classes
└── index.ts             # Public API surface
```

### Core Flow

1. **ID Extraction** (`utils/id-extractor.ts`):
   - `extractPostId()` parses IDs from URLs or raw IDs
   - Supports both `/status/` and `/article/` paths
   - Validates input format

2. **Authentication** (`client/guest-auth.ts`):
   - `activateGuest()` obtains guest token from Twitter API
   - Handles authentication errors

3. **API Client** (`client/api-client.ts`):
   - `getPost()` fetches raw post data (combines auth + fetch)
   - `fetchPost()` makes GraphQL request with guest token
   - Uses Zod for response validation

4. **Post Parsing** (`parsers/post-parser.ts`):
   - `parsePost()` transforms raw API data to `PostData`
   - Handles both standard posts and article posts
   - Extracts author info, stats, media, quoted posts

5. **Article Parsing** (`parsers/article-parser.ts`):
   - Parses Draft.js content state from article posts
   - Converts blocks (text, image, video, divider) to structured format
   - Handles entity maps (links, embeds)

6. **Media Resolution** (`parsers/media-resolver.ts`):
   - `extractMediaUrls()` extracts images/videos from standard posts
   - `resolveArticleMediaUrls()` maps media IDs to URLs for articles
   - Selects best video quality

7. **URL Expansion** (`utils/url-expander.ts`):
   - `expandUrls()` replaces Twitter's t.co shortened URLs with original URLs
   - Uses URL entities from API response:
     - Regular posts: `legacy.entities.urls`
     - Note tweets (long-form): `note_tweet.note_tweet_results.result.entity_set.urls`
   - Removes media t.co links from text (they're displayed separately as images/videos)
   - Handles both standard posts and articles

8. **Markdown Formatting** (`formatters/markdown-formatter.ts`):
   - `applyInlineStyles()` converts Draft.js styles to markdown
   - `applyBlockStyle()` handles block-level formatting
   - Supports bold, italic, links, headers, blockquotes, lists

### Key Data Structures

**API Layer (Zod-validated)**:
- `Post` = `StandardPost | ArticlePost` (discriminated union)
- `StandardPost` - Regular posts with legacy data and optional note_tweet
- `ArticlePost` - Long-form articles with Draft.js content_state

**Output Layer**:
- `PostData` - Simplified, consumer-friendly format
- `type`: 'post' | 'article'
- `textType`: 'text' | 'markdown' (articles are markdown)
- Includes: `author`, `stats`, `images`, `videos`, `quotedPost`

### Twitter API Details

- **Authentication**: Guest token (public, no user credentials needed)
- **Endpoint**: `https://twitter.com/i/api/graphql/{queryId}/{operationName}`
- **Operation**: `TweetResultByRestId`
- **Bearer Token**: Hardcoded public token in `client/constants.ts`

See `docs/x_post_loading_process.md` for detailed API documentation.

## Public API

```typescript
// Main functions
getPost(idOrUrl: string): Promise<Post | null>
getPostData(idOrUrl: string): Promise<PostData | null>
transformPost(post: Post): PostData

// Utilities
extractPostId(idOrUrl: string): string
isValidPostId(id: string): boolean
isValidPostUrl(url: string): boolean

// Types
PostData, PostAuthor, PostStats
Post, StandardPost, ArticlePost

// Errors
XtractError, PostNotFoundError, AuthenticationError, ParseError, InvalidPostIdError
```

## Development Notes

### Type Safety
- All API responses validated with Zod schemas
- Strict TypeScript enabled
- Custom error classes for different failure modes
- No use of `any` in public APIs (internal parsers may use for flexibility)

### Testing
- Tests located in `/test` directory (separated from source)
- Run full test suite with `npm run test:run`
- All tests must pass before changes are considered complete

### Article Processing
- Articles use Draft.js format from Twitter
- Blocks contain text with inline styles and entity ranges
- Atomic blocks represent media/embeds
- Media resolution happens via `media_entities` array

### Module Boundaries
- **client/**: Network and authentication
- **parsers/**: Business logic and transformations
- **formatters/**: Output formatting
- **types/**: All type definitions (centralized)
- **utils/**: Pure utility functions

Each module has clear inputs/outputs and minimal dependencies.
