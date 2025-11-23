import type { APIRoute } from 'astro';
import { getFacultyById, updateFaculty, deleteFaculty } from '../../../lib/faculty';
import type { FacultyMember } from '../../../types';

export const prerender = false;

/**
 * GET /api/faculty/[id] - Get a single faculty member by ID
 */
export const GET: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id || '', 10);

    if (isNaN(id) || id < 1) {
      return new Response(
        JSON.stringify({ error: 'Invalid faculty ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const faculty = await getFacultyById(id);

    if (!faculty) {
      return new Response(
        JSON.stringify({ error: 'Faculty member not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(faculty),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching faculty:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * PUT /api/faculty/[id] - Update a faculty member
 * Body: Partial<FacultyMember> (without id, createdAt, updatedAt)
 */
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = parseInt(params.id || '', 10);

    if (isNaN(id) || id < 1) {
      return new Response(
        JSON.stringify({ error: 'Invalid faculty ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();

    // Validate fields if provided
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim() === '') {
        return new Response(
          JSON.stringify({ error: 'Name must be a non-empty string' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || body.title.trim() === '') {
        return new Response(
          JSON.stringify({ error: 'Title must be a non-empty string' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    if (body.category !== undefined) {
      if (typeof body.category !== 'string' || body.category.trim() === '') {
        return new Response(
          JSON.stringify({ error: 'Category must be a non-empty string' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    if (body.nameEn !== undefined && body.nameEn !== null && typeof body.nameEn !== 'string') {
      return new Response(
        JSON.stringify({ error: 'NameEn must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.photoUrl !== undefined && body.photoUrl !== null && typeof body.photoUrl !== 'string') {
      return new Response(
        JSON.stringify({ error: 'PhotoUrl must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.email !== undefined && body.email !== null && typeof body.email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Email must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.phone !== undefined && body.phone !== null && typeof body.phone !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Phone must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.office !== undefined && body.office !== null && typeof body.office !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Office must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.researchInterests !== undefined && body.researchInterests !== null && 
        (!Array.isArray(body.researchInterests) || !body.researchInterests.every((r: any) => typeof r === 'string'))) {
      return new Response(
        JSON.stringify({ error: 'ResearchInterests must be an array of strings' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.education !== undefined && body.education !== null && typeof body.education !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Education must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.biography !== undefined && body.biography !== null && typeof body.biography !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Biography must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.publications !== undefined && body.publications !== null && typeof body.publications !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Publications must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.projects !== undefined && body.projects !== null && typeof body.projects !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Projects must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.awards !== undefined && body.awards !== null && typeof body.awards !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Awards must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.sortOrder !== undefined && (typeof body.sortOrder !== 'number' || !Number.isInteger(body.sortOrder))) {
      return new Response(
        JSON.stringify({ error: 'SortOrder must be an integer' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.isVisible !== undefined && typeof body.isVisible !== 'boolean') {
      return new Response(
        JSON.stringify({ error: 'IsVisible must be a boolean' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Disallow updating system fields
    if (body.id !== undefined || body.createdAt !== undefined || body.updatedAt !== undefined) {
      return new Response(
        JSON.stringify({ error: 'Cannot update system fields (id, createdAt, updatedAt)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const updateData: Partial<Omit<FacultyMember, 'id' | 'createdAt' | 'updatedAt'>> = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.nameEn !== undefined) updateData.nameEn = body.nameEn?.trim();
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.category !== undefined) updateData.category = body.category.trim();
    if (body.photoUrl !== undefined) updateData.photoUrl = body.photoUrl?.trim();
    if (body.email !== undefined) updateData.email = body.email?.trim();
    if (body.phone !== undefined) updateData.phone = body.phone?.trim();
    if (body.office !== undefined) updateData.office = body.office?.trim();
    if (body.researchInterests !== undefined) updateData.researchInterests = body.researchInterests;
    if (body.education !== undefined) updateData.education = body.education?.trim();
    if (body.biography !== undefined) updateData.biography = body.biography?.trim();
    if (body.publications !== undefined) updateData.publications = body.publications?.trim();
    if (body.projects !== undefined) updateData.projects = body.projects?.trim();
    if (body.awards !== undefined) updateData.awards = body.awards?.trim();
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;
    if (body.isVisible !== undefined) updateData.isVisible = body.isVisible;

    const updatedFaculty = await updateFaculty(id, updateData);

    if (!updatedFaculty) {
      return new Response(
        JSON.stringify({ error: 'Faculty member not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(updatedFaculty),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error updating faculty:', error);

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * DELETE /api/faculty/[id] - Delete a faculty member
 */
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id || '', 10);

    if (isNaN(id) || id < 1) {
      return new Response(
        JSON.stringify({ error: 'Invalid faculty ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const deleted = await deleteFaculty(id);

    if (!deleted) {
      return new Response(
        JSON.stringify({ error: 'Faculty member not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Faculty member deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting faculty:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
