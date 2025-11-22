import { query, queryOne } from './db';
import type { NewsItem } from '../types';

/**
 * Get a paginated list of news articles
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of items per page
 * @param category - Optional category filter
 * @returns Promise resolving to array of news items and total count
 */
export async function getNewsList(
  page: number = 1,
  pageSize: number = 10,
  category?: string
): Promise<{ items: NewsItem[]; total: number }> {
  const offset = (page - 1) * pageSize;
  
  let queryText = `
    SELECT id, title, slug, summary, content, thumbnail_url as "thumbnailUrl",
           author, category, published_at as "publishedAt", updated_at as "updatedAt",
           is_published as "isPublished", view_count as "viewCount", tags
    FROM news
    WHERE is_published = true
  `;
  
  const params: any[] = [];
  
  if (category) {
    queryText += ` AND category = $${params.length + 1}`;
    params.push(category);
  }
  
  queryText += ` ORDER BY published_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(pageSize, offset);
  
  const items = await query<NewsItem>(queryText, params);
  
  // Get total count
  let countQuery = 'SELECT COUNT(*) as count FROM news WHERE is_published = true';
  const countParams: any[] = [];
  
  if (category) {
    countQuery += ' AND category = $1';
    countParams.push(category);
  }
  
  const countResult = await queryOne<{ count: string }>(countQuery, countParams);
  const total = countResult ? parseInt(countResult.count, 10) : 0;
  
  return { items, total };
}

/**
 * Get a single news article by ID
 * @param id - News article ID
 * @returns Promise resolving to news item or null if not found
 */
export async function getNewsById(id: number): Promise<NewsItem | null> {
  const queryText = `
    SELECT id, title, slug, summary, content, thumbnail_url as "thumbnailUrl",
           author, category, published_at as "publishedAt", updated_at as "updatedAt",
           is_published as "isPublished", view_count as "viewCount", tags
    FROM news
    WHERE id = $1
  `;
  
  return await queryOne<NewsItem>(queryText, [id]);
}

/**
 * Get a single news article by slug
 * @param slug - News article slug
 * @returns Promise resolving to news item or null if not found
 */
export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const queryText = `
    SELECT id, title, slug, summary, content, thumbnail_url as "thumbnailUrl",
           author, category, published_at as "publishedAt", updated_at as "updatedAt",
           is_published as "isPublished", view_count as "viewCount", tags
    FROM news
    WHERE slug = $1
  `;
  
  return await queryOne<NewsItem>(queryText, [slug]);
}

/**
 * Create a new news article
 * @param news - News article data (without id)
 * @returns Promise resolving to the created news item
 */
export async function createNews(
  news: Omit<NewsItem, 'id' | 'viewCount' | 'publishedAt' | 'updatedAt'>
): Promise<NewsItem> {
  const queryText = `
    INSERT INTO news (
      title, slug, summary, content, thumbnail_url, author, category,
      is_published, tags
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, title, slug, summary, content, thumbnail_url as "thumbnailUrl",
              author, category, published_at as "publishedAt", updated_at as "updatedAt",
              is_published as "isPublished", view_count as "viewCount", tags
  `;
  
  const params = [
    news.title,
    news.slug,
    news.summary || null,
    news.content,
    news.thumbnailUrl || null,
    news.author || null,
    news.category || null,
    news.isPublished,
    news.tags || null
  ];
  
  const result = await queryOne<NewsItem>(queryText, params);
  
  if (!result) {
    throw new Error('Failed to create news article');
  }
  
  return result;
}

/**
 * Update an existing news article
 * @param id - News article ID
 * @param news - Partial news article data to update
 * @returns Promise resolving to the updated news item or null if not found
 */
export async function updateNews(
  id: number,
  news: Partial<Omit<NewsItem, 'id' | 'viewCount' | 'publishedAt' | 'updatedAt'>>
): Promise<NewsItem | null> {
  const fields: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;
  
  if (news.title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    params.push(news.title);
  }
  if (news.slug !== undefined) {
    fields.push(`slug = $${paramIndex++}`);
    params.push(news.slug);
  }
  if (news.summary !== undefined) {
    fields.push(`summary = $${paramIndex++}`);
    params.push(news.summary);
  }
  if (news.content !== undefined) {
    fields.push(`content = $${paramIndex++}`);
    params.push(news.content);
  }
  if (news.thumbnailUrl !== undefined) {
    fields.push(`thumbnail_url = $${paramIndex++}`);
    params.push(news.thumbnailUrl);
  }
  if (news.author !== undefined) {
    fields.push(`author = $${paramIndex++}`);
    params.push(news.author);
  }
  if (news.category !== undefined) {
    fields.push(`category = $${paramIndex++}`);
    params.push(news.category);
  }
  if (news.isPublished !== undefined) {
    fields.push(`is_published = $${paramIndex++}`);
    params.push(news.isPublished);
  }
  if (news.tags !== undefined) {
    fields.push(`tags = $${paramIndex++}`);
    params.push(news.tags);
  }
  
  if (fields.length === 0) {
    return await getNewsById(id);
  }
  
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  params.push(id);
  
  const queryText = `
    UPDATE news
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, title, slug, summary, content, thumbnail_url as "thumbnailUrl",
              author, category, published_at as "publishedAt", updated_at as "updatedAt",
              is_published as "isPublished", view_count as "viewCount", tags
  `;
  
  return await queryOne<NewsItem>(queryText, params);
}

/**
 * Delete a news article
 * @param id - News article ID
 * @returns Promise resolving to true if deleted, false if not found
 */
export async function deleteNews(id: number): Promise<boolean> {
  const queryText = 'DELETE FROM news WHERE id = $1 RETURNING id';
  const result = await queryOne<{ id: number }>(queryText, [id]);
  return result !== null;
}

/**
 * Increment the view count for a news article
 * @param id - News article ID
 * @returns Promise resolving to void
 */
export async function incrementViewCount(id: number): Promise<void> {
  const queryText = 'UPDATE news SET view_count = view_count + 1 WHERE id = $1';
  await query(queryText, [id]);
}
