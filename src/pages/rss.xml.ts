import type { APIRoute } from 'astro';
import { getAllPosts } from '../lib/posts';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const posts = getAllPosts();
  const siteUrl = site?.toString() || 'https://blog.dispatched.dev';

  const rssItems = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/posts/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/posts/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <category>${post.category}</category>
      <author>${post.author.name}</author>
      <pubDate>${new Date(post.publishedAt || Date.now()).toUTCString()}</pubDate>
    </item>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Dispatched</title>
    <link>${siteUrl}</link>
    <description>Critical essays and technical monographs on distributed systems architecture, artificial intelligence, and software craftsmanship.</description>
    <language>en-us</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(xml.trim(), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
