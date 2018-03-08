import * as path from 'path';

/** Lower cases all the items of `list`. */
export const toLowerCase = (list: Array<string>): Array<string> => {
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
 * Returns the name of the rule based in the folder structure.
 *
 * * `/something/another` --> ``
 * * `/something/rules/another/` --> `another`
 * * `/something/rules/another` --> `another`
 * * `/something/rules/rule-another` --> `another`
 * * `/something/rule-another/` --> `another`
 * * `/something/rule-another` --> `another`
 */
export const getRuleName = (dirname: string, packageName?: string): string => {
    const parts = dirname.split(path.sep);
    let ruleName = '';

    const normalize = (name) => {
        return name.replace('rule-', '');
    };

    for (let i = 0; i < parts.length; i++) {
        if (parts[i].startsWith('rule-') || (parts[i - 1] && parts[i - 1].startsWith('rules'))) {
            ruleName = normalize(parts[i]);

            return packageName ? `${packageName}/${ruleName}` : ruleName;
        }
    }

    return ruleName;
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
