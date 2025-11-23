# Project Structure

## Directory Organization

```
src/
├── components/       # Astro components (UI building blocks)
├── layouts/          # Page layout templates
├── pages/            # File-based routing
│   ├── api/          # API endpoints (serverless functions)
│   ├── blobs/        # Blob storage demo pages
│   ├── edge/         # Edge function demo pages
│   └── news/         # News section with dynamic routes
├── lib/              # Business logic and data access
├── styles/           # Global CSS
├── utils/            # Utility functions
├── assets/           # Static assets processed by Astro
└── types.ts          # TypeScript type definitions

scripts/              # Database migrations and setup
public/               # Static assets served as-is
netlify/              # Netlify-specific configurations
  └── edge-functions/ # Edge function implementations
```

## Key Conventions

### File Naming

- **Astro components**: PascalCase (e.g., `Header.astro`, `NewsCard.astro`)
- **React components**: PascalCase with `.tsx` extension
- **Library modules**: camelCase (e.g., `db.ts`, `news.ts`)
- **Test files**: `*.test.ts` or `*.spec.ts` alongside source files

### Component Organization

- **Astro components** (`.astro`) for static/server-rendered UI
- **React components** (`.tsx`) for interactive client-side features
- Page-specific components in `_components` subdirectories (e.g., `src/pages/blobs/_components/`)

### Data Layer

- Database queries centralized in `src/lib/` modules
- Generic `db.ts` provides `query()` and `queryOne()` helpers
- Feature-specific modules (e.g., `news.ts`) contain domain logic
- All database functions are async and return typed results

### API Routes

- Located in `src/pages/api/`
- Export handler functions for HTTP methods
- Return JSON responses or use Netlify-specific APIs

### Testing

- Tests colocated with source files (e.g., `news.ts` → `news.test.ts`)
- Use Vitest for unit tests
- Property-based testing with fast-check for complex logic

### Styling

- Tailwind utility classes for component styling
- Global styles in `src/styles/globals.css`
- Component-scoped styles in `<style>` tags within `.astro` files
