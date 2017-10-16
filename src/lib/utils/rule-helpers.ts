import * as path from 'path';

/** Lower cases all the items of `list`. */
const toLowerCase = (list: Array<string>): Array<string> => {
    return list.map((e) => {
        return e.toLowerCase();
    });
};

/** Returns a list of all the headers in `headerList` that are in `headers` sorted alphabetically. */
export const getIncludedHeaders = (headers: object, headerList: Array<string> = []): Array<string> => {
    const result: Array<string> = [];
    const list: Array<string> = toLowerCase(headerList);

    for (const key of Object.keys(headers)) {
        const lowercaseKey: string = key.toLowerCase();

        if (list.includes(lowercaseKey)) {
            result.push(lowercaseKey);
        }
    }

    const shortedResult: Array<string> = result.sort();

    return shortedResult;
};

/**
 * Returns the name of the folder for a given `dirname`.
 *
 * * `/something/another` --> `another`
 * * `/something/another/` --> `another`
 */
export const getRuleName = (dirname: string): string => {
    return path.basename(dirname);
};

/**
 * Adds the items from  `includeArray` into `originalArray` and removes the ones from `ignoreArray`.
 *
 * Items of the arrays are always lowercased as well as the result.
 * This function doesn't modify `originalArray`.
 */
export const mergeIgnoreIncludeArrays = (originalArray: Array<string>, ignoreArray: Array<string> = [], includeArray: Array<string> = []): Array<string> => {
    let result: Array<string> = toLowerCase(originalArray);
    const include: Array<string> = toLowerCase(includeArray);
    const ignore: Array<string> = toLowerCase(ignoreArray);

    // Add elements specified under 'include'.
    include.forEach((e: string) => {
        if (!result.includes(e)) {
            result.push(e);
        }
    });

    // Remove elements specified under 'ignore'.
    result = result.filter((e: string) => {
        return !ignore.includes(e);
    });

    return result;
};
