import type { APIRoute } from 'astro';
import { getNewsById, updateNews, deleteNews } from '../../../lib/news';
import type { NewsItem } from '../../../types';

export const prerender = false;

/**
 * GET /api/news/[id] - Get a single news article by ID
 */
export const GET: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id || '', 10);

    if (isNaN(id) || id < 1) {
      return new Response(
        JSON.stringify({ error: 'Invalid news ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const news = await getNewsById(id);

    if (!news) {
      return new Response(
        JSON.stringify({ error: 'News article not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(news),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching news:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * PUT /api/news/[id] - Update a news article
 * Body: Partial<NewsItem> (without id, viewCount, publishedAt, updatedAt)
 */
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = parseInt(params.id || '', 10);

    if (isNaN(id) || id < 1) {
      return new Response(
        JSON.stringify({ error: 'Invalid news ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();

    // Validate fields if provided
    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || body.title.trim() === '') {
        return new Response(
          JSON.stringify({ error: 'Title must be a non-empty string' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    if (body.slug !== undefined) {
      if (typeof body.slug !== 'string' || body.slug.trim() === '') {
        return new Response(
          JSON.stringify({ error: 'Slug must be a non-empty string' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      // Validate slug format
      if (!/^[a-z0-9-_]+$/.test(body.slug)) {
        return new Response(
          JSON.stringify({ error: 'Slug must contain only lowercase letters, numbers, hyphens, and underscores' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    if (body.content !== undefined) {
      if (typeof body.content !== 'string' || body.content.trim() === '') {
        return new Response(
          JSON.stringify({ error: 'Content must be a non-empty string' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    if (body.summary !== undefined && body.summary !== null && typeof body.summary !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Summary must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.thumbnailUrl !== undefined && body.thumbnailUrl !== null && typeof body.thumbnailUrl !== 'string') {
      return new Response(
        JSON.stringify({ error: 'ThumbnailUrl must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.author !== undefined && body.author !== null && typeof body.author !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Author must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.category !== undefined && body.category !== null && typeof body.category !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Category must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.isPublished !== undefined && typeof body.isPublished !== 'boolean') {
      return new Response(
        JSON.stringify({ error: 'IsPublished must be a boolean' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.tags !== undefined && body.tags !== null && (!Array.isArray(body.tags) || !body.tags.every((t: any) => typeof t === 'string'))) {
      return new Response(
        JSON.stringify({ error: 'Tags must be an array of strings' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Disallow updating system fields
    if (body.id !== undefined || body.viewCount !== undefined || body.publishedAt !== undefined || body.updatedAt !== undefined) {
      return new Response(
        JSON.stringify({ error: 'Cannot update system fields (id, viewCount, publishedAt, updatedAt)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const updateData: Partial<Omit<NewsItem, 'id' | 'viewCount' | 'publishedAt' | 'updatedAt'>> = {};

    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.slug !== undefined) updateData.slug = body.slug.trim();
    if (body.summary !== undefined) updateData.summary = body.summary?.trim();
    if (body.content !== undefined) updateData.content = body.content.trim();
    if (body.thumbnailUrl !== undefined) updateData.thumbnailUrl = body.thumbnailUrl?.trim();
    if (body.author !== undefined) updateData.author = body.author?.trim();
    if (body.category !== undefined) updateData.category = body.category?.trim();
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;
    if (body.tags !== undefined) updateData.tags = body.tags;

    const updatedNews = await updateNews(id, updateData);

    if (!updatedNews) {
      return new Response(
        JSON.stringify({ error: 'News article not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(updatedNews),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error updating news:', error);

    // Handle unique constraint violation (duplicate slug)
    if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
      return new Response(
        JSON.stringify({ error: 'A news article with this slug already exists' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * DELETE /api/news/[id] - Delete a news article
 */
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id || '', 10);

    if (isNaN(id) || id < 1) {
      return new Response(
        JSON.stringify({ error: 'Invalid news ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const deleted = await deleteNews(id);

    if (!deleted) {
      return new Response(
        JSON.stringify({ error: 'News article not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'News article deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting news:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
