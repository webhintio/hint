import { toLowerCaseArray } from './to-lowercase-array';
/**
 * Adds the items from  `includeArray` into `originalArray` and removes the ones from `ignoreArray`.
 *
 * Items of the arrays are always lowercased as well as the result.
 * This function doesn't modify `originalArray`.
 */
export const mergeIgnoreIncludeArrays = (originalArray: string[], ignoreArray: string[] = [], includeArray: string[] = []): string[] => {
    let result: string[] = toLowerCaseArray(originalArray);
    const include: string[] = toLowerCaseArray(includeArray);
    const ignore: string[] = toLowerCaseArray(ignoreArray);

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
