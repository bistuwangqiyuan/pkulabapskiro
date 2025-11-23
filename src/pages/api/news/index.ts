import type { APIRoute } from 'astro';
import { getNewsList, createNews } from '../../../lib/news';
import type { NewsItem } from '../../../types';

export const prerender = false;

/**
 * GET /api/news - Get paginated list of news articles
 * Query params: page, pageSize, category
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const category = url.searchParams.get('category') || undefined;

    // Validate pagination parameters
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return new Response(
        JSON.stringify({
          error: 'Invalid pagination parameters. Page must be >= 1, pageSize must be between 1 and 100.'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await getNewsList(page, pageSize, category);

    return new Response(
      JSON.stringify({
        items: result.items,
        total: result.total,
        page,
        pageSize,
        totalPages: Math.ceil(result.total / pageSize)
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching news list:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * POST /api/news - Create a new news article
 * Body: NewsItem (without id, viewCount, publishedAt, updatedAt)
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Title is required and must be a non-empty string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!body.slug || typeof body.slug !== 'string' || body.slug.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Slug is required and must be a non-empty string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!body.content || typeof body.content !== 'string' || body.content.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Content is required and must be a non-empty string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate slug format (alphanumeric, hyphens, underscores only)
    if (!/^[a-z0-9-_]+$/.test(body.slug)) {
      return new Response(
        JSON.stringify({ error: 'Slug must contain only lowercase letters, numbers, hyphens, and underscores' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate optional fields
    if (body.summary !== undefined && typeof body.summary !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Summary must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.thumbnailUrl !== undefined && typeof body.thumbnailUrl !== 'string') {
      return new Response(
        JSON.stringify({ error: 'ThumbnailUrl must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.author !== undefined && typeof body.author !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Author must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.category !== undefined && typeof body.category !== 'string') {
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

    if (body.tags !== undefined && (!Array.isArray(body.tags) || !body.tags.every((t: any) => typeof t === 'string'))) {
      return new Response(
        JSON.stringify({ error: 'Tags must be an array of strings' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const newsData: Omit<NewsItem, 'id' | 'viewCount' | 'publishedAt' | 'updatedAt'> = {
      title: body.title.trim(),
      slug: body.slug.trim(),
      summary: body.summary?.trim(),
      content: body.content.trim(),
      thumbnailUrl: body.thumbnailUrl?.trim(),
      author: body.author?.trim(),
      category: body.category?.trim(),
      isPublished: body.isPublished ?? true,
      tags: body.tags
    };

    const createdNews = await createNews(newsData);

    return new Response(
      JSON.stringify(createdNews),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating news:', error);
    
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
