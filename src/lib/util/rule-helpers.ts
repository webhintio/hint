import * as path from 'path';

export const getIncludedHeaders = (headers: object = {}, headerList: Array<string> = []) => {
    const result = [];

    for (const [key] of Object.entries(headers)) {
        if (headerList.includes(key.toLowerCase())) {
            result.push(key);
        }
    }

    return result;
};

export const getRuleName = (dirname: string) => {
    return path.basename(dirname);
};

export const mergeIgnoreIncludeArrays = (originalArray: Array<string> = [], ignoreArray: Array<string> = [], includeArray: Array<string> = []) => {

    let result = originalArray.map((e) => {
        return e.toLowerCase();
    });

    const include = includeArray.map((e) => {
        return e.toLowerCase();
    });

    const ignore = ignoreArray.map((e) => {
        return e.toLowerCase();
    });

    // Add elements specified under 'include'.
    include.forEach((e) => {
        if (!result.includes(e)) {
            result.push(e);
        }
    });

    // Remove elements specified under 'ignore'.
    result = result.filter((e) => {
        return !ignore.includes(e);
    });

    return result;

};
