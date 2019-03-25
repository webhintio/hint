import { toLowerCaseArray } from '../misc/to-lowercase-array';

/** Returns a list of all the headers in `headerList` that are in `headers` sorted alphabetically. */
export const includedHeaders = (headers: object, headerList: string[] = []): string[] => {
    const result: string[] = [];
    const list: string[] = toLowerCaseArray(headerList);

    for (const key of Object.keys(headers)) {
        const lowercaseKey: string = key.toLowerCase();

        if (list.includes(lowercaseKey)) {
            result.push(lowercaseKey);
        }
    }

    const shortedResult: string[] = result.sort();

    return shortedResult;
};
