import { describe, it, expect } from 'vitest';
import { publishedPosts, readingTime } from '../src/lib/posts';

const post = (id: string, date: string, draft = false) => ({ id, data: { pubDate: new Date(date), draft } });
const posts = [post('a', '2026-01-01'), post('b', '2026-03-01'), post('c', '2026-02-01', true)];

describe('publishedPosts', () => {
  it('drops drafts and sorts newest first', () => {
    expect(publishedPosts(posts).map(p => p.id)).toEqual(['b', 'a']);
  });
  it('keeps drafts when asked', () => {
    expect(publishedPosts(posts, { includeDrafts: true }).map(p => p.id)).toEqual(['b', 'c', 'a']);
  });
  it('does not reorder its input', () => {
    publishedPosts(posts);
    expect(posts.map(p => p.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('readingTime', () => {
  it('is at least one minute', () => {
    expect(readingTime('')).toBe(1);
    expect(readingTime('word '.repeat(100))).toBe(1);
  });
  it('rounds words / 220 to the nearest minute', () => {
    expect(readingTime('word '.repeat(330))).toBe(2);
    expect(readingTime('word '.repeat(440))).toBe(2);
    expect(readingTime('word '.repeat(770))).toBe(4);
  });
});
