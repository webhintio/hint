import {basename} from 'path';

/** Try to determine the resource's file name. */
export default (resource: string) => basename(resource);
