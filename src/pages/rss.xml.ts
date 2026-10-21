import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { publishedPosts } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = publishedPosts(await getCollection('blog'));
  return rss({
    title: 'A. K. M. Rakinuzzaman — Blog',
    description: 'Writing on building and debugging production software.',
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
  });
}
