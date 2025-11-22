# Design Document

## Overview

本系统是一个基于 Astro 框架的大学计算机学院网站，采用静态站点生成（SSG）和服务器端渲染（SSR）混合架构。网站复刻北京大学计算机实验教学中心的栏目结构和布局设计，同时应用北京信息科技大学计算机学院的品牌色调、内容和图片。系统使用 Neon PostgreSQL 数据库存储动态内容，部署在 Netlify 平台，利用其 CDN 和边缘函数功能实现高性能和全球可用性。

## Architecture

### System Architecture

系统采用 Jamstack 架构模式：

```
┌─────────────────────────────────────────────────────────────┐
│                        用户浏览器                              │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Netlify CDN                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Static Pages │  │ Edge Functions│  │ API Routes   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────┬────────────────────┬───────────────────┘
                     │                     │
                     │                     ▼
                     │            ┌─────────────────┐
                     │            │ Neon PostgreSQL │
                     │            │    Database     │
                     │            └─────────────────┘
                     ▼
            ┌─────────────────┐
            │  Static Assets  │
            │ (Images, CSS,   │
            │   JS bundles)   │
            └─────────────────┘
```

### Technology Stack

- **Frontend Framework**: Astro 5.x with React integration
- **Styling**: Tailwind CSS 4.x
- **Database**: Neon PostgreSQL (serverless)
- **Database Client**: @neondatabase/serverless
- **Deployment**: Netlify with SSR adapter
- **Language**: TypeScript
- **Markdown Processing**: marked + marked-shiki for syntax highlighting

### Rendering Strategy

1. **Static Generation (SSG)**: 用于不经常变化的页面（关于我们、规章制度等）
2. **Server-Side Rendering (SSR)**: 用于动态内容页面（新闻列表、新闻详情、师资队伍等）
3. **API Routes**: 用于内容管理和数据操作

## Components and Interfaces

### Page Components

#### Layout Components

1. **BaseLayout.astro**

   - 基础页面布局，包含 HTML 结构、meta 标签、全局样式
   - Props: `title: string`, `description?: string`, `keywords?: string`

2. **Header.astro**

   - 网站头部，包含 logo、主导航菜单
   - 响应式设计，移动端显示汉堡菜单
   - Props: `currentPath: string`

3. **Footer.astro**

   - 网站底部，包含版权信息、联系方式、友情链接
   - Props: 无

4. **Sidebar.astro**
   - 侧边栏组件，用于显示二级导航或相关内容
   - Props: `items: NavItem[]`, `currentPath: string`

#### Content Components

1. **NewsCard.astro**

   - 新闻卡片组件，显示新闻标题、摘要、日期、缩略图
   - Props: `news: NewsItem`

2. **NewsList.astro**

   - 新闻列表组件，包含分页功能
   - Props: `news: NewsItem[]`, `currentPage: number`, `totalPages: number`

3. **FacultyCard.astro**

   - 教师卡片组件，显示教师照片、姓名、职称、研究方向
   - Props: `faculty: FacultyMember`

4. **FacultyGrid.astro**

   - 教师网格布局组件
   - Props: `faculty: FacultyMember[]`, `category?: string`

5. **Breadcrumb.astro**

   - 面包屑导航组件
   - Props: `items: BreadcrumbItem[]`

6. **Pagination.astro**
   - 分页组件
   - Props: `currentPage: number`, `totalPages: number`, `baseUrl: string`

#### Utility Components

1. **ImageOptimizer.astro**

   - 图片优化组件，支持响应式图片和懒加载
   - Props: `src: string`, `alt: string`, `width?: number`, `height?: number`, `loading?: 'lazy' | 'eager'`

2. **MarkdownRenderer.astro**
   - Markdown 内容渲染组件
   - Props: `content: string`

### API Endpoints

#### News API

- `GET /api/news` - 获取新闻列表（支持分页和筛选）
- `GET /api/news/[id]` - 获取单条新闻详情
- `POST /api/news` - 创建新闻（需要认证）
- `PUT /api/news/[id]` - 更新新闻（需要认证）
- `DELETE /api/news/[id]` - 删除新闻（需要认证）

#### Faculty API

- `GET /api/faculty` - 获取教师列表（支持分类筛选）
- `GET /api/faculty/[id]` - 获取单个教师详情
- `POST /api/faculty` - 创建教师信息（需要认证）
- `PUT /api/faculty/[id]` - 更新教师信息（需要认证）
- `DELETE /api/faculty/[id]` - 删除教师信息（需要认证）

#### Content API

- `GET /api/content/[slug]` - 获取页面内容
- `PUT /api/content/[slug]` - 更新页面内容（需要认证）

#### Revalidation API

