import { hasProtocol } from './has-protocol';

/** Convenience function to check if a resource is a data URI. */
export const isDataURI = (resource: string): boolean => {
    return hasProtocol(resource, 'data:');
};
