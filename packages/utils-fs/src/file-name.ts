import { basename } from 'path';

/** Try to determine the resource's file name. */
export const fileName = (resource: string) => {
    return basename(resource);
};
