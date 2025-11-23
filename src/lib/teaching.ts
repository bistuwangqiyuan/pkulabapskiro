import { query, queryOne } from './db';
import type { Course, Laboratory, Resource } from '../types';

/**
 * Get a list of courses
 * @returns Promise resolving to array of courses
 */
export async function getCourses(): Promise<Course[]> {
  const queryText = `
    SELECT id, name, description, schedule, instructor, credits, semester,
           prerequisites, objectives, sort_order as "sortOrder",
           is_visible as "isVisible", created_at as "createdAt",
           updated_at as "updatedAt"
    FROM courses
    WHERE is_visible = true
    ORDER BY sort_order ASC, name ASC
  `;
  
  return await query<Course>(queryText);
}

/**
 * Get a single course by ID
 * @param id - Course ID
 * @returns Promise resolving to course or null if not found
 */
export async function getCourseById(id: number): Promise<Course | null> {
  const queryText = `
    SELECT id, name, description, schedule, instructor, credits, semester,
           prerequisites, objectives, sort_order as "sortOrder",
           is_visible as "isVisible", created_at as "createdAt",
           updated_at as "updatedAt"
    FROM courses
    WHERE id = $1
  `;
  
  return await queryOne<Course>(queryText, [id]);
}

/**
 * Get a list of laboratories
 * @returns Promise resolving to array of laboratories
 */
export async function getLaboratories(): Promise<Laboratory[]> {
  const queryText = `
    SELECT id, name, location, equipment, opening_hours as "openingHours",
           capacity, description, manager, contact_info as "contactInfo",
           sort_order as "sortOrder", is_visible as "isVisible",
           created_at as "createdAt", updated_at as "updatedAt"
    FROM laboratories
    WHERE is_visible = true
    ORDER BY sort_order ASC, name ASC
  `;
  
  return await query<Laboratory>(queryText);
}

/**
 * Get a single laboratory by ID
 * @param id - Laboratory ID
 * @returns Promise resolving to laboratory or null if not found
 */
export async function getLaboratoryById(id: number): Promise<Laboratory | null> {
  const queryText = `
    SELECT id, name, location, equipment, opening_hours as "openingHours",
           capacity, description, manager, contact_info as "contactInfo",
           sort_order as "sortOrder", is_visible as "isVisible",
           created_at as "createdAt", updated_at as "updatedAt"
    FROM laboratories
    WHERE id = $1
  `;
  
  return await queryOne<Laboratory>(queryText, [id]);
}

/**
 * Get a list of resources with optional filtering
 * @param category - Optional category filter
 * @param courseId - Optional course ID filter
 * @returns Promise resolving to array of resources
 */
export async function getResources(
  category?: string,
  courseId?: number
): Promise<Resource[]> {
  let queryText = `
    SELECT id, title, description, download_url as "downloadUrl",
           file_type as "fileType", file_size as "fileSize",
           category, course_id as "courseId", sort_order as "sortOrder",
           is_visible as "isVisible", created_at as "createdAt",
           updated_at as "updatedAt"
    FROM resources
    WHERE is_visible = true
  `;
  
  const params: any[] = [];
  let paramIndex = 1;
  
  if (category) {
    queryText += ` AND category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }
  
  if (courseId !== undefined) {
    queryText += ` AND course_id = $${paramIndex}`;
    params.push(courseId);
    paramIndex++;
  }
  
  queryText += ` ORDER BY sort_order ASC, title ASC`;
  
  return await query<Resource>(queryText, params);
}

/**
 * Get a single resource by ID
 * @param id - Resource ID
 * @returns Promise resolving to resource or null if not found
 */
export async function getResourceById(id: number): Promise<Resource | null> {
  const queryText = `
    SELECT id, title, description, download_url as "downloadUrl",
           file_type as "fileType", file_size as "fileSize",
           category, course_id as "courseId", sort_order as "sortOrder",
           is_visible as "isVisible", created_at as "createdAt",
           updated_at as "updatedAt"
    FROM resources
    WHERE id = $1
  `;
  
  return await queryOne<Resource>(queryText, [id]);
}

/**
 * Create a new course
 * @param course - Course data (without id, createdAt, updatedAt)
 * @returns Promise resolving to the created course
 */
export async function createCourse(
  course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Course> {
  const queryText = `
    INSERT INTO courses (
      name, description, schedule, instructor, credits, semester,
      prerequisites, objectives, sort_order, is_visible
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id, name, description, schedule, instructor, credits, semester,
              prerequisites, objectives, sort_order as "sortOrder",
              is_visible as "isVisible", created_at as "createdAt",
              updated_at as "updatedAt"
  `;
  
  const params = [
    course.name,
    course.description,
    course.schedule,
    course.instructor,
    course.credits || null,
    course.semester || null,
    course.prerequisites || null,
    course.objectives || null,
    course.sortOrder,
    course.isVisible
  ];
  
  const result = await queryOne<Course>(queryText, params);
  
  if (!result) {
    throw new Error('Failed to create course');
  }
  
  return result;
}

/**
 * Create a new laboratory
 * @param laboratory - Laboratory data (without id, createdAt, updatedAt)
 * @returns Promise resolving to the created laboratory
 */
export async function createLaboratory(
  laboratory: Omit<Laboratory, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Laboratory> {
  const queryText = `
    INSERT INTO laboratories (
      name, location, equipment, opening_hours, capacity, description,
      manager, contact_info, sort_order, is_visible
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id, name, location, equipment, opening_hours as "openingHours",
              capacity, description, manager, contact_info as "contactInfo",
              sort_order as "sortOrder", is_visible as "isVisible",
              created_at as "createdAt", updated_at as "updatedAt"
  `;
  
  const params = [
    laboratory.name,
    laboratory.location,
    laboratory.equipment,
    laboratory.openingHours,
    laboratory.capacity || null,
    laboratory.description || null,
    laboratory.manager || null,
    laboratory.contactInfo || null,
    laboratory.sortOrder,
    laboratory.isVisible
  ];
  
  const result = await queryOne<Laboratory>(queryText, params);
  
  if (!result) {
    throw new Error('Failed to create laboratory');
  }
  
  return result;
}

/**
 * Create a new resource
 * @param resource - Resource data (without id, createdAt, updatedAt)
 * @returns Promise resolving to the created resource
 */
export async function createResource(
  resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Resource> {
  const queryText = `
    INSERT INTO resources (
      title, description, download_url, file_type, file_size,
      category, course_id, sort_order, is_visible
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, title, description, download_url as "downloadUrl",
              file_type as "fileType", file_size as "fileSize",
              category, course_id as "courseId", sort_order as "sortOrder",
              is_visible as "isVisible", created_at as "createdAt",
              updated_at as "updatedAt"
  `;
  
  const params = [
    resource.title,
    resource.description || null,
    resource.downloadUrl,
    resource.fileType || null,
    resource.fileSize || null,
    resource.category || null,
    resource.courseId || null,
    resource.sortOrder,
    resource.isVisible
  ];
  
  const result = await queryOne<Resource>(queryText, params);
  
  if (!result) {
    throw new Error('Failed to create resource');
  }
  
  return result;
}
