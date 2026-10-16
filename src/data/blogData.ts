import { getAllPosts, getCategories, type Author, type Post, type Category, type TocItem } from '../lib/posts';

export * from '../lib/posts';

import authorsData from './authors.json';

export const authors: Record<string, Author> = authorsData as Record<string, Author>;

/**
 * Real repository posts loaded directly from src/content/posts/*.md
 * Zero dummy data: only markdown files committed to the repository are displayed.
 */
export const posts: Post[] = getAllPosts();

/**
 * Real repository categories dynamically computed with accurate counts
 */
export const categories: Category[] = getCategories();
