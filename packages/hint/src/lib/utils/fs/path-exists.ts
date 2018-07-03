import { test } from 'shelljs';

/** Check if a path exists */
export default (pathString: string): boolean => {
    return test('-e', pathString);
};
