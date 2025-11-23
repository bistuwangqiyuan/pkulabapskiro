import { query, queryOne } from './db';
import type { PageContent } from '../types';

/**
 * Get page content by slug
 * @param slug - Page slug identifier
 * @returns Promise resolving to page content or null if not found
 */
export async function getPageContent(slug: string): Promise<PageContent | null> {
  const queryText = `
    SELECT id, slug, title, content, 
           meta_description as "metaDescription",
           meta_keywords as "metaKeywords",
           sidebar_content as "sidebarContent",
           updated_at as "updatedAt",
           updated_by as "updatedBy"
    FROM page_content
    WHERE slug = $1
  `;
  
  return await queryOne<PageContent>(queryText, [slug]);
}

/**
 * Update page content by slug (creates if doesn't exist)
 * @param slug - Page slug identifier
 * @param content - Page content data to update
 * @returns Promise resolving to the updated page content
 */
export async function updatePageContent(
  slug: string,
  content: Omit<PageContent, 'id' | 'slug' | 'updatedAt'>
): Promise<PageContent> {
  // Check if page exists
  const existing = await getPageContent(slug);
  
  if (existing) {
    // Update existing page
    const queryText = `
      UPDATE page_content
      SET title = $1,
          content = $2,
          meta_description = $3,
          meta_keywords = $4,
          sidebar_content = $5,
          updated_by = $6,
          updated_at = CURRENT_TIMESTAMP
      WHERE slug = $7
      RETURNING id, slug, title, content,
                meta_description as "metaDescription",
                meta_keywords as "metaKeywords",
                sidebar_content as "sidebarContent",
                updated_at as "updatedAt",
                updated_by as "updatedBy"
    `;
    
    const params = [
      content.title,
      content.content,
      content.metaDescription || null,
      content.metaKeywords || null,
      content.sidebarContent || null,
      content.updatedBy || null,
      slug
    ];
    
    const result = await queryOne<PageContent>(queryText, params);
    
    if (!result) {
      throw new Error('Failed to update page content');
    }
    
    return result;
  } else {
    // Create new page
    const queryText = `
      INSERT INTO page_content (
        slug, title, content, meta_description, meta_keywords,
        sidebar_content, updated_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, slug, title, content,
                meta_description as "metaDescription",
                meta_keywords as "metaKeywords",
                sidebar_content as "sidebarContent",
                updated_at as "updatedAt",
                updated_by as "updatedBy"
    `;
    
    const params = [
      slug,
      content.title,
      content.content,
      content.metaDescription || null,
      content.metaKeywords || null,
      content.sidebarContent || null,
      content.updatedBy || null
    ];
    
    const result = await queryOne<PageContent>(queryText, params);
    
    if (!result) {
      throw new Error('Failed to create page content');
    }
    
    return result;
  }
}
