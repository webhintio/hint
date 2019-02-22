import hasProtocol from './has-protocol';

/** Convenience function to check if a resource is served over HTTP. */
export default (resource: string): boolean => hasProtocol(resource, 'http:');
