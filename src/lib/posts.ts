const WORDS_PER_MINUTE = 220;

/** Estimated reading time in whole minutes (at least 1), counting every word of the raw Markdown. */
export function readingTime(markdown: string): number {
  const words = markdown.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Posts to show, newest first. Drafts are dropped unless `includeDrafts` is set. */
export function publishedPosts<T extends { data: { pubDate: Date; draft: boolean } }>(
  posts: readonly T[],
  opts: { includeDrafts?: boolean } = {},
): T[] {
  return posts
    .filter((post) => opts.includeDrafts || !post.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}
