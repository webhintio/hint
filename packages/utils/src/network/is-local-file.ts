import { hasProtocol } from './has-protocol';

/** Convenience function to check if a resource is a local file. */
export const isLocalFile = (resource: string): boolean => {
    return hasProtocol(resource, 'file:');
};
