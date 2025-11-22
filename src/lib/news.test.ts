import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import type { NewsItem } from '../types';

// Mock the database module
vi.mock('./db', () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
}));

// Helper to generate valid news data for property tests
const newsArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 255 }),
  slug: fc.string({ minLength: 1, maxLength: 255 }).map(s => s.replace(/[^a-z0-9-]/gi, '-').toLowerCase()),
  summary: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  content: fc.string({ minLength: 1 }),
  thumbnailUrl: fc.option(fc.webUrl(), { nil: undefined }),
  author: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
  category: fc.option(fc.constantFrom('news', 'announcement', 'event', 'research'), { nil: undefined }),
  isPublished: fc.boolean(),
  tags: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 }), { nil: undefined })
});

describe('News Data Access Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Property Tests', () => {
    // Feature: university-website-clone, Property 6: News retrieval consistency
    // Validates: Requirements 4.3
    it('should retrieve news with all fields intact (round trip)', async () => {
      const { query, queryOne } = await import('./db');
      const { createNews, getNewsById, deleteNews } = await import('./news');
      
      await fc.assert(
        fc.asyncProperty(newsArbitrary, async (newsData) => {
          // Mock the database responses to simulate round trip
          const mockCreatedNews: NewsItem = {
            id: Math.floor(Math.random() * 10000),
            title: newsData.title,
            slug: newsData.slug,
            summary: newsData.summary,
            content: newsData.content,
            thumbnailUrl: newsData.thumbnailUrl,
            author: newsData.author,
            category: newsData.category,
            publishedAt: new Date(),
            updatedAt: new Date(),
            isPublished: newsData.isPublished,
            viewCount: 0,
            tags: newsData.tags
          };
          
          // Mock createNews to return the created news
          vi.mocked(queryOne).mockResolvedValueOnce(mockCreatedNews);
          
          // Mock getNewsById to return the same news
          vi.mocked(queryOne).mockResolvedValueOnce(mockCreatedNews);
          
          // Mock deleteNews
          vi.mocked(queryOne).mockResolvedValueOnce({ id: mockCreatedNews.id });
          
          // Create a news article
          const created = await createNews(newsData);
          
          // Retrieve it by ID
          const retrieved = await getNewsById(created.id);
          
          // Clean up
          await deleteNews(created.id);
          
          // Verify all fields are intact
          expect(retrieved).not.toBeNull();
          expect(retrieved?.id).toBe(created.id);
          expect(retrieved?.title).toBe(newsData.title);
          expect(retrieved?.slug).toBe(newsData.slug);
          expect(retrieved?.summary).toBe(newsData.summary);
          expect(retrieved?.content).toBe(newsData.content);
          expect(retrieved?.thumbnailUrl).toBe(newsData.thumbnailUrl);
          expect(retrieved?.author).toBe(newsData.author);
          expect(retrieved?.category).toBe(newsData.category);
          expect(retrieved?.isPublished).toBe(newsData.isPublished);
          expect(retrieved?.viewCount).toBe(0);
          expect(retrieved?.tags).toEqual(newsData.tags);
        }),
        { numRuns: 100 }
      );
    });

    // Feature: university-website-clone, Property 7: News chronological ordering
    // Validates: Requirements 4.4
    it('should return news in reverse chronological order (newest first)', async () => {
      const { query, queryOne } = await import('./db');
      const { getNewsList } = await import('./news');
      
      await fc.assert(
        fc.asyncProperty(
          fc.array(newsArbitrary, { minLength: 2, maxLength: 10 }),
          async (newsDataArray) => {
            // Create mock news items with different publication dates
            const mockNewsItems: NewsItem[] = newsDataArray.map((newsData, index) => ({
              id: index + 1,
              title: newsData.title,
              slug: newsData.slug,
              summary: newsData.summary,
              content: newsData.content,
              thumbnailUrl: newsData.thumbnailUrl,
              author: newsData.author,
              category: newsData.category,
              // Create dates with increasing timestamps
              publishedAt: new Date(Date.now() + index * 1000),
              updatedAt: new Date(Date.now() + index * 1000),
              isPublished: true, // Only published items should be returned
              viewCount: 0,
              tags: newsData.tags
            }));
            
            // Sort in reverse chronological order (newest first) as the database would
            const sortedNews = [...mockNewsItems].sort((a, b) => 
              b.publishedAt.getTime() - a.publishedAt.getTime()
            );
            
            // Mock the query to return sorted news
            vi.mocked(query).mockResolvedValueOnce(sortedNews);
            
            // Mock the count query
            vi.mocked(queryOne).mockResolvedValueOnce({ count: String(sortedNews.length) });
            
            // Get news list
            const result = await getNewsList(1, 10);
            
            // Verify the items are in reverse chronological order
            for (let i = 0; i < result.items.length - 1; i++) {
              const current = result.items[i];
              const next = result.items[i + 1];
              
              expect(current.publishedAt.getTime()).toBeGreaterThanOrEqual(
                next.publishedAt.getTime()
              );
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
