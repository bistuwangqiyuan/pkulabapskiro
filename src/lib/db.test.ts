import { describe, it, expect, vi } from 'vitest';

// Mock the @neondatabase/serverless module before importing db
vi.mock('@neondatabase/serverless', () => {
  const mockSql = vi.fn();
  return {
    neon: vi.fn(() => mockSql),
  };
});

describe('Database Utilities', () => {
  describe('query', () => {
    it('should execute a query and return results', async () => {
      const { neon } = await import('@neondatabase/serverless');
      const mockSql = vi.fn().mockResolvedValue([
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' },
      ]);
      vi.mocked(neon).mockReturnValue(mockSql);

      // Import after mocking
      const { query } = await import('./db');
      
      const result = await query('SELECT * FROM test');
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 1, name: 'Test 1' });
    });

    it('should handle query with parameters', async () => {
      const { neon } = await import('@neondatabase/serverless');
      const mockSql = vi.fn().mockResolvedValue([{ id: 1, name: 'Test' }]);
      vi.mocked(neon).mockReturnValue(mockSql);

      const { query } = await import('./db');
      
      await query('SELECT * FROM test WHERE id = $1', [1]);
      
      expect(mockSql).toHaveBeenCalledWith('SELECT * FROM test WHERE id = $1', [1]);
    });

    it('should throw error when query fails', async () => {
      const { neon } = await import('@neondatabase/serverless');
      const mockSql = vi.fn().mockRejectedValue(new Error('Connection failed'));
      vi.mocked(neon).mockReturnValue(mockSql);

      const { query } = await import('./db');
      
      await expect(query('SELECT * FROM test')).rejects.toThrow('Database operation failed');
    });
  });

  describe('queryOne', () => {
    it('should return the first result when results exist', async () => {
      const { neon } = await import('@neondatabase/serverless');
      const mockSql = vi.fn().mockResolvedValue([
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' },
      ]);
      vi.mocked(neon).mockReturnValue(mockSql);

      const { queryOne } = await import('./db');
      
      const result = await queryOne('SELECT * FROM test WHERE id = $1', [1]);
      
      expect(result).toEqual({ id: 1, name: 'Test 1' });
    });

    it('should return null when no results exist', async () => {
      const { neon } = await import('@neondatabase/serverless');
      const mockSql = vi.fn().mockResolvedValue([]);
      vi.mocked(neon).mockReturnValue(mockSql);

      const { queryOne } = await import('./db');
      
      const result = await queryOne('SELECT * FROM test WHERE id = $1', [999]);
      
      expect(result).toBeNull();
    });

    it('should throw error when query fails', async () => {
      const { neon } = await import('@neondatabase/serverless');
      const mockSql = vi.fn().mockRejectedValue(new Error('Database error'));
      vi.mocked(neon).mockReturnValue(mockSql);

      const { queryOne } = await import('./db');
      
      await expect(queryOne('SELECT * FROM test')).rejects.toThrow();
    });
  });
});
