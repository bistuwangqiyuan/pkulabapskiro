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
