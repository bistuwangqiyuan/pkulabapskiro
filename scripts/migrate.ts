import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Database migration script
 * Initializes the database schema by executing the SQL file
 */
async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL environment variable is not set');
    console.error('Please set DATABASE_URL in your .env file or environment');
    process.exit(1);
  }

  console.log('Starting database migration...');
  
  try {
    const sql = neon(databaseUrl);
    
    // Read the SQL file
    const sqlFilePath = join(__dirname, 'init-db.sql');
    const sqlContent = readFileSync(sqlFilePath, 'utf-8');
    
    // Split by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    for (const statement of statements) {
      await sql(statement);
    }
    
    console.log('✓ Database migration completed successfully');
    console.log('✓ All tables and indexes created');
    
  } catch (error) {
    console.error('✗ Database migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();
