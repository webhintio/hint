export const normalizeHeaders = (headers) => {
    if (headers) {
        return Object.keys(headers).reduce((result, key) => {
            result[key.toLowerCase()] = headers[key];

            return result;
        }, {});
    }

    return null;
};
