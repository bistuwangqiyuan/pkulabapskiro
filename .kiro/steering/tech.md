# Technology Stack

## Core Framework

- **Astro 5.x** - Static site generator with SSR support
- **React 19** - For interactive components (islands architecture)
- **TypeScript** - Type-safe development

## Styling

- **Tailwind CSS 4.x** - Utility-first CSS framework
- **@fontsource-variable/inter** - Typography

## Backend & Data

- **Neon PostgreSQL** - Serverless database via `@neondatabase/serverless`
- **Netlify Blobs** - Serverless key-value storage
- **Netlify Functions** - Serverless API endpoints

## Deployment

- **Netlify** - Hosting platform with edge functions
- **@astrojs/netlify** - Astro adapter for Netlify deployment

## Testing

- **Vitest** - Unit testing framework
- **fast-check** - Property-based testing

## Common Commands

```bash
# Development
npm run dev              # Start dev server at localhost:4321
npm start                # Alias for dev

# Building
npm run build            # Build production site to ./dist/
npm run preview          # Preview production build locally

# Database
npm run db:migrate       # Run database migrations

# Testing
npm run test             # Run tests once
npm run test:watch       # Run tests in watch mode
```

## Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL` - Neon PostgreSQL connection string
- Netlify-specific variables are auto-injected in deployment
