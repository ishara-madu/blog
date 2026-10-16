import { getAllPosts, getCategories, type Author, type Post, type Category, type TocItem } from '../lib/posts';

export * from '../lib/posts';

export const authors: Record<string, Author> = {
  ishara: {
    name: 'Ishara Madushanka',
    role: 'Lead Publisher & Systems Architect',
    avatar: '/images/authors/author-ishara.jpg',
    handle: '@ishara-madu',
    bio: 'Founder and publisher of The Dispatched. Focuses on distributed architectures, edge computing, and minimalist software craftsmanship.',
  },
  kasun: {
    name: 'Kasun Perera',
    role: 'Principal Systems Architect',
    avatar: '/images/authors/author-kasun.jpg',
    handle: '@kasunp',
    bio: 'Designs distributed storage engines, low-latency consensus protocols, and resilient multi-region infrastructure.',
  },
  dilini: {
    name: 'Dilini Jayawardena',
    role: 'Staff AI Research Engineer',
    avatar: '/images/authors/author-dilini.jpg',
    handle: '@dilinij',
    bio: 'Specializes in small language model quantization, speculative decoding, and deploying on-device neural reasoning engines.',
  },
  nuwan: {
    name: 'Nuwan Senanayake',
    role: 'Lead Product Designer',
    avatar: '/images/authors/author-nuwan.jpg',
    handle: '@nuwans',
    bio: 'Designs typographic design systems, zero-bloat user interfaces, and intentional product aesthetics.',
  },
};

/**
 * Real repository posts loaded directly from src/content/posts/*.md
 * Zero dummy data: only markdown files committed to the repository are displayed.
 */
export const posts: Post[] = getAllPosts();

/**
 * Real repository categories dynamically computed with accurate counts
 */
export const categories: Category[] = getCategories();
