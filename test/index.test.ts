import { describe, it, expect } from 'vitest';
import { getPost, getPostData, extractPostId } from '../src/index';
import { Post } from '../src/types';

describe('utils', () => {
  it('should extract post ID from URL', () => {
    expect(extractPostId('https://twitter.com/user/status/123456')).toBe('123456');
    expect(extractPostId('https://x.com/user/status/123456?s=20')).toBe('123456');
    expect(extractPostId('https://x.com/i/article/1863039430268506540')).toBe('1863039430268506540');
    expect(extractPostId('123456')).toBe('123456');
  });

  it('should throw on invalid input', () => {
    expect(() => extractPostId('invalid')).toThrow();
    expect(() => extractPostId('https://google.com')).toThrow();
  });
});

describe('xtract', () => {
  it('should fetch a real post', async () => {
    // Jack's first tweet
    const postId = '20';
    const post = await getPost(postId);

    expect(post).toBeDefined();
    expect(post?.rest_id).toBe(postId);
    expect((post as any)?.legacy.full_text).toContain('just setting up my twttr');
    expect(post?.core.user_results.result.core.screen_name).toBe('jack');
  });

  it('should fetch and parse post data', async () => {
    const postId = '20';
    const postData = await getPostData(postId);

    expect(postData).toBeDefined();
    expect(postData?.id).toBe(postId);
    expect(postData?.text).toContain('just setting up my twttr');
    expect(postData?.author.screenName).toBe('jack');
    expect(postData?.type).toBe('post');
  });
});
