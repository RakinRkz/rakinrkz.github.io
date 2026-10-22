import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { publishedPosts } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = publishedPosts(await getCollection('blog'));
  const feedUrl = new URL('/rss.xml', context.site);
  return rss({
    title: 'A. K. M. Rakinuzzaman — Blog',
    description: 'Writing on building and debugging production software.',
    site: context.site!,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
  });
}
