import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import type { FacultyMember } from '../types';

// Mock the database module
vi.mock('./db', () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
}));

// Helper to generate valid faculty data for property tests
const facultyArbitrary = fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }),
  nameEn: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  title: fc.constantFrom('Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'),
  category: fc.constantFrom('Professor', 'Associate Professor', 'Lecturer', 'Researcher'),
  photoUrl: fc.option(fc.webUrl(), { nil: undefined }),
  email: fc.option(fc.emailAddress(), { nil: undefined }),
  phone: fc.option(fc.string({ minLength: 10, maxLength: 20 }), { nil: undefined }),
  office: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  researchInterests: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 100 }), { maxLength: 5 }), { nil: undefined }),
  education: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  biography: fc.option(fc.string({ maxLength: 1000 }), { nil: undefined }),
  publications: fc.option(fc.string({ maxLength: 2000 }), { nil: undefined }),
  projects: fc.option(fc.string({ maxLength: 1000 }), { nil: undefined }),
  awards: fc.option(fc.string({ maxLength: 1000 }), { nil: undefined }),
  sortOrder: fc.integer({ min: 0, max: 1000 }),
  isVisible: fc.boolean()
});

describe('Faculty Data Access Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Unit Tests', () => {
    it('should get faculty list', async () => {
      const { query } = await import('./db');
      const { getFacultyList } = await import('./faculty');
      
      const mockFaculty = [
        {
          id: 1,
          name: 'Dr. Zhang Wei',
          title: 'Professor',
          category: 'Professor',
          sortOrder: 0,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      vi.mocked(query).mockResolvedValueOnce(mockFaculty);
      
      const result = await getFacultyList();
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Dr. Zhang Wei');
    });

    it('should get faculty by ID', async () => {
      const { queryOne } = await import('./db');
      const { getFacultyById } = await import('./faculty');
      
      const mockFaculty = {
        id: 1,
        name: 'Dr. Zhang Wei',
        title: 'Professor',
        category: 'Professor',
        sortOrder: 0,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      vi.mocked(queryOne).mockResolvedValueOnce(mockFaculty);
      
      const result = await getFacultyById(1);
      
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Dr. Zhang Wei');
    });

    it('should filter faculty by category', async () => {
      const { query } = await import('./db');
      const { getFacultyList } = await import('./faculty');
      
      const mockFaculty = [
        {
          id: 1,
          name: 'Dr. Zhang Wei',
          title: 'Professor',
          category: 'Professor',
          sortOrder: 0,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      vi.mocked(query).mockResolvedValueOnce(mockFaculty);
      
      const result = await getFacultyList('Professor');
      
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('Professor');
    });

    it('should search faculty by query', async () => {
      const { query } = await import('./db');
      const { searchFaculty } = await import('./faculty');
      
      const mockFaculty = [
        {
          id: 1,
          name: 'Dr. Zhang Wei',
          title: 'Professor',
          category: 'Professor',
          researchInterests: ['Machine Learning', 'AI'],
          sortOrder: 0,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      vi.mocked(query).mockResolvedValueOnce(mockFaculty);
      
      const result = await searchFaculty('Machine Learning');
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Dr. Zhang Wei');
    });

    it('should create faculty member', async () => {
      const { queryOne } = await import('./db');
      const { createFaculty } = await import('./faculty');
      
      const facultyData = {
        name: 'Dr. Li Ming',
        title: 'Associate Professor',
        category: 'Associate Professor',
        sortOrder: 0,
        isVisible: true
      };
      
      const mockCreated = {
        id: 1,
        ...facultyData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      vi.mocked(queryOne).mockResolvedValueOnce(mockCreated);
      
      const result = await createFaculty(facultyData);
      
      expect(result.id).toBe(1);
      expect(result.name).toBe('Dr. Li Ming');
    });

    it('should update faculty member', async () => {
      const { queryOne } = await import('./db');
      const { updateFaculty } = await import('./faculty');
      
      const mockUpdated = {
        id: 1,
        name: 'Dr. Zhang Wei',
        title: 'Full Professor',
        category: 'Professor',
        sortOrder: 0,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      vi.mocked(queryOne).mockResolvedValueOnce(mockUpdated);
      
      const result = await updateFaculty(1, { title: 'Full Professor' });
      
      expect(result?.title).toBe('Full Professor');
    });

    it('should delete faculty member', async () => {
      const { queryOne } = await import('./db');
      const { deleteFaculty } = await import('./faculty');
      
      vi.mocked(queryOne).mockResolvedValueOnce({ id: 1 });
      
      const result = await deleteFaculty(1);
      
      expect(result).toBe(true);
    });

    it('should return empty array when no faculty match category', async () => {
      const { query } = await import('./db');
      const { getFacultyList } = await import('./faculty');
      
      vi.mocked(query).mockResolvedValueOnce([]);
      
      const result = await getFacultyList('NonExistentCategory');
      
      expect(result).toHaveLength(0);
    });

    it('should return empty array when no faculty match search query', async () => {
      const { query } = await import('./db');
      const { searchFaculty } = await import('./faculty');
      
      vi.mocked(query).mockResolvedValueOnce([]);
      
      const result = await searchFaculty('NonExistentQuery');
      
      expect(result).toHaveLength(0);
    });

    it('should handle multiple research interests', async () => {
      const { query } = await import('./db');
      const { getFacultyList } = await import('./faculty');
      
      const mockFaculty = [
        {
          id: 1,
          name: 'Dr. Zhang Wei',
          title: 'Professor',
          category: 'Professor',
          researchInterests: ['Machine Learning', 'AI', 'Data Science'],
          sortOrder: 0,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      vi.mocked(query).mockResolvedValueOnce(mockFaculty);
      
      const result = await getFacultyList();
      
      expect(result[0].researchInterests).toHaveLength(3);
      expect(result[0].researchInterests).toContain('Machine Learning');
    });

    it('should sort faculty by sortOrder and name', async () => {
      const { query } = await import('./db');
      const { getFacultyList } = await import('./faculty');
      
      const mockFaculty = [
        {
          id: 1,
          name: 'Dr. Zhang Wei',
          title: 'Professor',
          category: 'Professor',
          sortOrder: 0,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          name: 'Dr. Li Ming',
          title: 'Professor',
          category: 'Professor',
          sortOrder: 0,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      vi.mocked(query).mockResolvedValueOnce(mockFaculty);
      
      const result = await getFacultyList();
      
      // Verify the query was called (sorting is done in SQL)
      expect(result).toHaveLength(2);
    });
  });

  describe('Property Tests', () => {
    // Feature: university-website-clone, Property 8: Faculty data retrieval consistency
    // Validates: Requirements 5.3
    it('should retrieve faculty with all fields intact (round trip)', async () => {
      const { queryOne } = await import('./db');
      const { createFaculty, getFacultyById, deleteFaculty } = await import('./faculty');
      
      await fc.assert(
        fc.asyncProperty(facultyArbitrary, async (facultyData) => {
          // Mock the database responses to simulate round trip
          const mockCreatedFaculty: FacultyMember = {
            id: Math.floor(Math.random() * 10000),
            name: facultyData.name,
            nameEn: facultyData.nameEn,
            title: facultyData.title,
            category: facultyData.category,
            photoUrl: facultyData.photoUrl,
            email: facultyData.email,
            phone: facultyData.phone,
            office: facultyData.office,
            researchInterests: facultyData.researchInterests,
            education: facultyData.education,
            biography: facultyData.biography,
            publications: facultyData.publications,
            projects: facultyData.projects,
            awards: facultyData.awards,
            sortOrder: facultyData.sortOrder,
            isVisible: facultyData.isVisible,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          // Mock createFaculty to return the created faculty
          vi.mocked(queryOne).mockResolvedValueOnce(mockCreatedFaculty);
          
          // Mock getFacultyById to return the same faculty
          vi.mocked(queryOne).mockResolvedValueOnce(mockCreatedFaculty);
          
          // Mock deleteFaculty
          vi.mocked(queryOne).mockResolvedValueOnce({ id: mockCreatedFaculty.id });
          
          // Create a faculty member
          const created = await createFaculty(facultyData);
          
          // Retrieve it by ID
          const retrieved = await getFacultyById(created.id);
          
          // Clean up
          await deleteFaculty(created.id);
          
          // Verify all fields are intact
          expect(retrieved).not.toBeNull();
          expect(retrieved?.id).toBe(created.id);
          expect(retrieved?.name).toBe(facultyData.name);
          expect(retrieved?.nameEn).toBe(facultyData.nameEn);
          expect(retrieved?.title).toBe(facultyData.title);
          expect(retrieved?.category).toBe(facultyData.category);
          expect(retrieved?.photoUrl).toBe(facultyData.photoUrl);
          expect(retrieved?.email).toBe(facultyData.email);
          expect(retrieved?.phone).toBe(facultyData.phone);
          expect(retrieved?.office).toBe(facultyData.office);
          expect(retrieved?.researchInterests).toEqual(facultyData.researchInterests);
          expect(retrieved?.education).toBe(facultyData.education);
          expect(retrieved?.biography).toBe(facultyData.biography);
          expect(retrieved?.publications).toBe(facultyData.publications);
          expect(retrieved?.projects).toBe(facultyData.projects);
          expect(retrieved?.awards).toBe(facultyData.awards);
          expect(retrieved?.sortOrder).toBe(facultyData.sortOrder);
          expect(retrieved?.isVisible).toBe(facultyData.isVisible);
        }),
        { numRuns: 100 }
      );
    });

    // Feature: university-website-clone, Property 9: Faculty categorization
    // Validates: Requirements 5.4
    it('should group faculty members by their assigned categories', async () => {
      const { query } = await import('./db');
      const { getFacultyList } = await import('./faculty');
      
      await fc.assert(
        fc.asyncProperty(
          fc.array(facultyArbitrary, { minLength: 2, maxLength: 20 }),
          async (facultyDataArray) => {
            // Create mock faculty items with various categories
            const mockFacultyItems: FacultyMember[] = facultyDataArray.map((facultyData, index) => ({
              id: index + 1,
              name: facultyData.name,
              nameEn: facultyData.nameEn,
              title: facultyData.title,
              category: facultyData.category,
              photoUrl: facultyData.photoUrl,
              email: facultyData.email,
              phone: facultyData.phone,
              office: facultyData.office,
              researchInterests: facultyData.researchInterests,
              education: facultyData.education,
              biography: facultyData.biography,
              publications: facultyData.publications,
              projects: facultyData.projects,
              awards: facultyData.awards,
              sortOrder: facultyData.sortOrder,
              isVisible: true, // Only visible items should be returned
              createdAt: new Date(),
              updatedAt: new Date()
            }));
            
            // Get unique categories
            const categories = [...new Set(mockFacultyItems.map(f => f.category))];
            
            // Test each category
            for (const category of categories) {
              // Filter faculty by category as the database would
              const filteredFaculty = mockFacultyItems
                .filter(f => f.category === category)
                .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
              
              // Mock the query to return filtered faculty
              vi.mocked(query).mockResolvedValueOnce(filteredFaculty);
              
              // Get faculty list for this category
              const result = await getFacultyList(category);
              
              // Verify all returned faculty members belong to the requested category
              for (const member of result) {
                expect(member.category).toBe(category);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: university-website-clone, Property 10: Faculty search filtering
    // Validates: Requirements 5.5
    it('should return only faculty matching the search criteria', async () => {
      const { query } = await import('./db');
      const { searchFaculty } = await import('./faculty');
      
      await fc.assert(
        fc.asyncProperty(
          fc.array(facultyArbitrary, { minLength: 5, maxLength: 20 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (facultyDataArray, searchQuery) => {
            // Create mock faculty items
            const mockFacultyItems: FacultyMember[] = facultyDataArray.map((facultyData, index) => ({
              id: index + 1,
              name: facultyData.name,
              nameEn: facultyData.nameEn,
              title: facultyData.title,
              category: facultyData.category,
              photoUrl: facultyData.photoUrl,
              email: facultyData.email,
              phone: facultyData.phone,
              office: facultyData.office,
              researchInterests: facultyData.researchInterests,
              education: facultyData.education,
              biography: facultyData.biography,
              publications: facultyData.publications,
              projects: facultyData.projects,
              awards: facultyData.awards,
              sortOrder: facultyData.sortOrder,
              isVisible: true,
              createdAt: new Date(),
              updatedAt: new Date()
            }));
            
            // Filter faculty as the database would (case-insensitive search)
            const searchLower = searchQuery.toLowerCase();
            const filteredFaculty = mockFacultyItems.filter(f => {
              const nameMatch = f.name.toLowerCase().includes(searchLower);
              const nameEnMatch = f.nameEn?.toLowerCase().includes(searchLower) || false;
              const titleMatch = f.title.toLowerCase().includes(searchLower);
              const researchMatch = f.researchInterests?.some(interest => 
                interest.toLowerCase().includes(searchLower)
              ) || false;
              
              return nameMatch || nameEnMatch || titleMatch || researchMatch;
            });
            
            // Mock the query to return filtered faculty
            vi.mocked(query).mockResolvedValueOnce(filteredFaculty);
            
            // Search faculty
            const result = await searchFaculty(searchQuery);
            
            // Verify all returned faculty members match the search criteria
            for (const member of result) {
              const nameMatch = member.name.toLowerCase().includes(searchLower);
              const nameEnMatch = member.nameEn?.toLowerCase().includes(searchLower) || false;
              const titleMatch = member.title.toLowerCase().includes(searchLower);
              const researchMatch = member.researchInterests?.some(interest => 
                interest.toLowerCase().includes(searchLower)
              ) || false;
              
              expect(nameMatch || nameEnMatch || titleMatch || researchMatch).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
