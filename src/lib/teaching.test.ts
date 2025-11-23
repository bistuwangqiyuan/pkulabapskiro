import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import type { Course, Laboratory, Resource } from '../types';

// Mock the database module
vi.mock('./db', () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
}));

// Helper to generate valid course data for property tests
const courseArbitrary = fc.record({
  name: fc.string({ minLength: 1, maxLength: 255 }),
  description: fc.string({ minLength: 1 }),
  schedule: fc.string({ minLength: 1 }),
  instructor: fc.string({ minLength: 1, maxLength: 100 }),
  credits: fc.option(fc.integer({ min: 1, max: 10 }), { nil: undefined }),
  semester: fc.option(fc.constantFrom('Spring', 'Fall', 'Summer', 'Winter'), { nil: undefined }),
  prerequisites: fc.option(fc.string(), { nil: undefined }),
  objectives: fc.option(fc.string(), { nil: undefined }),
  sortOrder: fc.integer({ min: 0, max: 100 }),
  isVisible: fc.boolean()
});

// Helper to generate valid laboratory data for property tests
const laboratoryArbitrary = fc.record({
  name: fc.string({ minLength: 1, maxLength: 255 }),
  location: fc.string({ minLength: 1 }),
  equipment: fc.string({ minLength: 1 }),
  openingHours: fc.string({ minLength: 1 }),
  capacity: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
  description: fc.option(fc.string(), { nil: undefined }),
  manager: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
  contactInfo: fc.option(fc.string(), { nil: undefined }),
  sortOrder: fc.integer({ min: 0, max: 100 }),
  isVisible: fc.boolean()
});

// Helper to generate valid resource data for property tests
const resourceArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 255 }),
  description: fc.option(fc.string(), { nil: undefined }),
  downloadUrl: fc.webUrl(),
  fileType: fc.option(fc.constantFrom('pdf', 'doc', 'ppt', 'zip'), { nil: undefined }),
  fileSize: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
  category: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
  courseId: fc.option(fc.integer({ min: 1, max: 1000 }), { nil: undefined }),
  sortOrder: fc.integer({ min: 0, max: 100 }),
  isVisible: fc.boolean()
});

