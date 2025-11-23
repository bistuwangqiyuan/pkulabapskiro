import type { APIRoute } from 'astro';
import { getFacultyList, createFaculty } from '../../../lib/faculty';
import type { FacultyMember } from '../../../types';

export const prerender = false;

/**
 * GET /api/faculty - Get list of faculty members
 * Query params: category, search
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const category = url.searchParams.get('category') || undefined;
    const search = url.searchParams.get('search') || undefined;

    const faculty = await getFacultyList(category, search);

    return new Response(
      JSON.stringify({
        items: faculty,
        total: faculty.length
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching faculty list:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * POST /api/faculty - Create a new faculty member
 * Body: FacultyMember (without id, createdAt, updatedAt)
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Name is required and must be a non-empty string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Title is required and must be a non-empty string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!body.category || typeof body.category !== 'string' || body.category.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Category is required and must be a non-empty string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate optional fields
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

    const facultyData: Omit<FacultyMember, 'id' | 'createdAt' | 'updatedAt'> = {
      name: body.name.trim(),
      nameEn: body.nameEn?.trim(),
      title: body.title.trim(),
      category: body.category.trim(),
      photoUrl: body.photoUrl?.trim(),
      email: body.email?.trim(),
      phone: body.phone?.trim(),
      office: body.office?.trim(),
      researchInterests: body.researchInterests,
      education: body.education?.trim(),
      biography: body.biography?.trim(),
      publications: body.publications?.trim(),
      projects: body.projects?.trim(),
      awards: body.awards?.trim(),
      sortOrder: body.sortOrder ?? 0,
      isVisible: body.isVisible ?? true
    };

    const createdFaculty = await createFaculty(facultyData);

    return new Response(
      JSON.stringify(createdFaculty),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating faculty:', error);

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};