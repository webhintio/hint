import { ResourceType } from '../types/resource-type';

/**
 * Check if it is a package with multiple resources.
 */
export const hasMultipleResources = (resource: any, type: ResourceType) => {
    // Only case with multiple resources is hints
    if (type === ResourceType.hint) {
        // In a simple hint, the property meta should exist.
        return !resource.meta;
    }
};
