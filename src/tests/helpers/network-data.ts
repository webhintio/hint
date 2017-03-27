import { NetworkData } from '../../lib/types'; // eslint-disable-line no-unused-vars
import { readFile } from '../../lib/util/misc';

export const networkDataWithStatusCode200: NetworkData = {
    request: { headers: null },
    response: {
        body: null,
        headers: null,
        statusCode: 200,
        url: null
    }
};

export const createNetworkData = (configs: object): NetworkData => {
    return Object.assign({}, networkDataWithStatusCode200, configs);
};

export const networkDataWithStatusCode404: NetworkData = createNetworkData({ response: { statusCode: 404 }});
export const networkDataWithStatusCode500: NetworkData = createNetworkData({ response: { statusCode: 500 }});

export const createNetworkDataFromFile = (target: string): NetworkData => {
    return createNetworkData({
        response: {
            body: readFile(target),
            url: target
        }
    });
};

export const createNetworkDataFromText = (body: string = '', url: string = 'https://example.com/test.html'): NetworkData => {
    return createNetworkData({
        response: {
            body,
            url
        }
    });
};
