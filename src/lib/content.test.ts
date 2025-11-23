import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import type { PageContent } from '../types';

// Mock the database module
vi.mock('./db', () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
}));

// Helper to generate valid page content data for property tests
const pageContentArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 255 }),
  content: fc.string({ minLength: 1 }),
  metaDescription: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  metaKeywords: fc.option(fc.string({ maxLength: 255 }), { nil: undefined }),
  sidebarContent: fc.option(fc.string(), { nil: undefined }),
  updatedBy: fc.option(fc.string({ maxLength: 100 }), { nil: undefined })
});

describe('Page Content Data Access Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Unit Tests', () => {
    it('should get page content by slug', async () => {
      const { queryOne } = await import('./db');
      const { getPageContent } = await import('./content');
      
      const mockContent = {
        id: 1,
        slug: 'about-us',
        title: 'About Us',
        content: 'This is the about us page',
        updatedAt: new Date()
      };
      
      vi.mocked(queryOne).mockResolvedValueOnce(mockContent);
      
      const result = await getPageContent('about-us');
      
      expect(result).not.toBeNull();
      expect(result?.title).toBe('About Us');
      expect(result?.slug).toBe('about-us');
    });

    it('should return null for non-existent page', async () => {
      const { queryOne } = await import('./db');
      const { getPageContent } = await import('./content');
      
      vi.mocked(queryOne).mockResolvedValueOnce(null);
      
      const result = await getPageContent('non-existent');
      
      expect(result).toBeNull();
    });

    it('should create new page content when slug does not exist', async () => {
      const { queryOne } = await import('./db');
      const { updatePageContent } = await import('./content');
      
      const contentData = {
        title: 'New Page',
        content: 'Page content',
        metaDescription: 'Description',
        metaKeywords: 'keywords',
        sidebarContent: 'Sidebar',
        updatedBy: 'admin'
      };
      
      // First call: getPageContent returns null (page doesn't exist)
      vi.mocked(queryOne).mockResolvedValueOnce(null);
      
      // Second call: INSERT returns the created page
      const mockCreated = {
        id: 1,
        slug: 'new-page',
        ...contentData,
        updatedAt: new Date()
      };
      vi.mocked(queryOne).mockResolvedValueOnce(mockCreated);
      
      const result = await updatePageContent('new-page', contentData);
      
      expect(result.id).toBe(1);
      expect(result.title).toBe('New Page');
      expect(result.slug).toBe('new-page');
    });

    it('should update existing page content', async () => {
      const { queryOne } = await import('./db');
      const { updatePageContent } = await import('./content');
      
      const existingContent = {
        id: 1,
        slug: 'existing-page',
        title: 'Old Title',
        content: 'Old content',
        updatedAt: new Date()
      };
      
      const updatedData = {
        title: 'Updated Title',
        content: 'Updated content',
        metaDescription: 'New description'
      };
      
      // First call: getPageContent returns existing page
      vi.mocked(queryOne).mockResolvedValueOnce(existingContent);
      
      // Second call: UPDATE returns the updated page
      const mockUpdated = {
        ...existingContent,
        ...updatedData,
        updatedAt: new Date()
      };
      vi.mocked(queryOne).mockResolvedValueOnce(mockUpdated);
      
      const result = await updatePageContent('existing-page', updatedData);
      
      expect(result.title).toBe('Updated Title');
      expect(result.content).toBe('Updated content');
    });
  });

  describe('Property Tests', () => {
    // Feature: university-website-clone, Property 4: Content storage round trip
    // Validates: Requirements 3.3
    it('should store and retrieve page content with all fields intact', async () => {
      const { queryOne } = await import('./db');
      const { updatePageContent, getPageContent } = await import('./content');
      
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 255 }).map(s => s.replace(/[^a-z0-9-]/gi, '-').toLowerCase()),
          pageContentArbitrary,
          async (slug, contentData) => {
            // Mock the database responses to simulate round trip
            const mockStoredContent: PageContent = {
              id: Math.floor(Math.random() * 10000),
              slug: slug,
              title: contentData.title,
              content: contentData.content,
              metaDescription: contentData.metaDescription,
              metaKeywords: contentData.metaKeywords,
              sidebarContent: contentData.sidebarContent,
              updatedAt: new Date(),
              updatedBy: contentData.updatedBy
            };
            
            // Mock getPageContent (called by updatePageContent) - returns null for new page
            vi.mocked(queryOne).mockResolvedValueOnce(null);
            
            // Mock INSERT query (called by updatePageContent)
            vi.mocked(queryOne).mockResolvedValueOnce(mockStoredContent);
            
            // Mock getPageContent for retrieval
            vi.mocked(queryOne).mockResolvedValueOnce(mockStoredContent);
            
            // Store the content
            const stored = await updatePageContent(slug, contentData);
            
            // Retrieve it
            const retrieved = await getPageContent(slug);
            
            // Verify all fields are intact
            expect(retrieved).not.toBeNull();
            expect(retrieved?.id).toBe(stored.id);
            expect(retrieved?.slug).toBe(slug);
            expect(retrieved?.title).toBe(contentData.title);
            expect(retrieved?.content).toBe(contentData.content);
            expect(retrieved?.metaDescription).toBe(contentData.metaDescription);
            expect(retrieved?.metaKeywords).toBe(contentData.metaKeywords);
            expect(retrieved?.sidebarContent).toBe(contentData.sidebarContent);
            expect(retrieved?.updatedBy).toBe(contentData.updatedBy);
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: university-website-clone, Property 5: Content retrieval and rendering
    // Validates: Requirements 3.4
    it('should retrieve content and display all stored fields correctly', async () => {
      const { queryOne } = await import('./db');
      const { getPageContent } = await import('./content');
      
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 255 }).map(s => s.replace(/[^a-z0-9-]/gi, '-').toLowerCase()),
          pageContentArbitrary,
          async (slug, contentData) => {
            // Mock stored content in database
            const mockStoredContent: PageContent = {
              id: Math.floor(Math.random() * 10000),
              slug: slug,
              title: contentData.title,
              content: contentData.content,
              metaDescription: contentData.metaDescription,
              metaKeywords: contentData.metaKeywords,
              sidebarContent: contentData.sidebarContent,
              updatedAt: new Date(),
              updatedBy: contentData.updatedBy
            };
            
            // Mock getPageContent
            vi.mocked(queryOne).mockResolvedValueOnce(mockStoredContent);
            
            // Retrieve the content
            const retrieved = await getPageContent(slug);
            
            // Verify all fields are present and correct for rendering
            expect(retrieved).not.toBeNull();
            
            // All required fields should be present
            expect(retrieved?.title).toBeDefined();
            expect(retrieved?.content).toBeDefined();
            expect(retrieved?.slug).toBeDefined();
            
            // All fields should match what was stored
            expect(retrieved?.title).toBe(contentData.title);
            expect(retrieved?.content).toBe(contentData.content);
            expect(retrieved?.slug).toBe(slug);
            
            // Optional fields should be preserved (even if undefined)
            if (contentData.metaDescription !== undefined) {
              expect(retrieved?.metaDescription).toBe(contentData.metaDescription);
            }
            if (contentData.metaKeywords !== undefined) {
              expect(retrieved?.metaKeywords).toBe(contentData.metaKeywords);
            }
            if (contentData.sidebarContent !== undefined) {
              expect(retrieved?.sidebarContent).toBe(contentData.sidebarContent);
            }
            if (contentData.updatedBy !== undefined) {
              expect(retrieved?.updatedBy).toBe(contentData.updatedBy);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
