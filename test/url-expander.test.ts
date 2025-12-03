import { describe, it, expect } from 'vitest';
import { expandUrls } from '../src/utils/url-expander';

describe('expandUrls', () => {
  it('should expand regular t.co URLs to original URLs', () => {
    const text = 'Check out this link: https://t.co/abc123';
    const urlEntities = [
      {
        url: 'https://t.co/abc123',
        expanded_url: 'https://example.com/original-article',
        indices: [21, 43] as [number, number],
      },
    ];

    const result = expandUrls(text, urlEntities, []);

    expect(result).toBe('Check out this link: https://example.com/original-article');
  });

  it('should expand multiple t.co URLs', () => {
    const text = 'Links: https://t.co/abc123 and https://t.co/xyz789';
    const urlEntities = [
      {
        url: 'https://t.co/abc123',
        expanded_url: 'https://example.com/first',
        indices: [7, 29] as [number, number],
      },
      {
        url: 'https://t.co/xyz789',
        expanded_url: 'https://example.com/second',
        indices: [34, 56] as [number, number],
      },
    ];

    const result = expandUrls(text, urlEntities, []);

    expect(result).toBe('Links: https://example.com/first and https://example.com/second');
  });

  it('should remove media t.co URLs from text', () => {
    const text = 'Great photo! https://t.co/pic123';
    const mediaEntities = [
      {
        url: 'https://t.co/pic123',
        media_url_https: 'https://pbs.twimg.com/media/abc.jpg',
        indices: [13, 36] as [number, number],
      },
    ];

    const result = expandUrls(text, [], mediaEntities);

    expect(result).toBe('Great photo!');
  });

  it('should handle both URL and media entities together', () => {
    const text = 'Article: https://t.co/abc123 and image: https://t.co/pic456';
    const urlEntities = [
      {
        url: 'https://t.co/abc123',
        expanded_url: 'https://example.com/article',
        indices: [9, 31] as [number, number],
      },
    ];
    const mediaEntities = [
      {
        url: 'https://t.co/pic456',
        media_url_https: 'https://pbs.twimg.com/media/image.jpg',
        indices: [43, 66] as [number, number],
      },
    ];

    const result = expandUrls(text, urlEntities, mediaEntities);

    expect(result).toBe('Article: https://example.com/article and image:');
  });

  it('should return original text when no entities provided', () => {
    const text = 'Plain text without URLs';

    const result = expandUrls(text, [], []);

    expect(result).toBe('Plain text without URLs');
  });

  it('should return original text when entities are undefined', () => {
    const text = 'Text with no entities';

    const result = expandUrls(text);

    expect(result).toBe('Text with no entities');
  });

  it('should handle text with multiple spaces around media URLs', () => {
    const text = 'Check this out   https://t.co/pic123   ';
    const mediaEntities = [
      {
        url: 'https://t.co/pic123',
        media_url_https: 'https://pbs.twimg.com/media/abc.jpg',
        indices: [17, 40] as [number, number],
      },
    ];

    const result = expandUrls(text, [], mediaEntities);

    expect(result).toBe('Check this out');
  });

  it('should handle special characters in URLs', () => {
    const text = 'Read more: https://t.co/special123';
    const urlEntities = [
      {
        url: 'https://t.co/special123',
        expanded_url: 'https://example.com/article?id=123&ref=twitter',
        indices: [11, 36] as [number, number],
      },
    ];

    const result = expandUrls(text, urlEntities, []);

    expect(result).toBe('Read more: https://example.com/article?id=123&ref=twitter');
  });

  it('should handle Chinese text with URLs', () => {
    const text = "Lenny's Newsletter 的含金量还在上升 https://t.co/ZAnVDeLv4h";
    const mediaEntities = [
      {
        url: 'https://t.co/ZAnVDeLv4h',
        media_url_https: 'https://pbs.twimg.com/media/G7M8ZiMasAA9hB-.jpg',
        indices: [28, 51] as [number, number],
      },
    ];

    const result = expandUrls(text, [], mediaEntities);

    expect(result).toBe("Lenny's Newsletter 的含金量还在上升");
  });
});