describe('Teaching Data Access Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Unit Tests', () => {
    it('should get courses list', async () => {
      const { query } = await import('./db');
      const { getCourses } = await import('./teaching');
      
      const mockCourses = [
        {
          id: 1,
          name: 'Computer Networks',
          description: 'Introduction to computer networks',
          schedule: 'Monday 9:00-11:00',
          instructor: 'Dr. Smith',
          credits: 3,
          semester: 'Fall',
          sortOrder: 0,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      vi.mocked(query).mockResolvedValueOnce(mockCourses);
      
      const result = await getCourses();
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Computer Networks');
      expect(result[0].instructor).toBe('Dr. Smith');
    });

    it('should get course by ID', async () => {
      const { queryOne } = await import('./db');
      const { getCourseById } = await import('./teaching');
      
      const mockCourse = {
        id: 1,
        name: 'Database Systems',
        description: 'Database design and implementation',
        schedule: 'Tuesday 14:00-16:00',
        instructor: 'Prof. Johnson',
        credits: 4,
        sortOrder: 0,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      vi.mocked(queryOne).mockResolvedValueOnce(mockCourse);
      
      const result = await getCourseById(1);
      
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Database Systems');
    });

    it('should get laboratories list', async () => {
      const { query } = await import('./db');
      const { getLaboratories } = await import('./teaching');
      
      const mockLabs = [
        {
          id: 1,
          name: 'Network Lab',
          location: 'Building A, Room 301',
          equipment: 'Cisco routers, switches',
          openingHours: 'Mon-Fri 9:00-17:00',
          capacity: 30,
          sortOrder: 0,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      vi.mocked(query).mockResolvedValueOnce(mockLabs);
      
      const result = await getLaboratories();
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Network Lab');
      expect(result[0].location).toBe('Building A, Room 301');
    });

    it('should get laboratory by ID', async () => {
      const { queryOne } = await import('./db');
      const { getLaboratoryById } = await import('./teaching');
      
      const mockLab = {
        id: 1,
        name: 'AI Lab',
        location: 'Building B, Room 205',
        equipment: 'GPU servers, workstations',
        openingHours: 'Mon-Fri 8:00-20:00',
        capacity: 25,
        sortOrder: 0,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      vi.mocked(queryOne).mockResolvedValueOnce(mockLab);
      
      const result = await getLaboratoryById(1);
      
      expect(result).not.toBeNull();
      expect(result?.name).toBe('AI Lab');
    });

    it('should get resources list', async () => {
      const { query } = await import('./db');
      const { getResources } = await import('./teaching');
      
      const mockResources = [
        {
          id: 1,
          title: 'Course Syllabus',
          description: 'Detailed course syllabus',
          downloadUrl: 'https://example.com/syllabus.pdf',
          fileType: 'pdf',
          fileSize: '2MB',
          category: 'Course Materials',
          sortOrder: 0,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      vi.mocked(query).mockResolvedValueOnce(mockResources);
      
      const result = await getResources();
      
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Course Syllabus');
      expect(result[0].downloadUrl).toBe('https://example.com/syllabus.pdf');
    });

    it('should filter resources by category', async () => {
      const { query } = await import('./db');
      const { getResources } = await import('./teaching');
      
      const mockResources = [
        {
          id: 1,
          title: 'Lab Manual',
          downloadUrl: 'https://example.com/manual.pdf',
          category: 'Lab Materials',
          sortOrder: 0,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      vi.mocked(query).mockResolvedValueOnce(mockResources);
      
      const result = await getResources('Lab Materials');
      
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('Lab Materials');
    });

    it('should filter resources by course ID', async () => {
      const { query } = await import('./db');
      const { getResources } = await import('./teaching');
      
      const mockResources = [
        {
          id: 1,
          title: 'Course Notes',
          downloadUrl: 'https://example.com/notes.pdf',
          courseId: 5,
          sortOrder: 0,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      vi.mocked(query).mockResolvedValueOnce(mockResources);
      
      const result = await getResources(undefined, 5);
      
      expect(result).toHaveLength(1);
      expect(result[0].courseId).toBe(5);
    });

    it('should create a new course', async () => {
      const { queryOne } = await import('./db');
      const { createCourse } = await import('./teaching');
      
      const courseData = {
        name: 'Machine Learning',
        description: 'Introduction to ML',
        schedule: 'Wed 10:00-12:00',
        instructor: 'Dr. Lee',
        credits: 3,
        sortOrder: 0,
        isVisible: true
      };
      
      const mockCreated = {
        id: 1,
        ...courseData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      vi.mocked(queryOne).mockResolvedValueOnce(mockCreated);
      
      const result = await createCourse(courseData);
      
      expect(result.id).toBe(1);
      expect(result.name).toBe('Machine Learning');
    });

    it('should create a new laboratory', async () => {
      const { queryOne } = await import('./db');
      const { createLaboratory } = await import('./teaching');
      
      const labData = {
        name: 'Software Lab',
        location: 'Building C, Room 101',
        equipment: 'Computers, projectors',
        openingHours: 'Mon-Fri 9:00-18:00',
        capacity: 40,
        sortOrder: 0,
        isVisible: true
      };
      
      const mockCreated = {
        id: 1,
        ...labData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      vi.mocked(queryOne).mockResolvedValueOnce(mockCreated);
      
      const result = await createLaboratory(labData);
      
      expect(result.id).toBe(1);
      expect(result.name).toBe('Software Lab');
    });

    it('should create a new resource', async () => {
      const { queryOne } = await import('./db');
      const { createResource } = await import('./teaching');
      
      const resourceData = {
        title: 'Lecture Slides',
        description: 'Week 1 slides',
        downloadUrl: 'https://example.com/slides.pdf',
        fileType: 'pdf',
        sortOrder: 0,
        isVisible: true
      };
      
      const mockCreated = {
        id: 1,
        ...resourceData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      vi.mocked(queryOne).mockResolvedValueOnce(mockCreated);
      
      const result = await createResource(resourceData);
      
      expect(result.id).toBe(1);
      expect(result.title).toBe('Lecture Slides');
    });
  });

  describe('Property Tests', () => {
    // Feature: university-website-clone, Property 11: Teaching content retrieval
    // Validates: Requirements 6.2
    it('should retrieve teaching content correctly (courses, laboratories, resources)', async () => {
      const { query, queryOne } = await import('./db');
      const { 
        createCourse, getCourseById, 
        createLaboratory, getLaboratoryById,
        createResource, getResourceById 
      } = await import('./teaching');
      
      await fc.assert(
        fc.asyncProperty(
          courseArbitrary,
          laboratoryArbitrary,
          resourceArbitrary,
          async (courseData, labData, resourceData) => {
            // Test course retrieval
            const mockCourse: Course = {
              id: Math.floor(Math.random() * 10000),
              ...courseData,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            vi.mocked(queryOne).mockResolvedValueOnce(mockCourse);
            vi.mocked(queryOne).mockResolvedValueOnce(mockCourse);
            
            const createdCourse = await createCourse(courseData);
            const retrievedCourse = await getCourseById(createdCourse.id);
            
            expect(retrievedCourse).not.toBeNull();
            expect(retrievedCourse?.name).toBe(courseData.name);
            expect(retrievedCourse?.description).toBe(courseData.description);
            expect(retrievedCourse?.schedule).toBe(courseData.schedule);
            expect(retrievedCourse?.instructor).toBe(courseData.instructor);
            
            // Test laboratory retrieval
            const mockLab: Laboratory = {
              id: Math.floor(Math.random() * 10000),
              ...labData,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            vi.mocked(queryOne).mockResolvedValueOnce(mockLab);
            vi.mocked(queryOne).mockResolvedValueOnce(mockLab);
            
            const createdLab = await createLaboratory(labData);
            const retrievedLab = await getLaboratoryById(createdLab.id);
            
            expect(retrievedLab).not.toBeNull();
            expect(retrievedLab?.name).toBe(labData.name);
            expect(retrievedLab?.location).toBe(labData.location);
            expect(retrievedLab?.equipment).toBe(labData.equipment);
            expect(retrievedLab?.openingHours).toBe(labData.openingHours);
            
            // Test resource retrieval
            const mockResource: Resource = {
              id: Math.floor(Math.random() * 10000),
              ...resourceData,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            vi.mocked(queryOne).mockResolvedValueOnce(mockResource);
            vi.mocked(queryOne).mockResolvedValueOnce(mockResource);
            
            const createdResource = await createResource(resourceData);
            const retrievedResource = await getResourceById(createdResource.id);
            
            expect(retrievedResource).not.toBeNull();
            expect(retrievedResource?.title).toBe(resourceData.title);
            expect(retrievedResource?.downloadUrl).toBe(resourceData.downloadUrl);
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: university-website-clone, Property 12: Course information completeness
    // Validates: Requirements 6.3
    it('should include all required fields when rendering course information', async () => {
      const { query } = await import('./db');
      const { getCourses } = await import('./teaching');
      
      await fc.assert(
        fc.asyncProperty(
          fc.array(courseArbitrary, { minLength: 1, maxLength: 10 }),
          async (coursesData) => {
            // Create mock courses with all required fields
            const mockCourses: Course[] = coursesData.map((courseData, index) => ({
              id: index + 1,
              name: courseData.name,
              description: courseData.description,
              schedule: courseData.schedule,
              instructor: courseData.instructor,
              credits: courseData.credits,
              semester: courseData.semester,
              prerequisites: courseData.prerequisites,
              objectives: courseData.objectives,
              sortOrder: courseData.sortOrder,
              isVisible: true, // Only visible courses should be returned
              createdAt: new Date(),
              updatedAt: new Date()
            }));
            
            // Mock the query to return courses
            vi.mocked(query).mockResolvedValueOnce(mockCourses);
            
            // Get courses
            const courses = await getCourses();
            
            // Verify each course has all required fields
            courses.forEach(course => {
              // Required fields per Requirements 6.3
              expect(course.name).toBeDefined();
              expect(typeof course.name).toBe('string');
              expect(course.name.length).toBeGreaterThan(0);
              
              expect(course.description).toBeDefined();
              expect(typeof course.description).toBe('string');
              expect(course.description.length).toBeGreaterThan(0);
              
              expect(course.schedule).toBeDefined();
              expect(typeof course.schedule).toBe('string');
              expect(course.schedule.length).toBeGreaterThan(0);
              
              expect(course.instructor).toBeDefined();
              expect(typeof course.instructor).toBe('string');
              expect(course.instructor.length).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: university-website-clone, Property 13: Laboratory information completeness
    // Validates: Requirements 6.4
    it('should include all required fields when rendering laboratory information', async () => {
      const { query } = await import('./db');
      const { getLaboratories } = await import('./teaching');
      
      await fc.assert(
        fc.asyncProperty(
          fc.array(laboratoryArbitrary, { minLength: 1, maxLength: 10 }),
          async (labsData) => {
            // Create mock laboratories with all required fields
            const mockLabs: Laboratory[] = labsData.map((labData, index) => ({
              id: index + 1,
              name: labData.name,
              location: labData.location,
              equipment: labData.equipment,
              openingHours: labData.openingHours,
              capacity: labData.capacity,
              description: labData.description,
              manager: labData.manager,
              contactInfo: labData.contactInfo,
              sortOrder: labData.sortOrder,
              isVisible: true, // Only visible labs should be returned
              createdAt: new Date(),
              updatedAt: new Date()
            }));
            
            // Mock the query to return laboratories
            vi.mocked(query).mockResolvedValueOnce(mockLabs);
            
            // Get laboratories
            const labs = await getLaboratories();
            
            // Verify each laboratory has all required fields
            labs.forEach(lab => {
              // Required fields per Requirements 6.4
              expect(lab.location).toBeDefined();
              expect(typeof lab.location).toBe('string');
              expect(lab.location.length).toBeGreaterThan(0);
              
              expect(lab.equipment).toBeDefined();
              expect(typeof lab.equipment).toBe('string');
              expect(lab.equipment.length).toBeGreaterThan(0);
              
              expect(lab.openingHours).toBeDefined();
              expect(typeof lab.openingHours).toBe('string');
              expect(lab.openingHours.length).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: university-website-clone, Property 14: Resource download availability
    // Validates: Requirements 6.5
    it('should have valid download links for all resources', async () => {
      const { query } = await import('./db');
      const { getResources } = await import('./teaching');
      
      await fc.assert(
        fc.asyncProperty(
          fc.array(resourceArbitrary, { minLength: 1, maxLength: 10 }),
          async (resourcesData) => {
            // Create mock resources with download URLs
            const mockResources: Resource[] = resourcesData.map((resourceData, index) => ({
              id: index + 1,
              title: resourceData.title,
              description: resourceData.description,
              downloadUrl: resourceData.downloadUrl,
              fileType: resourceData.fileType,
              fileSize: resourceData.fileSize,
              category: resourceData.category,
              courseId: resourceData.courseId,
              sortOrder: resourceData.sortOrder,
              isVisible: true, // Only visible resources should be returned
              createdAt: new Date(),
              updatedAt: new Date()
            }));
            
            // Mock the query to return resources
            vi.mocked(query).mockResolvedValueOnce(mockResources);
            
            // Get resources
            const resources = await getResources();
            
            // Verify each resource has a valid download URL
            resources.forEach(resource => {
              // Required field per Requirements 6.5
              expect(resource.downloadUrl).toBeDefined();
              expect(typeof resource.downloadUrl).toBe('string');
              expect(resource.downloadUrl.length).toBeGreaterThan(0);
              
              // Verify it's a valid URL format
              expect(() => new URL(resource.downloadUrl)).not.toThrow();
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
