export type BlobParameterProps = {
    seed: number;
    size: number;
    edges: number;
    growth: number;
    name: string;
    colors: string[];
};

export type BlobProps = {
    svgPath: string;
    parameters: BlobParameterProps;
};

// University website types
export interface NavItem {
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

export interface BreadcrumbItem {
    label: string;
    url?: string;
}

export interface NewsItem {
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

export interface PaginationParams {
    page: number;
    pageSize: number;
    total: number;
}

export interface FacultyMember {
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
    createdAt: Date;
    updatedAt: Date;
}

export interface PageContent {
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

export interface Course {
    id: number;
    name: string;
    description: string;
    schedule: string;
    instructor: string;
    credits?: number;
    semester?: string;
    prerequisites?: string;
    objectives?: string;
    sortOrder: number;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Laboratory {
    id: number;
    name: string;
    location: string;
    equipment: string;
    openingHours: string;
    capacity?: number;
    description?: string;
    manager?: string;
    contactInfo?: string;
    sortOrder: number;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Resource {
    id: number;
    title: string;
    description?: string;
    downloadUrl: string;
    fileType?: string;
    fileSize?: string;
    category?: string;
    courseId?: number;
    sortOrder: number;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}
