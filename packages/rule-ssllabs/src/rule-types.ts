export type SSLLabsEndpoint = {
    grade: string;
    serverName: string;
    details: { protocols: Array<string> };
};

export type SSLLabsEndpointDetail = {
    protocols: Array<any>;
};

export type SSLLabsOptions = {
    all: string;
    fromCache: boolean;
    host: string;
    maxAge: number;
};

export type SSLLabsResult = {
    endpoints: Array<SSLLabsEndpoint>;
};
