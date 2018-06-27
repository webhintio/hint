import requestAsync from './request-async';

/** Request response in the json format from an endpoint */
export const requestJSONAsync = (uri: string, options: object): Promise<any> => {
    const params = Object.assign({
        json: true,
        uri
    }, options);

    return requestAsync(params);
};
