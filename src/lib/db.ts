import { neon } from '@neondatabase/serverless';

// Initialize the Neon client with the database URL from environment variables
const sql = neon(import.meta.env.DATABASE_URL || process.env.DATABASE_URL || '');

/**
 * Execute a SQL query and return all results
 * @param queryText - The SQL query string
 * @param params - Optional array of query parameters
 * @returns Promise resolving to an array of results
 * @throws Error if the database operation fails
 */
export async function query<T>(queryText: string, params?: any[]): Promise<T[]> {
  try {
    const result = await sql(queryText, params);
    return result as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error(`Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Execute a SQL query and return the first result or null
 * @param queryText - The SQL query string
 * @param params - Optional array of query parameters
 * @returns Promise resolving to the first result or null if no results
 * @throws Error if the database operation fails
 */
export async function queryOne<T>(queryText: string, params?: any[]): Promise<T | null> {
  try {
    const results = await query<T>(queryText, params);
    return results[0] || null;
  } catch (error) {
    console.error('Database queryOne error:', error);
    throw error;
  }
}
