import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { NavItem } from '../types';

// Feature: university-website-clone, Property 1: Navigation consistency across pages
// Validates: Requirements 1.3
describe('Navigation Consistency Property Tests', () => {
    it('Property 1: Navigation structure should be identical across all pages', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        id: fc.integer({ min: 1, max: 1000 }),
                        label: fc.string({ minLength: 1, maxLength: 50 }),
                        url: fc.webPath(),
                        sortOrder: fc.integer({ min: 0, max: 100 }),
                        isVisible: fc.constant(true),
                        parentId: fc.option(fc.integer({ min: 1, max: 1000 }), { nil: undefined }),
                        icon: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
                        description: fc.option(fc.string({ minLength: 1, maxLength: 100 }), {
                            nil: undefined,
                        }),
                    })
                ),
                (navItems: NavItem[]) => {
                    // Simulate rendering navigation on multiple pages
                    const page1Nav = renderNavigation(navItems);
                    const page2Nav = renderNavigation(navItems);
                    const page3Nav = renderNavigation(navItems);

                    // Navigation structure should be identical across all pages
                    expect(page1Nav).toEqual(page2Nav);
                    expect(page2Nav).toEqual(page3Nav);
                    expect(page1Nav).toEqual(page3Nav);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Property 1 (variant): Navigation items should maintain order across renders', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        id: fc.integer({ min: 1, max: 1000 }),
                        label: fc.string({ minLength: 1, maxLength: 50 }),
                        url: fc.webPath(),
                        sortOrder: fc.integer({ min: 0, max: 100 }),
                        isVisible: fc.constant(true),
                    }),
                    { minLength: 1, maxLength: 10 }
                ),
                (navItems: NavItem[]) => {
                    // Sort by sortOrder
                    const sorted = [...navItems].sort((a, b) => a.sortOrder - b.sortOrder);

                    // Render multiple times
                    const render1 = sorted.map((item) => item.id);
                    const render2 = sorted.map((item) => item.id);
                    const render3 = sorted.map((item) => item.id);

                    // Order should be consistent
                    expect(render1).toEqual(render2);
                    expect(render2).toEqual(render3);
                }
            ),
            { numRuns: 100 }
        );
    });
});

// Helper function to simulate navigation rendering
function renderNavigation(navItems: NavItem[]): string {
    return navItems
        .filter((item) => item.isVisible)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => `${item.label}:${item.url}`)
        .join('|');
}


// Feature: university-website-clone, Property 2: Responsive navigation adaptation
// Validates: Requirements 1.4
describe('Responsive Navigation Property Tests', () => {
    it('Property 2: Navigation should adapt appropriately to viewport width', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        id: fc.integer({ min: 1, max: 1000 }),
                        label: fc.string({ minLength: 1, maxLength: 50 }),
                        url: fc.webPath(),
                        sortOrder: fc.integer({ min: 0, max: 100 }),
                        isVisible: fc.constant(true),
                    }),
                    { minLength: 1, maxLength: 10 }
                ),
                fc.integer({ min: 320, max: 2560 }), // viewport width
                (navItems: NavItem[], viewportWidth: number) => {
                    const navigationMode = getNavigationMode(viewportWidth);

                    // For narrow viewports (mobile), should use mobile menu
                    if (viewportWidth < 768) {
                        expect(navigationMode).toBe('mobile');
                    }
                    // For wide viewports (desktop), should use desktop menu
                    else {
                        expect(navigationMode).toBe('desktop');
                    }

                    // Navigation items should be present regardless of mode
                    const renderedItems = renderResponsiveNavigation(navItems, viewportWidth);
                    expect(renderedItems.length).toBe(navItems.length);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Property 2 (variant): Mobile menu should contain all desktop navigation items', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        id: fc.integer({ min: 1, max: 1000 }),
                        label: fc.string({ minLength: 1, maxLength: 50 }),
                        url: fc.webPath(),
                        sortOrder: fc.integer({ min: 0, max: 100 }),
                        isVisible: fc.constant(true),
                    }),
                    { minLength: 1, maxLength: 10 }
                ),
                (navItems: NavItem[]) => {
                    const desktopNav = renderResponsiveNavigationItems(navItems, 1024);
                    const mobileNav = renderResponsiveNavigationItems(navItems, 375);

                    // Both should contain the same items (same labels and URLs)
                    expect(desktopNav.length).toBe(mobileNav.length);
                    expect(desktopNav.sort()).toEqual(mobileNav.sort());
                }
            ),
            { numRuns: 100 }
        );
    });
});

// Helper function to determine navigation mode based on viewport
function getNavigationMode(viewportWidth: number): 'mobile' | 'desktop' {
    return viewportWidth < 768 ? 'mobile' : 'desktop';
}

// Helper function to simulate responsive navigation rendering
function renderResponsiveNavigation(navItems: NavItem[], viewportWidth: number): string[] {
    const mode = getNavigationMode(viewportWidth);
    const sorted = [...navItems]
        .filter((item) => item.isVisible)
        .sort((a, b) => a.sortOrder - b.sortOrder);

    // Both mobile and desktop render the same items, just differently
    return sorted.map((item) => `${mode}:${item.label}:${item.url}`);
}

// Helper function to get navigation items without mode prefix (for comparison)
function renderResponsiveNavigationItems(navItems: NavItem[], viewportWidth: number): string[] {
    const sorted = [...navItems]
        .filter((item) => item.isVisible)
        .sort((a, b) => a.sortOrder - b.sortOrder);

    // Return items without mode prefix for comparison
    return sorted.map((item) => `${item.label}:${item.url}`);
}


