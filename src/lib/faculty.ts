import { query, queryOne } from './db';
import type { FacultyMember } from '../types';

/**
 * Get a list of faculty members with optional filtering
 * @param category - Optional category filter
 * @param searchQuery - Optional search query for name, title, or research interests
 * @returns Promise resolving to array of faculty members
 */
export async function getFacultyList(
  category?: string,
  searchQuery?: string
): Promise<FacultyMember[]> {
  let queryText = `
    SELECT id, name, name_en as "nameEn", title, category, photo_url as "photoUrl",
           email, phone, office, research_interests as "researchInterests",
           education, biography, publications, projects, awards,
           sort_order as "sortOrder", is_visible as "isVisible",
           created_at as "createdAt", updated_at as "updatedAt"
    FROM faculty
    WHERE is_visible = true
  `;
  
  const params: any[] = [];
  let paramIndex = 1;
  
  if (category) {
    queryText += ` AND category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }
  
  if (searchQuery) {
    queryText += ` AND (
      name ILIKE $${paramIndex} OR
      name_en ILIKE $${paramIndex} OR
      title ILIKE $${paramIndex} OR
      $${paramIndex} = ANY(research_interests)
    )`;
    params.push(`%${searchQuery}%`);
    paramIndex++;
  }
  
  queryText += ` ORDER BY sort_order ASC, name ASC`;
  
  return await query<FacultyMember>(queryText, params);
}

/**
 * Get a single faculty member by ID
 * @param id - Faculty member ID
 * @returns Promise resolving to faculty member or null if not found
 */
export async function getFacultyById(id: number): Promise<FacultyMember | null> {
  const queryText = `
    SELECT id, name, name_en as "nameEn", title, category, photo_url as "photoUrl",
           email, phone, office, research_interests as "researchInterests",
           education, biography, publications, projects, awards,
           sort_order as "sortOrder", is_visible as "isVisible",
           created_at as "createdAt", updated_at as "updatedAt"
    FROM faculty
    WHERE id = $1
  `;
  
  return await queryOne<FacultyMember>(queryText, [id]);
}

/**
 * Search faculty members by query string
 * @param searchQuery - Search query for name, title, or research interests
 * @returns Promise resolving to array of matching faculty members
 */
export async function searchFaculty(searchQuery: string): Promise<FacultyMember[]> {
  return await getFacultyList(undefined, searchQuery);
}

/**
 * Create a new faculty member
 * @param faculty - Faculty member data (without id, createdAt, updatedAt)
 * @returns Promise resolving to the created faculty member
 */
export async function createFaculty(
  faculty: Omit<FacultyMember, 'id' | 'createdAt' | 'updatedAt'>
): Promise<FacultyMember> {
  const queryText = `
    INSERT INTO faculty (
      name, name_en, title, category, photo_url, email, phone, office,
      research_interests, education, biography, publications, projects, awards,
      sort_order, is_visible
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING id, name, name_en as "nameEn", title, category, photo_url as "photoUrl",
              email, phone, office, research_interests as "researchInterests",
              education, biography, publications, projects, awards,
              sort_order as "sortOrder", is_visible as "isVisible",
              created_at as "createdAt", updated_at as "updatedAt"
  `;
  
  const params = [
    faculty.name,
    faculty.nameEn || null,
    faculty.title,
    faculty.category,
    faculty.photoUrl || null,
    faculty.email || null,
    faculty.phone || null,
    faculty.office || null,
    faculty.researchInterests || null,
    faculty.education || null,
    faculty.biography || null,
    faculty.publications || null,
    faculty.projects || null,
    faculty.awards || null,
    faculty.sortOrder,
    faculty.isVisible
  ];
  
  const result = await queryOne<FacultyMember>(queryText, params);
  
  if (!result) {
    throw new Error('Failed to create faculty member');
  }
  
  return result;
}

/**
 * Update an existing faculty member
 * @param id - Faculty member ID
 * @param faculty - Partial faculty member data to update
 * @returns Promise resolving to the updated faculty member or null if not found
 */
export async function updateFaculty(
  id: number,
  faculty: Partial<Omit<FacultyMember, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<FacultyMember | null> {
  const fields: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;
  
  if (faculty.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    params.push(faculty.name);
  }
  if (faculty.nameEn !== undefined) {
    fields.push(`name_en = $${paramIndex++}`);
    params.push(faculty.nameEn);
  }
  if (faculty.title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    params.push(faculty.title);
  }
  if (faculty.category !== undefined) {
    fields.push(`category = $${paramIndex++}`);
    params.push(faculty.category);
  }
  if (faculty.photoUrl !== undefined) {
    fields.push(`photo_url = $${paramIndex++}`);
    params.push(faculty.photoUrl);
  }
  if (faculty.email !== undefined) {
    fields.push(`email = $${paramIndex++}`);
    params.push(faculty.email);
  }
  if (faculty.phone !== undefined) {
    fields.push(`phone = $${paramIndex++}`);
    params.push(faculty.phone);
  }
  if (faculty.office !== undefined) {
    fields.push(`office = $${paramIndex++}`);
    params.push(faculty.office);
  }
  if (faculty.researchInterests !== undefined) {
    fields.push(`research_interests = $${paramIndex++}`);
    params.push(faculty.researchInterests);
  }
  if (faculty.education !== undefined) {
    fields.push(`education = $${paramIndex++}`);
    params.push(faculty.education);
  }
  if (faculty.biography !== undefined) {
    fields.push(`biography = $${paramIndex++}`);
    params.push(faculty.biography);
  }
  if (faculty.publications !== undefined) {
    fields.push(`publications = $${paramIndex++}`);
    params.push(faculty.publications);
  }
  if (faculty.projects !== undefined) {
    fields.push(`projects = $${paramIndex++}`);
    params.push(faculty.projects);
  }
  if (faculty.awards !== undefined) {
    fields.push(`awards = $${paramIndex++}`);
    params.push(faculty.awards);
  }
  if (faculty.sortOrder !== undefined) {
    fields.push(`sort_order = $${paramIndex++}`);
    params.push(faculty.sortOrder);
  }
  if (faculty.isVisible !== undefined) {
    fields.push(`is_visible = $${paramIndex++}`);
    params.push(faculty.isVisible);
  }
  
  if (fields.length === 0) {
    return await getFacultyById(id);
  }
  
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  params.push(id);
  
  const queryText = `
    UPDATE faculty
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, name, name_en as "nameEn", title, category, photo_url as "photoUrl",
              email, phone, office, research_interests as "researchInterests",
              education, biography, publications, projects, awards,
              sort_order as "sortOrder", is_visible as "isVisible",
              created_at as "createdAt", updated_at as "updatedAt"
  `;
  
  return await queryOne<FacultyMember>(queryText, params);
}

/**
 * Delete a faculty member
 * @param id - Faculty member ID
 * @returns Promise resolving to true if deleted, false if not found
 */
export async function deleteFaculty(id: number): Promise<boolean> {
  const queryText = 'DELETE FROM faculty WHERE id = $1 RETURNING id';
  const result = await queryOne<{ id: number }>(queryText, [id]);
  return result !== null;
}