- `POST /api/revalidate` - 触发内容重新验证和缓存清除

## Data Models

### Database Schema

#### News Table

```sql
CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    thumbnail_url VARCHAR(500),
    author VARCHAR(100),
    category VARCHAR(50),
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    tags TEXT[]
);

CREATE INDEX idx_news_published_at ON news(published_at DESC);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_slug ON news(slug);
```

#### Faculty Table

```sql
CREATE TABLE faculty (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    title VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    photo_url VARCHAR(500),
    email VARCHAR(100),
    phone VARCHAR(50),
    office VARCHAR(100),
    research_interests TEXT[],
    education TEXT,
    biography TEXT,
    publications TEXT,
    projects TEXT,
    awards TEXT,
    sort_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_faculty_category ON faculty(category);
CREATE INDEX idx_faculty_sort_order ON faculty(sort_order);
```

#### Page Content Table

```sql
CREATE TABLE page_content (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    meta_description TEXT,
    meta_keywords TEXT,
    sidebar_content TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100)
);

CREATE INDEX idx_page_content_slug ON page_content(slug);
```

#### Navigation Table

```sql
CREATE TABLE navigation (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    parent_id INTEGER REFERENCES navigation(id),
    sort_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    icon VARCHAR(50),
    description TEXT
);

CREATE INDEX idx_navigation_parent ON navigation(parent_id);
CREATE INDEX idx_navigation_sort_order ON navigation(sort_order);
```

### TypeScript Interfaces

```typescript
interface NewsItem {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  thumbnailUrl?: string;
  author?: string;
  category?: string;
  publishedAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  viewCount: number;
  tags?: string[];
}

interface FacultyMember {
  id: number;
  name: string;
  nameEn?: string;
  title: string;
  category: string;
  photoUrl?: string;
  email?: string;
  phone?: string;
  office?: string;
  researchInterests?: string[];
  education?: string;
  biography?: string;
  publications?: string;
  projects?: string;
  awards?: string;
  sortOrder: number;
  isVisible: boolean;
}

interface PageContent {
  id: number;
  slug: string;
  title: string;
  content: string;
  metaDescription?: string;
  metaKeywords?: string;
  sidebarContent?: string;
  updatedAt: Date;
  updatedBy?: string;
}

interface NavItem {
  id: number;
  label: string;
  url: string;
  parentId?: number;
  sortOrder: number;
  isVisible: boolean;
  icon?: string;
  description?: string;
  children?: NavItem[];
}

interface BreadcrumbItem {
  label: string;
  url?: string;
}

interface PaginationParams {
  page: number;
  pageSize: number;
  total: number;
}
```

##

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Navigation and Structure Properties

Property 1: Navigation consistency across pages
_For any_ page in the website, the navigation structure should be identical to all other pages
**Validates: Requirements 1.3**

Property 2: Responsive navigation adaptation
_For any_ viewport width, the navigation should adapt appropriately (desktop menu for wide viewports, mobile menu for narrow viewports)
**Validates: Requirements 1.4**

Property 3: Navigation hierarchy preservation
_For any_ navigation item with children, the hierarchical relationship should be maintained in the rendered output
**Validates: Requirements 1.5**

### Database and Content Properties

Property 4: Content storage round trip
_For any_ page content object with all fields populated, storing it to the database and then retrieving it should produce an equivalent object
**Validates: Requirements 3.3**

Property 5: Content retrieval and rendering
_For any_ content stored in the database, retrieving and rendering it should display all stored fields correctly
**Validates: Requirements 3.4**

Property 6: News retrieval consistency
_For any_ news article stored in the database, the system should be able to retrieve it with all fields intact
**Validates: Requirements 4.3**

Property 7: News chronological ordering
_For any_ set of news items with different publication dates, displaying them should result in reverse chronological order (newest first)
**Validates: Requirements 4.4**

Property 8: Faculty data retrieval consistency
_For any_ faculty member stored in the database, the system should retrieve all their information correctly
**Validates: Requirements 5.3**

Property 9: Faculty categorization
_For any_ set of faculty members with different categories, displaying them should group members by their assigned categories
**Validates: Requirements 5.4**

Property 10: Faculty search filtering
_For any_ search query applied to faculty data, all returned results should match the search criteria
**Validates: Requirements 5.5**

Property 11: Teaching content retrieval
_For any_ experimental teaching content stored in the database, the system should retrieve it correctly
**Validates: Requirements 6.2**

Property 12: Course information completeness
_For any_ course object, rendering it should include all required fields (name, description, schedule, instructor)
**Validates: Requirements 6.3**

Property 13: Laboratory information completeness
_For any_ laboratory object, rendering it should include all required fields (location, equipment, opening hours)
**Validates: Requirements 6.4**

