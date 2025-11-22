# Testing Setup

## Installation

To run the tests, you need to install the dependencies first:

```bash
npm install
```

This will install:

- `vitest` - Testing framework
- `@neondatabase/serverless` - Database client

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch
```

## Database Tests

The database utility tests (`src/lib/db.test.ts`) cover:

- Connection establishment (mocked)
- Query execution with and without parameters
- Error handling for failed queries
- `query()` function returning multiple results
- `queryOne()` function returning single result or null

## Database Migration

To initialize the database schema:

1. Set up your DATABASE_URL environment variable (see `.env.example`)
2. Run the migration script:

```bash
npm run db:migrate
```

This will create all necessary tables and indexes defined in `scripts/init-db.sql`.
