import { query } from './db';
import type { NavItem } from '../types';

export async function getNavigationStructure(): Promise<NavItem[]> {
    try {
        const rows = await query<NavItem>(
            `SELECT id, label, url, parent_id as "parentId", sort_order as "sortOrder", 
                    is_visible as "isVisible", icon, description
             FROM navigation
             WHERE is_visible = true
             ORDER BY sort_order ASC`
        );

        // Build hierarchical structure
        const navMap = new Map<number, NavItem>();
        const rootItems: NavItem[] = [];

        // First pass: create all items
        rows.forEach((row) => {
            navMap.set(row.id, { ...row, children: [] });
        });

        // Second pass: build hierarchy
        rows.forEach((row) => {
            const item = navMap.get(row.id)!;
            if (row.parentId) {
                const parent = navMap.get(row.parentId);
                if (parent) {
                    parent.children = parent.children || [];
                    parent.children.push(item);
                }
            } else {
                rootItems.push(item);
            }
        });

        return rootItems;
    } catch (error) {
        console.error('Failed to fetch navigation:', error);
        // Return default navigation structure as fallback
        return getDefaultNavigation();
    }
}

function getDefaultNavigation(): NavItem[] {
    return [
        {
            id: 1,
            label: '首页',
            url: '/',
            sortOrder: 1,
            isVisible: true,
        },
        {
            id: 2,
            label: '中心概况',
            url: '/about',
            sortOrder: 2,
            isVisible: true,
        },
        {
            id: 3,
            label: '实验教学',
            url: '/teaching',
            sortOrder: 3,
            isVisible: true,
        },
        {
            id: 4,
            label: '师资队伍',
            url: '/faculty',
            sortOrder: 4,
            isVisible: true,
        },
        {
            id: 5,
            label: '新闻动态',
            url: '/news',
            sortOrder: 5,
            isVisible: true,
        },
        {
            id: 6,
            label: '联系我们',
            url: '/contact',
            sortOrder: 6,
            isVisible: true,
        },
    ];
}