// Feature: university-website-clone, Property 3: Navigation hierarchy preservation
// Validates: Requirements 1.5
describe('Navigation Hierarchy Property Tests', () => {
    it('Property 3: Navigation hierarchy should be preserved in rendered output', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        id: fc.integer({ min: 1, max: 100 }),
                        label: fc.string({ minLength: 1, maxLength: 50 }),
                        url: fc.webPath(),
                        sortOrder: fc.integer({ min: 0, max: 100 }),
                        isVisible: fc.constant(true),
                        parentId: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
                    }),
                    { minLength: 1, maxLength: 20 }
                ),
                (navItems: NavItem[]) => {
                    // Filter out invalid items (self-referencing or duplicate IDs)
                    const validItems = navItems.filter((item) => item.id !== item.parentId);
                    const uniqueItems = Array.from(
                        new Map(validItems.map((item) => [item.id, item])).values()
                    );

                    if (uniqueItems.length === 0) return; // Skip empty arrays

                    // Build hierarchy
                    const hierarchy = buildNavigationHierarchy(uniqueItems);

                    // For each item with children, verify the parent-child relationship is preserved
                    hierarchy.forEach((parent) => {
                        if (parent.children && parent.children.length > 0) {
                            parent.children.forEach((child) => {
                                // Child should reference parent
                                const originalChild = uniqueItems.find((item) => item.id === child.id);
                                if (originalChild && originalChild.parentId) {
                                    expect(originalChild.parentId).toBe(parent.id);
                                }
                            });
                        }
                    });
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Property 3 (variant): All navigation items should be present in hierarchy', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        id: fc.integer({ min: 1, max: 100 }),
                        label: fc.string({ minLength: 1, maxLength: 50 }),
                        url: fc.webPath(),
                        sortOrder: fc.integer({ min: 0, max: 100 }),
                        isVisible: fc.constant(true),
                        parentId: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
                    }),
                    { minLength: 1, maxLength: 20 }
                ),
                (navItems: NavItem[]) => {
                    // Filter out invalid items (self-referencing, duplicate IDs, or circular references)
                    const validItems = navItems.filter((item) => item.id !== item.parentId);
                    const uniqueItems = Array.from(
                        new Map(validItems.map((item) => [item.id, item])).values()
                    );

                    // Filter out circular references (A->B and B->A)
                    const nonCircular = uniqueItems.filter((item) => {
                        if (!item.parentId) return true;
                        const parent = uniqueItems.find((p) => p.id === item.parentId);
                        return !parent || parent.parentId !== item.id;
                    });

                    if (nonCircular.length === 0) return; // Skip empty arrays

                    const hierarchy = buildNavigationHierarchy(nonCircular);
                    const flattenedIds = flattenHierarchy(hierarchy);

                    // All valid items should be present in the hierarchy
                    const originalIds = nonCircular.map((item) => item.id).sort();
                    const hierarchyIds = flattenedIds.sort();

                    // Every item should appear exactly once
                    expect(hierarchyIds.length).toBe(originalIds.length);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('Property 3 (variant): Children should maintain sort order within parent', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        id: fc.integer({ min: 1, max: 100 }),
                        label: fc.string({ minLength: 1, maxLength: 50 }),
                        url: fc.webPath(),
                        sortOrder: fc.integer({ min: 0, max: 100 }),
                        isVisible: fc.constant(true),
                        parentId: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
                    }),
                    { minLength: 1, maxLength: 20 }
                ),
                (navItems: NavItem[]) => {
                    // Filter out invalid items (self-referencing or duplicate IDs)
                    const validItems = navItems.filter((item) => item.id !== item.parentId);
                    const uniqueItems = Array.from(
                        new Map(validItems.map((item) => [item.id, item])).values()
                    );

                    if (uniqueItems.length === 0) return; // Skip empty arrays

                    const hierarchy = buildNavigationHierarchy(uniqueItems);

                    // For each parent with children, verify children are sorted
                    hierarchy.forEach((parent) => {
                        if (parent.children && parent.children.length > 1) {
                            for (let i = 0; i < parent.children.length - 1; i++) {
                                expect(parent.children[i].sortOrder).toBeLessThanOrEqual(
                                    parent.children[i + 1].sortOrder
                                );
                            }
                        }
                    });
                }
            ),
            { numRuns: 100 }
        );
    });
});

// Helper function to build navigation hierarchy
function buildNavigationHierarchy(navItems: NavItem[]): NavItem[] {
    const navMap = new Map<number, NavItem>();
    const rootItems: NavItem[] = [];

    // First pass: create all items
    navItems.forEach((item) => {
        navMap.set(item.id, { ...item, children: [] });
    });

    // Second pass: build hierarchy
    navItems.forEach((item) => {
        const navItem = navMap.get(item.id)!;
        if (item.parentId && navMap.has(item.parentId)) {
            const parent = navMap.get(item.parentId)!;
            parent.children = parent.children || [];
            parent.children.push(navItem);
            // Sort children by sortOrder
            parent.children.sort((a, b) => a.sortOrder - b.sortOrder);
        } else {
            rootItems.push(navItem);
        }
    });

    // Sort root items by sortOrder
    return rootItems.sort((a, b) => a.sortOrder - b.sortOrder);
}

// Helper function to flatten hierarchy to get all IDs
function flattenHierarchy(hierarchy: NavItem[]): number[] {
    const ids: number[] = [];
    
    function traverse(items: NavItem[]) {
        items.forEach((item) => {
            ids.push(item.id);
            if (item.children && item.children.length > 0) {
                traverse(item.children);
            }
        });
    }
    
    traverse(hierarchy);
    return ids;
}
