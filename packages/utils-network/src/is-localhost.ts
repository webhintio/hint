import { hasProtocol } from './has-protocol';

/** Convenience function to check if a resource is a local file. */
export const isLocalhost = (resource: string): boolean => {
    try {
        const url = new URL(resource);
        return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    } catch (e) {
        return false;
    }
};
