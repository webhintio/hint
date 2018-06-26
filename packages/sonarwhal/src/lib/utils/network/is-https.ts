import hasProtocol from './has-protocol';

/** Convenience function to check if a resource is served over HTTPS. */
export default (resource: string): boolean => {
    return hasProtocol(resource, 'https:');
};
