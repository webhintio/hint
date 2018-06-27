import * as requireUncached from 'require-uncached';

/** Loads a JavaScript file. */
export default (filePath: string): any => {

    return requireUncached(filePath);
};