Property 14: Resource download availability
_For any_ downloadable resource, a valid download link should be present in the rendered output
**Validates: Requirements 6.5**

### Performance and Optimization Properties

Property 15: Image optimization
_For any_ image processed by the system, it should be optimized for web delivery (compressed, properly sized)
**Validates: Requirements 8.3**

Property 16: Image lazy loading
_For any_ image below the fold, it should have the lazy loading attribute set
**Validates: Requirements 8.4**

### Accessibility Properties

Property 17: Semantic HTML usage
_For any_ page rendered by the system, it should use semantic HTML elements appropriately (header, nav, main, article, footer, etc.)
**Validates: Requirements 9.1**

Property 18: Image alt text presence
_For any_ image displayed on the website, it should have a descriptive alt attribute
**Validates: Requirements 9.2**

Property 19: Keyboard navigation support
_For any_ interactive element (links, buttons, form inputs), it should be accessible via keyboard navigation
**Validates: Requirements 9.4**

Property 20: ARIA label presence
_For any_ element requiring ARIA labels for accessibility, the appropriate ARIA attributes should be present
**Validates: Requirements 9.5**

### API Properties

Property 21: API input validation
_For any_ API request with invalid input data, the system should reject it before performing database operations
**Validates: Requirements 10.4**

Property 22: API response correctness
_For any_ API request, the response should include appropriate HTTP status codes and error messages when applicable
**Validates: Requirements 10.5**

## Error Handling

### Database Error Handling

1. **Connection Errors**

   - Implement retry logic with exponential backoff for transient connection failures
   - Display user-friendly error messages when database is unavailable
   - Log detailed error information for debugging
   - Fallback to cached content when possible

2. **Query Errors**

   - Validate all SQL queries before execution
   - Handle constraint violations gracefully
   - Return appropriate error codes for different failure types
   - Implement transaction rollback for failed operations

3. **Data Validation Errors**
   - Validate all input data before database operations
   - Return detailed validation error messages
   - Sanitize user input to prevent SQL injection

### API Error Handling

1. **Request Validation**

   - Validate request body schema
   - Check required fields
   - Validate data types and formats
   - Return 400 Bad Request with detailed error messages

2. **Authentication/Authorization Errors**

   - Return 401 Unauthorized for missing/invalid credentials
   - Return 403 Forbidden for insufficient permissions
   - Implement rate limiting to prevent abuse

3. **Resource Not Found**

   - Return 404 Not Found for non-existent resources
   - Provide helpful error messages with suggestions

4. **Server Errors**
   - Return 500 Internal Server Error for unexpected failures
   - Log detailed error information
   - Never expose sensitive information in error responses

### Frontend Error Handling

1. **Network Errors**

   - Display user-friendly error messages for failed requests
   - Implement retry mechanisms for transient failures
   - Show loading states during async operations

2. **Rendering Errors**

   - Implement error boundaries to catch rendering errors
   - Display fallback UI when components fail
   - Log errors for monitoring

3. **404 Pages**
   - Create custom 404 page with navigation back to home
   - Suggest related content or search functionality

## Testing Strategy

### Unit Testing

The system will use **Vitest** as the testing framework for unit tests. Unit tests will focus on:

1. **Utility Functions**

   - Database connection utilities
   - Data transformation functions
   - Validation functions
   - URL slug generation

2. **API Endpoints**

   - Test each CRUD operation endpoint
   - Test error handling for invalid inputs
   - Test authentication/authorization logic

3. **Component Logic**

   - Test data fetching logic
   - Test conditional rendering logic
   - Test event handlers

4. **Edge Cases**
   - Empty data sets
   - Null/undefined values
   - Boundary conditions (e.g., pagination at limits)

### Property-Based Testing

The system will use **fast-check** as the property-based testing library for JavaScript/TypeScript. Property-based tests will verify universal properties across many randomly generated inputs.

**Configuration Requirements:**

- Each property-based test MUST run a minimum of 100 iterations
- Each property-based test MUST be tagged with a comment referencing the correctness property from this design document
- Tag format: `// Feature: university-website-clone, Property {number}: {property_text}`
- Each correctness property MUST be implemented by a SINGLE property-based test

**Property Test Coverage:**

1. **Navigation Properties** (Properties 1-3)

   - Generate random page structures and verify navigation consistency
   - Generate random viewport sizes and verify responsive behavior
   - Generate random navigation hierarchies and verify structure preservation

2. **Database Properties** (Properties 4-14)

   - Generate random content objects and verify round-trip consistency
   - Generate random news items and verify chronological ordering
   - Generate random faculty data and verify categorization
   - Generate random search queries and verify filtering

