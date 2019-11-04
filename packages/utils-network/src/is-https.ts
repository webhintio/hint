import { hasProtocol } from './has-protocol';

/** Convenience function to check if a resource is served over HTTPS. */
export const isHTTPS = (resource: string): boolean => {
    return hasProtocol(resource, 'https:');
};
