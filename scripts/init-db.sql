-- Database initialization script for University Website
-- This script creates all necessary tables and indexes

-- News table: stores news articles and announcements
CREATE TABLE IF NOT EXISTS news (
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

-- Indexes for news table
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);

-- Faculty table: stores faculty member information
CREATE TABLE IF NOT EXISTS faculty (
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

-- Indexes for faculty table
CREATE INDEX IF NOT EXISTS idx_faculty_category ON faculty(category);
CREATE INDEX IF NOT EXISTS idx_faculty_sort_order ON faculty(sort_order);

-- Page content table: stores dynamic page content
CREATE TABLE IF NOT EXISTS page_content (
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

-- Index for page content table
CREATE INDEX IF NOT EXISTS idx_page_content_slug ON page_content(slug);

-- Navigation table: stores site navigation structure
CREATE TABLE IF NOT EXISTS navigation (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    parent_id INTEGER REFERENCES navigation(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    icon VARCHAR(50),
    description TEXT
);

-- Indexes for navigation table
CREATE INDEX IF NOT EXISTS idx_navigation_parent ON navigation(parent_id);
CREATE INDEX IF NOT EXISTS idx_navigation_sort_order ON navigation(sort_order);