3. **Optimization Properties** (Properties 15-16)

   - Generate random images and verify optimization
   - Generate random page layouts and verify lazy loading

4. **Accessibility Properties** (Properties 17-20)

   - Generate random page content and verify semantic HTML
   - Generate random images and verify alt text presence
   - Generate random interactive elements and verify keyboard accessibility
   - Generate random components and verify ARIA labels

5. **API Properties** (Properties 21-22)
   - Generate random valid and invalid API requests
   - Verify input validation rejects invalid data
   - Verify responses have correct status codes

### Integration Testing

Integration tests will verify the interaction between components:

1. **Database Integration**

   - Test full CRUD workflows
   - Test transaction handling
   - Test connection pooling

2. **API Integration**

   - Test end-to-end API workflows
   - Test authentication flow
   - Test error propagation

3. **Page Rendering**
   - Test SSR rendering with database data
   - Test static page generation
   - Test dynamic route handling

### End-to-End Testing

While not part of the core implementation tasks, E2E tests can be added later using Playwright to test:

- User navigation flows
- Form submissions
- Search functionality
- Responsive behavior

## Database Connection

### Connection Configuration

```typescript
// src/lib/db.ts
import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.DATABASE_URL);

export async function query<T>(queryText: string, params?: any[]): Promise<T[]> {
  try {
    const result = await sql(queryText, params);
    return result as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Database operation failed');
  }
}

export async function queryOne<T>(queryText: string, params?: any[]): Promise<T | null> {
  const results = await query<T>(queryText, params);
  return results[0] || null;
}
```

### Environment Variables

Required environment variables in `.env`:

```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

For Netlify deployment, set this in the Netlify dashboard under Site settings > Environment variables.

## Styling and Design System

### Color Palette (BISTU Theme)

Based on BISTU Computer Science College branding:

```css
:root {
  --primary-color: #0066cc; /* BISTU blue */
  --secondary-color: #003d7a; /* Dark blue */
  --accent-color: #ff6600; /* Orange accent */
  --text-primary: #333333;
  --text-secondary: #666666;
  --background: #ffffff;
  --background-alt: #f5f5f5;
  --border-color: #e0e0e0;
  --success: #28a745;
  --warning: #ffc107;
  --error: #dc3545;
}
```

### Typography

```css
:root {
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
  --font-size-2xl: 32px;
  --line-height-base: 1.6;
}
```

### Layout Grid

- Container max-width: 1200px
- Grid columns: 12-column system
- Gutter: 24px
- Breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

### Component Styling Patterns

1. **Cards**: Subtle shadow, rounded corners (8px), padding (24px)
2. **Buttons**: Primary (blue), Secondary (outlined), sizes (sm, md, lg)
3. **Forms**: Consistent input styling, clear labels, validation states
4. **Navigation**: Sticky header, dropdown menus, breadcrumbs
5. **Footer**: Multi-column layout, social links, copyright

## Deployment Configuration

### Netlify Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Build Optimization

1. **Image Optimization**: Use Astro's built-in image optimization
2. **Code Splitting**: Automatic with Astro
3. **CSS Purging**: Tailwind CSS automatically purges unused styles
4. **Minification**: Enabled in production builds
5. **Compression**: Netlify automatically serves gzip/brotli

## Security Considerations

1. **SQL Injection Prevention**: Use parameterized queries
2. **XSS Prevention**: Sanitize user input, use Content Security Policy
3. **CSRF Protection**: Implement CSRF tokens for state-changing operations
4. **Authentication**: Use secure session management (future enhancement)
5. **Environment Variables**: Never commit sensitive data to repository
6. **HTTPS**: Enforce HTTPS for all connections (Netlify default)
7. **Rate Limiting**: Implement rate limiting on API endpoints

## Performance Optimization

1. **Static Generation**: Pre-render static pages at build time
2. **Incremental Static Regeneration**: Use revalidation API for content updates
3. **Database Connection Pooling**: Neon handles this automatically
4. **CDN Caching**: Leverage Netlify CDN for static assets
5. **Image Optimization**: Responsive images with lazy loading
6. **Code Splitting**: Load only necessary JavaScript per page
7. **Font Optimization**: Use system fonts or preload custom fonts

## Future Enhancements

1. **Admin Dashboard**: Web-based content management interface
2. **Search Functionality**: Full-text search across all content
3. **Multilingual Support**: Chinese and English versions
4. **User Authentication**: Login system for students and faculty
5. **Analytics Integration**: Track page views and user behavior
6. **RSS Feeds**: Syndicate news and announcements
7. **Social Media Integration**: Share buttons and feeds
8. **Calendar Integration**: Events and academic calendar
9. **File Management**: Upload and manage documents
10. **Email Notifications**: Automated notifications for new content
