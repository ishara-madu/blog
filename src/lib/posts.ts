import path from 'node:path';
import authorsData from '../data/authors.json';

export interface Author {
  name: string;
  role: string;
  avatar: string;
  handle: string;
  bio: string;
  followUrl?: string;
}

export interface TocItem {
  id: string;
  title: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  coverAlt: string;
  category: string;
  categorySlug: string;
  categoryColor: string;
  publishedAt: string;
  readTime: string;
  featured?: boolean;
  trending?: boolean;
  author: Author;
  tags: string[];
  toc?: TocItem[];
  content: string;
  htmlContent?: string;
  Content?: any;
}

export interface Category {
  name: string;
  slug: string;
  description: string;
  count: number;
  color: string;
  icon: string;
}

interface MarkdownInstance {
  frontmatter: Record<string, any>;
  file: string;
  rawContent: () => string;
  compiledContent: () => string;
  Content: any;
}

// Category metadata definitions
const CATEGORY_META: Record<string, { description: string; color: string; icon: string }> = {
  'technology-ai': {
    description: 'Neural architectures, compact reasoning models, and edge inference systems.',
    color: 'bg-emerald-500',
    icon: 'cpu',
  },
  architecture: {
    description: 'Resilient distributed systems, low-latency replication, and zero-downtime topology.',
    color: 'bg-blue-500',
    icon: 'stack',
  },
  design: {
    description: 'Minimalist design systems, typographic rigor, and purposeful interactions.',
    color: 'bg-amber-500',
    icon: 'palette',
  },
  'cloud-devops': {
    description: 'Declarative infra, ephemeral compute clusters, and hardened network fabric.',
    color: 'bg-indigo-500',
    icon: 'cloud-check',
  },
  culture: {
    description: 'Engineering craft, sustainable pace, and high-discipline software cultures.',
    color: 'bg-purple-500',
    icon: 'compass',
  },
};

/**
 * Load all posts dynamically from Markdown files in the repository (src/content/posts/*.md)
 */
export function getAllPosts(): Post[] {
  const modules = import.meta.glob<MarkdownInstance>('../content/posts/*.md', {
    eager: true,
  });

  const posts: Post[] = Object.entries(modules).map(([filePath, mod]) => {
    const filename = path.basename(filePath);
    const slug = filename.replace(/\.md$/, '');
    const fm = mod.frontmatter || {};

    const raw = typeof mod.rawContent === 'function' ? mod.rawContent() : '';
    const compiled = typeof mod.compiledContent === 'function' ? mod.compiledContent() : '';

    // Auto-generate TOC from headings in content
    const toc: TocItem[] = [];
    const headingRegex = /<h2[^>]*id="([^"]+)"[^>]*>(.*?)<\/h2>|##\s+([^\n]+)/gi;
    let match: RegExpExecArray | null;
    while ((match = headingRegex.exec(raw || compiled)) !== null) {
      if (match[1] && match[2]) {
        toc.push({ id: match[1], title: match[2].replace(/<[^>]+>/g, '').trim() });
      } else if (match[3]) {
        const title = match[3].trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        toc.push({ id, title });
      }
    }

    return {
      id: slug,
      slug,
      title: fm.title || slug,
      excerpt: fm.excerpt || '',
      coverImage: fm.coverImage || `/images/posts/${slug}.jpg`,
      coverAlt: fm.coverAlt || fm.title || slug,
      category: fm.category || 'Engineering',
      categorySlug: fm.categorySlug || 'technology-ai',
      categoryColor: fm.categoryColor || 'bg-emerald-500',
      publishedAt: fm.publishedAt || 'October 2026',
      readTime: fm.readTime || '6 min read',
      featured: Boolean(fm.featured || slug.includes('edge-ai') || slug.includes('future-of-multimodal')),
      trending: Boolean(fm.trending || slug.includes('zero-latency') || slug.includes('minimalist-design')),
      author: (() => {
        const matchingAuthor = Object.values(authorsData as Record<string, any>).find(
          (a: any) =>
            a.name?.toLowerCase() === fm.author?.name?.toLowerCase() ||
            a.handle?.toLowerCase() === fm.author?.handle?.toLowerCase()
        );
        return {
          name: fm.author?.name || matchingAuthor?.name || 'Ishara Madushanka',
          role: fm.author?.role || matchingAuthor?.role || 'Principal Systems Architect',
          avatar: fm.author?.avatar || matchingAuthor?.avatar || '/images/authors/author-ishara.jpg',
          handle: fm.author?.handle || matchingAuthor?.handle || '@ishara-madu',
          followUrl: fm.author?.followUrl || matchingAuthor?.followUrl || 'https://github.com/ishara-madu',
          bio:
            fm.author?.bio ||
            matchingAuthor?.bio ||
            'Owner and lead engineer of The Dispatched. Focuses on distributed architectures, low-latency systems, and minimalist software craftsmanship.',
        };
      })(),
      tags: Array.isArray(fm.tags) ? fm.tags : ['Engineering'],
      toc: toc.length > 0 ? toc : undefined,
      content: raw,
      htmlContent: compiled,
      Content: mod.Content,
    };
  });

  // Sort by date / featured first
  return posts.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });
}

/**
 * Get a single post by its slug from the repository
 */
export function getPostBySlug(slug: string): Post | undefined {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug);
}

/**
 * Compute real category counts dynamically from repository posts
 */
export function getCategories(): Category[] {
  const posts = getAllPosts();
  const counts: Record<string, number> = {};
  const names: Record<string, string> = {};

  posts.forEach((p) => {
    counts[p.categorySlug] = (counts[p.categorySlug] || 0) + 1;
    if (!names[p.categorySlug]) {
      names[p.categorySlug] = p.category;
    }
  });

  return Object.keys(CATEGORY_META).map((slug) => {
    const meta = CATEGORY_META[slug];
    return {
      slug,
      name: names[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      description: meta.description,
      count: counts[slug] || 0,
      color: meta.color,
      icon: meta.icon,
    };
  });
}

/**
 * Filter repository posts by category slug
 */
export function getPostsByCategory(categorySlug: string): Post[] {
  return getAllPosts().filter((p) => p.categorySlug === categorySlug);
}
