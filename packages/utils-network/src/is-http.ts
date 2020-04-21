import { hasProtocol } from './has-protocol';

/** Convenience function to check if a resource is served over HTTP. */
export const isHTTP = (resource: string): boolean => {
    return hasProtocol(resource, 'http:');
};
