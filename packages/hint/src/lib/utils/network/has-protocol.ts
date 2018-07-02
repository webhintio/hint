import { URL } from 'url';

/** Convenience function to check if a resource uses a specific protocol. */
export default (resource: string, protocol: string): boolean => {
    return new URL(resource).protocol === protocol;
};
